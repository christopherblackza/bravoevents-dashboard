import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  Event, 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventResponse 
} from '../models/event.models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventManagementService {
  private eventsSubject = new BehaviorSubject<Event[]>(this.getDummyEvents());
  public events$ = this.eventsSubject.asObservable();


    private readonly API_URL = 'http://localhost:3000/v2/api';

  constructor(
    private http: HttpClient,
  ) {}

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}/event/all`);
  }

  // Get all events
  getEvents(): Observable<EventResponse> {
    return this.events$.pipe(
      delay(500), // Simulate API delay
      map(events => ({
        success: true,
        data: events,
        message: 'Events retrieved successfully'
      }))
    );
  }

  // Get event by ID
  getEventById(id: string): Observable<Event | null> {
    return this.events$.pipe(
      delay(300),
      map(events => events.find(event => event.id === id) || null)
    );
  }

  // Create new event
  createEvent(eventData: CreateEventRequest): Observable<EventResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const newEvent: Event = {
          id: this.generateId(),
          followers: [],
          ...eventData
        };

        const currentEvents = this.eventsSubject.value;
        const updatedEvents = [...currentEvents, newEvent];
        this.eventsSubject.next(updatedEvents);

        return {
          success: true,
          data: newEvent,
          message: 'Event created successfully'
        };
      })
    );
  }

  // Update existing event
  updateEvent(id: string, eventData: UpdateEventRequest): Observable<EventResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const currentEvents = this.eventsSubject.value;
        const eventIndex = currentEvents.findIndex(event => event.id === id);

        if (eventIndex === -1) {
          return {
            success: false,
            data: null,
            message: 'Event not found'
          };
        }

        const updatedEvent: Event = {
          ...currentEvents[eventIndex],
          ...eventData
        };

        const updatedEvents = [...currentEvents];
        updatedEvents[eventIndex] = updatedEvent;
        this.eventsSubject.next(updatedEvents);

        return {
          success: true,
          data: updatedEvent,
          message: 'Event updated successfully'
        };
      })
    );
  }

  // Delete event
  deleteEvent(id: string): Observable<EventResponse> {
    return of(null).pipe(
      delay(600),
      map(() => {
        const currentEvents = this.eventsSubject.value;
        const eventExists = currentEvents.some(event => event.id === id);

        if (!eventExists) {
          return {
            success: false,
            data: null,
            message: 'Event not found'
          };
        }

        const updatedEvents = currentEvents.filter(event => event.id !== id);
        this.eventsSubject.next(updatedEvents);

        return {
          success: true,
          data: null,
          message: 'Event deleted successfully'
        };
      })
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getDummyEvents(): Event[] {
    return [
      {
        id: '1',
        userId: 'user123',
        title: 'Annual Tech Conference 2024',
        eventDescription: 'Test',
        eventImageUrls: [],
        date: new Date('2024-06-15'),
        startTime: '09:00',
        endTime: '17:00',
        followers: [],
        permissions: {
          eventApplication: { submitted: false},
          trafficApplication: { required: false, submissionIn: false},
          noiseExemption: { required: false},
          construction: { required: false, hasVendor: false}
        },
        infrastructure: {
          fencing: { vendor: false},
          scaffolding: { vendor: false},
          electricity: { generator: { vendor: true}, electrician: { vendor: true}},
          seatingAndTables: { vendor: true},
          stageLightingSoundScreens: {
            stage: { vendor: true},
            lighting: { vendor: true},
            sound: { vendor: true},
            screens: { vendor: true}
          }
        },
        requestTickets: false,
        isEventVenue: false,
        decoration: {
          decor: { vendor: true},
          lighting:  { vendor: true},
          layout:  { vendor: true},
          internet:  { vendor: true},
          entertainment:  { vendor: true}
        }
      }
    ];
  }
}