import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { 
  Event, 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventResponse 
} from '../models/event.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { EventsResponse } from '../models/events-response';

@Injectable({
  providedIn: 'root'
})
export class EventManagementService {
  private eventsSubject = new BehaviorSubject<Event[]>(this.getDummyEvents());
  public events$ = this.eventsSubject.asObservable();

    private readonly ADMIN_URL = environment.apiUrl + '/superadmin';

  constructor(
    private http: HttpClient,
  ) {}

  getAllEvents(): Observable<EventsResponse> {
    return this.http.get<EventsResponse>(`${this.ADMIN_URL}/events`);
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
      map(events => events.find(event => event._id === id) || null)
    );
  }

  // Create new event
  createEvent(eventData: CreateEventRequest): Observable<EventResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const newEvent: Event = {
          _id: this.generateId(),
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

  // Create event from static payload.json (development helper)
  createEventFromPayload(): Observable<any> {
    const url = 'http://localhost:4000/v2/api/event/create';
    return this.http.get<any>('assets/payload.json').pipe(
      switchMap(payload => this.http.post<any>(url, payload))
    );
  }

  // Fetch sample payload.json (for auto-fill in forms)
  getSamplePayload(): Observable<any> {
    return this.http.get<any>('assets/payload.json');
  }

  // Create event using a provided payload object
  createEventWithPayload(payload: any): Observable<any> {
    const url = 'http://localhost:4000/v2/api/event/create';
    return this.http.post<any>(url, payload);
  }

  // Update existing event
  updateEvent(id: string, eventData: UpdateEventRequest): Observable<EventResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const currentEvents = this.eventsSubject.value;
        const eventIndex = currentEvents.findIndex(event => event._id === id);

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
  deleteEvent(id: string): Observable<any> {
    const url = `${this.ADMIN_URL}/event/${id}`;
    return this.http.delete<any>(url);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getDummyEvents(): Event[] {
    return [
      {
        _id: '1',
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