import { Injectable, Logger, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Event } from '../schema/event.schema';
import { EventTier } from '../schema/tier.schema';
import { Service } from '../schema/service.schema';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { User } from 'src/features/user/schema/v2/user.schema';
import { MainCategoryDto } from '../dto/services.dto';
import {
  ServiceBid,
  ServiceBidDocument,
} from '../../service-bids/schema/service-bid.schema';
import {
  VendorOnBoarding,
  VendorOnBoardingDocument,
} from '../../vendor-on-boarding/schema/vendor-on-boarding.schema';
import { EventTierDto } from '../dto/event-tier.dto';
import { UserSeatsBooking } from '../../user-seats-booking/schema/user-seats-booking.schema';
import { RatingReviewDto } from '../dto/ratingReviews.dto';
import { RatingReview } from '../schema/ratingReview.schema';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PayfastService } from '../../payfast/payfast.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(EventTier.name) private eventTierModel: Model<EventTier>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ServiceBid.name)
    private serviceBidModel: Model<ServiceBidDocument>,
    @InjectModel(VendorOnBoarding.name)
    private vendorOnboardingModel: Model<VendorOnBoardingDocument>,
    @InjectModel(UserSeatsBooking.name)
    private userSeatsBookingModel: Model<UserSeatsBooking>,
    @InjectModel(RatingReview.name)
    private ratingReviewModel: Model<RatingReview>,
    private payfastService: PayfastService,
    private notificationsService: NotificationsService,
  ) {}

  getEventByName(name: string) {
    const username = { $regex: new RegExp(`^${name}$`, 'i') };

    return this.eventModel.findOne({ username });
  }

  getUserBy(filter: FilterQuery<Event>) {
    return this.eventModel.findOne(filter);
  }

  getEventById(id: ObjectId | string) {
    return this.eventModel.findById(id);
  }

  async getEventsByUserId(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const user = await this.userModel.findById(userObjectId);

    if (!user) {
      throw new BadRequestException(`User with ID ${userObjectId} not found X`);
    }

    const events = await this.eventModel
      .find({ userId: userId })
      .populate('userId', '-password');

    return events;
  }

  async create(body: CreateEventDto) {
    console.log("BODY: ", body);
    const userObjectId = new Types.ObjectId(body.userId);
    const user = await this.userModel.findById(userObjectId);

    if (!user) {
      throw new BadRequestException(`User with ID ${userObjectId} not found Y`);
    }

    // Use servicePrice and adminFee from frontend
    const servicePrice = body.servicePrice || 0;
    const adminFee = body.adminFee || 500;
    const totalPrice = servicePrice + adminFee;

    // Recursively convert all mainCategoryId and subCategoryId fields to ObjectId
    function convertCategoryIdsToObjectId(obj: any) {
      if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (val && typeof val === 'object') {
            if (
              'mainCategoryId' in val &&
              typeof val.mainCategoryId === 'string'
            ) {
              try {
                val.mainCategoryId = new Types.ObjectId(val.mainCategoryId);
              } catch (e) {}
            }
            if (
              'subCategoryId' in val &&
              typeof val.subCategoryId === 'string'
            ) {
              try {
                val.subCategoryId = new Types.ObjectId(val.subCategoryId);
              } catch (e) {}
            }
            if (
              'leafCategoryId' in val &&
              typeof val.leafCategoryId === 'string'
            ) {
              try {
                val.leafCategoryId = new Types.ObjectId(val.leafCategoryId);
              } catch (e) {}
            }
            if (
              'leafCategoryIds' in val &&
              Array.isArray(val.leafCategoryIds)
            ) {
              val.leafCategoryIds = val.leafCategoryIds.map((id: any) => {
                try {
                  return new Types.ObjectId(id);
                } catch (e) {
                  return id;
                }
              });
            }
            if (Array.isArray(val)) {
              for (const item of val) {
                convertCategoryIdsToObjectId(item);
              }
            } else {
              convertCategoryIdsToObjectId(val);
            }
          }
        }
      }
    }

    // Convert in all relevant fields
    const serviceFields = [
      'permissions',
      'infrastructure',
      'decoration',
      'sanitation',
      'safety',
      'camping',
      'beveragesBarServices',
      'brandingPromotionDto',
      'accreditationEntryDto',
      'staffingSupportDto',
      'transport',
      'vendorsStalls'
    ];

    for (const field of serviceFields) {
      if (body[field]) {
        convertCategoryIdsToObjectId(body[field]);
      }
    }

    // Create event with payment information from frontend
    const eventData = {
      ...body,
      servicePrice,
      adminFee,
      paymentStatus: 'pending' as const,
    };

    const event = new this.eventModel(eventData);
    const result = await event.save();

    // Generate PayFast payment URL using URLs from frontend
    const paymentUrl = this.payfastService.generatePaymentUrl({
      bookingId: result._id.toString(),
      amount: totalPrice,
      eventName: body.title,
      returnUrl:
        `${process.env.FRONTEND_URL}/events/${result._id}/payment-success`,
      cancelUrl:
        `${process.env.FRONTEND_URL}/events/${result._id}/payment-cancelled`,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
    console.log("PAYMENT URL: ", paymentUrl)

    // --- Bidding Logic ---
    // Helper to extract all mainCategoryId and subCategoryId pairs from event services
    function extractCategoryPairs(obj: any): {
      mainCategoryId: Types.ObjectId;
      subCategoryId: Types.ObjectId;
      leafCategoryId?: Types.ObjectId;
    }[] {
      if (obj['vendor'] === true) {
        return [];
      }
      const pairs: {
        mainCategoryId: Types.ObjectId;
        subCategoryId: Types.ObjectId;
        leafCategoryId?: Types.ObjectId;
      }[] = [];
      if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (val && typeof val === 'object') {
            // Check if this specific object has vendor: true - skip it entirely
            if (val['vendor'] === true) {
              continue;
            }
            if ('mainCategoryId' in val && 'subCategoryId' in val) {
              try {
                const base = {
                  mainCategoryId: new Types.ObjectId(val.mainCategoryId),
                  subCategoryId: new Types.ObjectId(val.subCategoryId),
                } as any;
                if (val.leafCategoryId) {
                  base.leafCategoryId = new Types.ObjectId(val.leafCategoryId);
                }
                pairs.push(base);
              } catch (e) {}
            }
            // If it's an array, check each item
            if (Array.isArray(val)) {
              for (const item of val) {
                // Check if this specific item has vendor: true - skip it entirely
                if (
                  item &&
                  typeof item === 'object' &&
                  item['vendor'] === true
                ) {
                  continue;
                }
                if (
                  item &&
                  typeof item === 'object' &&
                  'mainCategoryId' in item &&
                  'subCategoryId' in item
                ) {
                  try {
                    const base = {
                      mainCategoryId: new Types.ObjectId(item.mainCategoryId),
                      subCategoryId: new Types.ObjectId(item.subCategoryId),
                    } as any;
                    if (item.leafCategoryId) {
                      base.leafCategoryId = new Types.ObjectId(
                        item.leafCategoryId,
                      );
                    }
                    pairs.push(base);
                  } catch (e) {}
                }
                // Recursively check deeper
                pairs.push(...extractCategoryPairs(item));
              }
            } else {
              // Recursively check deeper
              pairs.push(...extractCategoryPairs(val));
            }
          }
        }
      }
      return pairs;
    }

    // Collect category pairs from all relevant event fields
    const categoryPairs: {
      mainCategoryId: Types.ObjectId;
      subCategoryId: Types.ObjectId;
      leafCategoryId?: Types.ObjectId;
    }[] = [];
    for (const field of serviceFields) {
      if (body[field]) {
        categoryPairs.push(...extractCategoryPairs(body[field]));
      }
    }

    // Remove duplicates
    const uniquePairs = Array.from(
      new Set(
        categoryPairs.map(
          (p) =>
            `${p.mainCategoryId.toString()}:${p.subCategoryId.toString()}:${p.leafCategoryId ? p.leafCategoryId.toString() : 'null'}`,
        ),
      ),
    ).map((str) => {
      const [mainCategoryId, subCategoryId, leafCategoryIdStr] = str.split(':');
      return {
        mainCategoryId: new Types.ObjectId(mainCategoryId),
        subCategoryId: new Types.ObjectId(subCategoryId),
        leafCategoryId:
          leafCategoryIdStr && leafCategoryIdStr !== 'null'
            ? new Types.ObjectId(leafCategoryIdStr)
            : undefined,
      };
    });

    // Find all vendors whose onboarding service matches any of the event's main/subcategories
    for (const pair of uniquePairs) {
      const vendorQuery: any = {
        service: {
          $elemMatch: {
            mainCategoryId: pair.mainCategoryId,
            subCategories: {
              $elemMatch: {
                subCategoryId: pair.subCategoryId,
                isActive: true,
                ...(pair.leafCategoryId
                  ? {
                      leafCategories: {
                        $elemMatch: {
                          leafCategoryId: pair.leafCategoryId,
                          isActive: true,
                        },
                      },
                    }
                  : {}),
              },
            },
          },
        },
      };

      const vendors = await this.vendorOnboardingModel.find(vendorQuery);

      for (const vendor of vendors) {
        const imageUrl = vendor?.service?.find(
          (s) => s.mainCategoryId.toString() === pair.mainCategoryId.toString(),
        )?.imageUrls;

        await this.serviceBidModel.create({
          eventId: result._id,
          mainCategoryId: pair.mainCategoryId,
          subCategoryId: pair.subCategoryId,
          leafCategoryId: pair.leafCategoryId,
          vendorId: vendor.userId,
          eventCoordinatorId: userObjectId,
          status: 'pending',
          price: null,
          imageUrl: imageUrl || null,
          bidType: 'service',
          payment_status: 'pending',
          paymentReference: '',
          paidBy: 'coordinator',
        });
      }
    }

    if (body?.vendorsStalls) {
      const { stalls, catering } = body.vendorsStalls as any;
      console.log('Stalls before: ', stalls);

      // Helper: safe ObjectId conversion
      const toObjectId = (value: any) => {
        try {
          if (!value) return undefined as unknown as Types.ObjectId;
          return value instanceof Types.ObjectId
            ? value
            : new Types.ObjectId(value);
        } catch (e) {
          return undefined as unknown as Types.ObjectId;
        }
      };

      // Handle Catering as a normal service bid
      if (catering && catering.vendor !== true) {
        const cateringMain = toObjectId(catering.mainCategoryId);
        const cateringSub = toObjectId(catering.subCategoryId);

        if (cateringMain && cateringSub) {
          const vendorQuery: any = {
            service: {
              $elemMatch: {
                mainCategoryId: cateringMain,
                subCategories: {
                  $elemMatch: {
                    subCategoryId: cateringSub,
                    isActive: true,
                  },
                },
              },
            },
          };

          const vendors = await this.vendorOnboardingModel.find(vendorQuery);

          for (const vendor of vendors) {
            const imageUrl = vendor?.service?.find(
              (s) => s.mainCategoryId.toString() === cateringMain.toString(),
            )?.imageUrls;

            await this.serviceBidModel.create({
              eventId: result._id,
              mainCategoryId: cateringMain,
              subCategoryId: cateringSub,
              vendorId: vendor.userId,
              eventCoordinatorId: userObjectId,
              status: 'pending',
              price: null,
              imageUrl: imageUrl || null,
              bidType: 'service',
              payment_status: 'pending',
              paymentReference: '',
              paidBy: 'coordinator',
            });
          }
        }
      }

      // Handle Stalls as stall-type bids
      if (stalls) {
        console.log('Stalls after: ', stalls);
        const stallEntries: any[] = [
          stalls.food,
          stalls.accessories,
          stalls.artsAndCrafts,
          stalls.vape,
        ].filter(Boolean);

        console.log('Stall entries: ', stallEntries);

        for (const stall of stallEntries) {
          if (!stall || stall.vendor === true) continue;

          const mainId = toObjectId(stall.mainCategoryId);
          const subId = toObjectId(stall.subCategoryId);
          const leafId = toObjectId(stall.leafCategoryId);

          if (!mainId || !subId) continue;

          const vendorQuery: any = {
            service: {
              $elemMatch: {
                mainCategoryId: mainId,
                subCategories: {
                  $elemMatch: {
                    subCategoryId: subId,
                    isActive: true,
                    ...(leafId
                      ? {
                          leafCategories: {
                            $elemMatch: {
                              leafCategoryId: leafId,
                              isActive: true,
                            },
                          },
                        }
                      : {}),
                  },
                },
              },
            },
          };

          const vendors = await this.vendorOnboardingModel.find(vendorQuery);

          for (const vendor of vendors) {
            const imageUrl = vendor?.service?.find(
              (s) => s.mainCategoryId.toString() === mainId.toString(),
            )?.imageUrls;

            await this.serviceBidModel.create({
              eventId: result._id,
              mainCategoryId: mainId,
              subCategoryId: subId,
              leafCategoryId: leafId || undefined,
              vendorId: vendor.userId,
              eventCoordinatorId: userObjectId,
              status: 'pending',
              price: null,
              imageUrl: imageUrl || null,
              bidType: 'stall',
              payment_status: 'pending',
              paymentReference: '',
              paidBy: 'vendor',
            });
          }
        }
      }
    }

    if (!body.isEventVenue && body?.venueServiceId) {
      const vendorQuery: any = {
        service: {
          $elemMatch: {
            mainCategoryId: new Types.ObjectId(body?.venueServiceId),
          },
        },
      };

      const vendors = await this.vendorOnboardingModel.find(vendorQuery);

      for (const vendor of vendors) {
        const imageUrl = vendor?.service?.find(
          (s) => s.mainCategoryId.toString() === body.venueServiceId.toString(),
        )?.imageUrls;

        await this.serviceBidModel.create({
          eventId: result._id,
          mainCategoryId: new Types.ObjectId(body.venueServiceId),
          vendorId: vendor.userId,
          eventCoordinatorId: userObjectId,
          status: 'pending',
          price: null,
          imageUrl: imageUrl,
          bidType: 'venue',
          payment_status: 'pending',
          paymentReference: '',
          paidBy: 'coordinator',
        });
      }
    }

    // --- End Bidding Logic ---

    // Collect vendor-bid mappings for targeted notifications
    const vendorBidMap: Array<{ vendorId: string; bidId: string }> = [];

    // Get all bids created for this event
    const bids = await this.serviceBidModel.find({ eventId: result._id });
    
    for (const bid of bids) {
      vendorBidMap.push({
        vendorId: bid.vendorId.toString(),
        bidId: bid._id.toString()
      });
    }

    // Notify specific vendors about the new event for bidding
    try {
      await this.notificationsService.notifyVendorsForNewEvent(
        result._id.toString(),
        result.title,
        result.eventDescription,
        result.date,
        vendorBidMap
      );
    } catch (error) {
      this.logger.error('Failed to notify vendors about new event:', error);
    }

    return {
      event: result,
      payment: {
        servicePrice,
        adminFee,
        totalPrice,
        paymentUrl,
        paymentStatus: 'pending',
      },
    };
  }

  async getAll() {
    const events = await this.eventModel
      .find({
        paymentStatus: 'paid',
      })
      .populate('userId', '-password');

    return events;
  }

  async getUpcomingEvents() {
    const currentTimestamp = Math.floor(Date.now()); // Current time in epoch mili seconds

    const events = await this.eventModel
      .find({ date: { $gte: currentTimestamp }, paymentStatus: 'paid' })
      .limit(10)
      .populate('userId', '-password');
    return events;
  }

  followEvent(eventId: string, userId: string) {
    const userObectId = new Types.ObjectId(userId);

    return this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $push: { followers: userObectId },
        },
        { new: true },
      )
      .populate('userId', '-password');
  }

  unFollowEvent(eventId: string, userId: string) {
    const userObectId = new Types.ObjectId(userId);

    // Remove user from followers array
    return this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $pull: { followers: userObectId },
        },
        { new: true },
      )
      .populate('userId', '-password');
  }

  async findEventsByCity(searchText) {
    let query: any = {};

    // Check if searchText is provided, then include regex search in the query
    if (searchText) {
      const queryRegex = new RegExp(searchText, 'i');
      query.$or = [{ name: queryRegex }, { location: queryRegex }];
    }

    // Add query if start date and date

    let pipeline: PipelineStage[] = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [18.417396, -33.928992] }, // Cape Town, South Africa
          distanceField: 'dist.calculated',
          maxDistance: 450000, // 450km
          query: searchText ? query : {},
          includeLocs: 'dist.location',
          spherical: false,
        },
      },
    ];

    return await this.eventModel.aggregate(pipeline);
  }

  async findEventsByLocation(
    searchText: string,
    lat: string,
    lng: string,
    range?: number,
    startDate?: string,
    endDate?: string,
  ) {
    let query: any = {};

    // Check if startDate and endDate are provided, then construct the date range query
    if (startDate && endDate) {
      const startDateISO = new Date(startDate);
      const endDateISO = new Date(endDate);
      query.$and = [
        { date: { $gte: startDateISO } }, // Start date greater than or equal to specified start date
        { date: { $lte: endDateISO } }, // End date less than or equal to specified end date
      ];
    }

    // Check if searchText is provided, then include regex search in the query
    if (searchText) {
      const queryRegex = new RegExp(searchText, 'i');
      query.$or = [{ title: queryRegex }, { location: queryRegex }];
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Add query if start date and date

    let pipeline: PipelineStage[] = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'dist.calculated',
          maxDistance: range ?? 450000, // 450km
          query: searchText ? query : {},
          includeLocs: 'dist.location',
          spherical: true,
        },
      },
    ];

    return await this.eventModel.aggregate(pipeline).exec();
  }

  async searchEvents(query: string) {
    const queryRegex = new RegExp(query, 'i');

    const events = await this.eventModel
      .find({
        $or: [{ name: queryRegex }, { location: queryRegex }],
      })
      .populate('userId', '-password');

    return events;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const updatedEvent = await this.eventModel.findByIdAndUpdate(id, updateEventDto, { new: true });
    
    if (updatedEvent) {
      // Send notification to coordinator about event update
      try {
        await this.notificationsService.sendEventUpdatedNotification(
          updatedEvent.userId.toString(),
          updatedEvent.title,
          updatedEvent._id.toString()
        );
      } catch (error) {
        this.logger.error('Failed to send event update notification:', error);
      }
    }
    
    return updatedEvent;
  }

  async createServices(mainCategoryDto: MainCategoryDto) {
    function assignIds(obj: any) {
      if (Array.isArray(obj)) {
        obj.forEach(assignIds);
      } else if (obj && typeof obj === 'object') {
        if ('subCategories' in obj && Array.isArray(obj.subCategories)) {
          obj.subCategories.forEach((subCat: any) => {
            if (!subCat._id) subCat._id = new Types.ObjectId();
            if (
              'leafCategories' in subCat &&
              Array.isArray(subCat.leafCategories)
            ) {
              subCat.leafCategories.forEach((leaf: any) => {
                if (!leaf._id) leaf._id = new Types.ObjectId();
              });
            }
          });
        }
      }
    }
    assignIds(mainCategoryDto);
    // Helper to recursively assign ObjectIds
    return this.serviceModel.create(mainCategoryDto);
  }

  async getServices() {
    return this.serviceModel.find();
  }

  async createTierEvent(eventTierDto: EventTierDto) {
    const existingTier = await this.eventTierModel.find();

    if (existingTier.length > 0) {
      return existingTier; // Return existing tiers if they already exist
    }

    const tier = [
      {
        name: 'Platinum',
        description: 'Buy Platinum Tickets',
        type: 'VIP',
      },
      {
        name: 'Gold',
        description: 'Buy Gold Tickets',
        type: 'Premium',
      },
      {
        name: 'Silver',
        description: 'Buy Silver Tickets',
        type: 'Standard',
      },
    ];

    // Create a new EventTier document
    const eventTier = await this.eventTierModel.insertMany(tier);

    // Return the created EventTier document
    return eventTier;
  }
  async getEventTiers() {
    const response = await this.eventTierModel.find();

    if (!response || response.length === 0) {
      throw new BadRequestException('No tiers found');
    }

    return response;
  }

  async getMyEventsDetails(coordinatorId: string, eventId: string) {
    const coordinatorObjectId = new Types.ObjectId(coordinatorId);
    const eventObjectId = new Types.ObjectId(eventId);

    const coordinator = await this.userModel.findById(coordinatorObjectId);

    if (!coordinator) {
      throw new BadRequestException(
        `Coordinator with ID ${coordinatorObjectId} not found`,
      );
    }

    if (!eventObjectId || !Types.ObjectId.isValid(eventObjectId)) {
      throw new BadRequestException(`Invalid event ID: ${eventId}`);
    }

    const eventExists = await this.eventModel.findOne({
      _id: eventObjectId,
      userId: coordinatorObjectId,
    });

    if (!eventExists) {
      throw new BadRequestException(
        `Event with ID ${eventId} not found for coordinator ${coordinatorId}`,
      );
    }

    const event = await this.eventModel
      .findOne({ _id: eventObjectId, userId: coordinatorObjectId })
      .select({
        title: 1,
        eventDescription: 1,
        startDate: 1,
        endDate: 1,
        location: 1,
        eventLogo: 1,
        date: 1,
        startTime: 1,
        endTime: 1,
        seatingArrangement: 1,
        rating: 1,
      });

    if (!event) {
      throw new BadRequestException(`Event with ID ${eventObjectId} not found`);
    }

    // Booking aggregation for seated events
    const seating = event.seatingArrangement?.seatedEvent;
    let bookingSummary = null;
    if (seating && seating.totalSeats && seating.seatingTiers) {
      // All seat numbers (start from 1)
      const allSeats = Array.from(
        { length: seating.totalSeats },
        (_, i) => i + 1,
      );
      // Gather all assigned seats from all tiers, shifting up by 1 if needed
      const assignedSeats = seating.seatingTiers.reduce(
        (acc: number[], tier: any) => {
          if (tier.selectedSeats)
            acc.push(...tier.selectedSeats.map((s: number) => s + 1));
          return acc;
        },
        [],
      );
      // Standard seats: seats not assigned to any tier
      const standardSeats = allSeats.filter(
        (seat) => !assignedSeats.includes(seat),
      );
      // Fetch all successful bookings for this event
      const bookings = await this.userSeatsBookingModel.find({
        eventId: eventObjectId,
        paymentStatus: 'success',
      });
      // Prepare tier summary for assigned tiers
      const tierSummaries = seating.seatingTiers.map((tier: any) => {
        let booked = 0;
        bookings.forEach((booking: any) => {
          booking.seatSelections.forEach((sel: any) => {
            if (sel.ticketTierName === tier.name) {
              booked += sel.numberOfSeats;
            }
          });
        });
        const totalSeats = tier.selectedSeats
          ? tier.selectedSeats.length
          : tier.totalSeats;
        return {
          tierName: tier.name,
          totalSeats,
          bookedSeats: booked,
          availableSeats: totalSeats - booked,
        };
      });
      // Add Standard tier if there are unassigned seats
      if (standardSeats.length > 0) {
        let booked = 0;
        bookings.forEach((booking: any) => {
          booking.seatSelections.forEach((sel: any) => {
            if (sel.ticketTierName === 'Standard') {
              booked += sel.numberOfSeats;
            }
          });
        });
        tierSummaries.push({
          tierName: 'Standard',
          totalSeats: standardSeats.length,
          bookedSeats: booked,
          availableSeats: standardSeats.length - booked,
        });
      }
      // Totals
      const totalSeats = seating.totalSeats;
      const totalBooked = tierSummaries.reduce(
        (sum, t) => sum + t.bookedSeats,
        0,
      );
      const totalAvailable = totalSeats - totalBooked;
      bookingSummary = {
        totalSeats,
        totalBooked,
        totalAvailable,
        tiers: tierSummaries,
      };
    }
    return { event, bookingSummary };
  }

  async addReview(ratingReviewDto: RatingReviewDto) {
    const { eventId, userId, rating, review } = ratingReviewDto;

    // Validate eventId and userId
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException(`Invalid event ID: ${eventId}`);
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }

    // Find the event
    const event = await this.eventModel.findById(eventId);

    if (!event) {
      throw new BadRequestException(`Event with ID ${eventId} not found`);
    }

    // Find the user
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found Z`);
    }

    const alreadyReviewed = await this.ratingReviewModel.findOne({
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
    });

    if (alreadyReviewed) {
      throw new BadRequestException('You have already reviewed this event');
    }

    // Create the review
    const reviewData = {
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
      coordinatorId: new Types.ObjectId(event.userId),
      rating,
      review,
      createdAt: new Date(),
    };

    // Save the review to the event's reviews array
    const newReview = new this.ratingReviewModel(reviewData);
    const response = await newReview.save();

    const eventReview = await this.ratingReviewModel.find({
      eventId: event._id,
    });

    // Calculate the average rating
    const totalRating =
      eventReview.length > 0
        ? eventReview.reduce((acc, review) => acc + review.rating, 0)
        : 0;
    const averageRating = totalRating / eventReview.length;

    const coordinatorReview = await this.ratingReviewModel.find({
      coordinatorId: event.userId,
    });

    const coordinatorRating =
      coordinatorReview.length > 0
        ? coordinatorReview.reduce((acc, review) => acc + review.rating, 0)
        : 0;
    const coordinatorAverageRating =
      coordinatorRating / coordinatorReview.length;

    const coordinator = await this.userModel.findById(event.userId);

    if (!coordinator) {
      throw new BadRequestException(
        `Coordinator with ID ${event.userId} not found`,
      );
    }

    coordinator.coordinatorRating = coordinatorAverageRating;
    await coordinator.save();

    event.rating = averageRating;
    await event.save();

    return {
      message: 'Review added successfully',
      review: response,
      totalRating: averageRating,
      totalReviews: eventReview.length,
    };
  }

  async getReviews(eventId: string) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException(`Invalid event ID: ${eventId}`);
    }

    const reviews = await this.ratingReviewModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .populate('userId', '-__v -password');

    const totalRating =
      reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0)
        : 0;

    const averageRating = totalRating / reviews.length;

    return {
      message: 'Reviews retrieved successfully',
      reviews,
      totalRating: averageRating,
      totalReviews: reviews.length,
    };
  }

  async getReviewsForCoordinator(coordinatorId: string) {
    if (!Types.ObjectId.isValid(coordinatorId)) {
      throw new BadRequestException(`Invalid event ID: ${coordinatorId}`);
    }

    const reviews = await this.ratingReviewModel
      .find({ coordinatorId: new Types.ObjectId(coordinatorId) })
      .populate('userId', '-__v -password');

    const totalRating =
      reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0)
        : 0;

    const averageRating = totalRating / reviews.length;

    return {
      message: 'Coordinator reviews retrieved successfully',
      reviews,
      totalRating: averageRating,
      totalReviews: reviews.length,
    };
  }

  async getEventPaymentStatus(eventId: string) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException(`Invalid event ID: ${eventId}`);
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return {
      eventId: event._id,
      title: event.title,
      paymentStatus: event.paymentStatus,
      servicePrice: event.servicePrice,
      adminFee: event.adminFee,
      totalPrice: (event.servicePrice || 0) + (event.adminFee || 0),
      paymentReference: event.paymentReference,
      paidAt: event.paidAt,
    };
  }

  async retryEventPayment(
    eventId: string,
    returnUrl?: string,
    cancelUrl?: string,
  ) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException(`Invalid event ID: ${eventId}`);
    }

    const event = await this.eventModel
      .findById(eventId)
      .populate('userId', '-password');
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Only allow retry if payment is still pending
    if (event.paymentStatus === 'paid') {
      throw new BadRequestException('Event payment has already been completed');
    }

    const user = event.userId as any;
    const totalPrice = (event.servicePrice || 0) + (event.adminFee || 0);

    // Generate new PayFast payment URL
    const paymentUrl = this.payfastService.generatePaymentUrl({
      bookingId: event._id.toString(),
      amount: totalPrice,
      eventName: event.title,
      returnUrl:
        returnUrl ||
        `${process.env.FRONTEND_URL}/events/${event._id}/payment-success`,
      cancelUrl:
        cancelUrl ||
        `${process.env.FRONTEND_URL}/events/${event._id}/payment-cancelled`,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
    console.log("PAYMENT URL: ", paymentUrl)

    return {
      eventId: event._id,
      title: event.title,
      payment: {
        servicePrice: event.servicePrice,
        adminFee: event.adminFee,
        totalPrice,
        paymentUrl: paymentUrl,
        paymentStatus: event.paymentStatus,
      },
    };
  }

}
