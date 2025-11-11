import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Delete,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventService } from '../../service/event.service';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { EventDto } from '../../dto/event.dto';
import { User } from 'src/features/user/schema/v2/user.schema';
import { CurrentUser } from 'src/features/auth/decorators/current-user.decorator';
import { CreateEventDto } from '../../dto/create-event.dto';
import { UpdateEventDto } from '../..//dto/update-event.dto';
import { MainCategoryDto } from '../../dto/services.dto';
import { EventTierDto } from '../../dto/event-tier.dto';
import { RatingReviewDto } from '../../dto/ratingReviews.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RetryPaymentDto } from '../../dto/retry-payment.dto';

@ApiTags('Event')
@Controller({
  path: 'api/event',
  version: '2',
})
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private eventService: EventService) {}

  @ApiResponse({
    status: 201,
    description: 'Event Successfully created',
    type: CreateEventDto,
  })
  @ApiOperation({ summary: 'Create new event' })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async create(@Body() body: CreateEventDto) {
    const event = await this.eventService.create(body);
    return event;
  }

  // Get current user events
  @ApiResponse({
    status: 200,
    description: 'Events Successfully retrieved',
    type: EventDto,
  })
  @ApiOperation({ summary: 'Get current user events' })
  @Get('my-events/:coordinatorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMyEvents(@Param('coordinatorId') coordinatorId: string) {
    const events = await this.eventService.getEventsByUserId(coordinatorId);
    return events;
  }

  @ApiResponse({
    status: 200,
    description: 'Events Successfully retrieved',
    type: EventDto,
  })
  @ApiOperation({ summary: 'Get my event details' })
  @Get('my-event-details/:eventId/:coordinatorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMyEventsDetails(
    @Param('coordinatorId') coordinatorId: string,
    @Param('eventId') eventId: string,
  ) {
    const events = await this.eventService.getMyEventsDetails(
      coordinatorId,
      eventId,
    );
    return events;
  }

  @ApiResponse({ status: 201, description: 'Event Followed success' })
  @ApiOperation({ summary: 'Follow event' })
  @Post('follow/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async follow(
    @CurrentUser() currentUser: User,
    @Body() body: { follow: boolean },
    @Param('id') eventId: string,
  ) {
    this.logger.debug('follow() - currentUser: ' + currentUser);

    let response: any;
    if (body.follow) {
      response = await this.eventService.followEvent(eventId, currentUser.id);
    } else {
      response = await this.eventService.unFollowEvent(eventId, currentUser.id);
    }

    return response;
  }

  @ApiResponse({
    status: 200,
    description: 'Events Successfully retrieved',
    type: EventDto,
  })
  @ApiOperation({ summary: 'Get all events' })
  @Get('all')
  async getAll(@Res() response) {
    const events = await this.eventService.getAll();
    return response.status(HttpStatus.OK).json(events);
  }

  @ApiResponse({
    status: 200,
    description: 'Events Successfully retrieved',
    type: EventDto,
  })
  @ApiOperation({ summary: 'Search events by query' })
  @Post('search')
  async findByRange(@Res() response, @Body() payload) {
    let events = [];

    const startDate = new Date().toISOString();
    const endDate = new Date(
      new Date(startDate).getTime() + 15 * 24 * 60 * 60 * 1000,
    ).toDateString();

    const searchCriteria = payload.searchCriteria;
    const latitude = payload.latitude;
    const longitude = payload.longitude;

    if (latitude && longitude) {
      events = await this.eventService.findEventsByLocation(
        searchCriteria,
        latitude,
        longitude,
      );
    } else {
      // Find events in Cape Town, South Africa
      events = await this.eventService.findEventsByCity(searchCriteria);
    }

    return response.status(HttpStatus.OK).json(events);
  }

  @ApiResponse({
    status: 200,
    description: 'Upcoming events successfully retrieved',
    type: [EventDto],
  })
  @ApiOperation({ summary: 'Get upcoming events' })
  @Get('upcoming-events')
  async getUpcomingEvents(@Res() response) {
    this.logger.debug('getUpcomingEvents()');

    const events = await this.eventService.getUpcomingEvents();
    const limitedEvents = events.slice(0, 10); // Limit to 10 events

    return response.status(HttpStatus.OK).json(limitedEvents);
  }

  @ApiResponse({
    status: 200,
    description: 'Fetch services Successfully',
    type: MainCategoryDto,
  })
  @ApiOperation({ summary: 'Get services' })
  @Get('get-services')
  async getServices() {
    return this.eventService.getServices();
  }

  @ApiResponse({
    status: 200,
    description: 'Event Successfully updated',
    type: UpdateEventDto,
  })
  @ApiOperation({ summary: 'Update event by id' })
  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    this.logger.debug(
      'updateEvent() - id: ' +
        id +
        ', payload: ' +
        JSON.stringify(updateEventDto),
    );
    return await this.eventService.update(id, updateEventDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Create services Successfully',
    type: MainCategoryDto,
  })
  @ApiOperation({ summary: 'Create services' })
  @Post('create-services')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async createServices(@Body() mainCategoryDto: MainCategoryDto) {
    return await this.eventService.createServices(mainCategoryDto);
  }

  @ApiResponse({ status: 200, description: 'Add tier for event' })
  @ApiOperation({ summary: 'Add tier for event seeder' })
  @Post('create-tier-event')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async createTierEvent(@Body() eventTierDto: EventTierDto) {
    return await this.eventService.createTierEvent(eventTierDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Get all tiers for event',
    type: [EventTierDto],
  })
  @ApiOperation({ summary: 'Get all tiers for event' })
  @Get('get-tiers')
  async getTiers() {
    const tiers = this.eventService.getEventTiers();
    return tiers;
  }

  @ApiResponse({
    status: 200,
    description: 'Event Successfully retrieved',
    type: EventDto,
  })
  @ApiOperation({ summary: 'Retrieve event by id' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    const event = await this.eventService
      .getEventById(id)
      .populate('userId', '-password');

    return event;
  }

  @ApiResponse({
    status: 200,
    description: 'Reviews Successfully added',
  })
  @ApiOperation({ summary: 'Add review for event' })
  @Post('add-review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async addReview(@Body() body: RatingReviewDto) {
    const review = await this.eventService.addReview(body);

    return review;
  }

  @ApiResponse({
    status: 200,
    description: 'Reviews Successfully retrieved',
    type: [RatingReviewDto],
  })
  @ApiOperation({ summary: 'Get reviews for event' })
  @Get('get-reviews/:eventId')
  async getReviews(@Param('eventId') eventId: string) {
    const reviews = await this.eventService.getReviews(eventId);
    return reviews;
  }

  @ApiResponse({
    status: 200,
    description: 'Reviews Successfully retrieved',
    type: [RatingReviewDto],
  })
  @ApiOperation({ summary: 'Get reviews for coordinator' })
  @Get('get-coordinator-reviews/:coordinatorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getReviewsForCoordinator(@Param('coordinatorId') coordinatorId: string) {
    const reviews = await this.eventService.getReviewsForCoordinator(coordinatorId);
    return reviews;
  }


  @ApiResponse({
    status: 200,
    description: 'Event payment status retrieved successfully',
  })
  @ApiOperation({ summary: 'Get event payment status' })
  @Get('payment-status/:eventId')
  async getEventPaymentStatus(@Param('eventId') eventId: string) {
    return await this.eventService.getEventPaymentStatus(eventId);
  }

  @ApiResponse({
    status: 200,
    description: 'Payment retry link generated successfully',
  })
  @ApiOperation({ 
    summary: 'Retry payment for an event',
    description: 'Generate a new payment link for an event that previously failed payment'
  })
  @ApiBody({
    type: RetryPaymentDto,
    description: 'Payment retry configuration with optional redirect URLs'
  })
  @Post('retry-payment/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async retryEventPayment(
    @Param('eventId') eventId: string,
    @Body() body: RetryPaymentDto
  ) {
    return await this.eventService.retryEventPayment(eventId, body.returnUrl, body.cancelUrl);
  }

}
