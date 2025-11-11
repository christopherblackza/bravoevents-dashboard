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
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

    private readonly ADMIN_URL = environment.apiUrl + '/superadmin';
    private readonly baseUrl = 'http://localhost:4000/v2/api/event';

  constructor(
    private http: HttpClient,
  ) {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.getAllEvents().subscribe(response => {
      console.error('RESPONSE', response);
      this.eventsSubject.next(response.items);
    });
  }

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
  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.ADMIN_URL}/events/${id}/normalised`);
  }



  // Create new event
  createEvent(eventData: CreateEventRequest): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.baseUrl}/create`, eventData);
  }

  // Create event from static payload.json (development helper)
  createEventFromPayload(): Observable<any> {
    return this.http.get<any>('assets/payload.json').pipe(
      switchMap(payload => this.http.post<any>(`${this.baseUrl}/create`, payload))
    );
  }

  // Fetch sample payload.json (for auto-fill in forms)
  getSamplePayload(): Observable<any> {
    return this.http.get<any>('assets/payload.json');
  }

  // Create event using a provided payload object
  createEventWithPayload(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, payload);
  }

  // Update existing event
  updateEvent(id: string, eventData: UpdateEventRequest): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${this.baseUrl}/update/${id}`, eventData);
  }

  // Delete event
  deleteEvent(id: string): Observable<any> {
    const url = `${this.ADMIN_URL}/events/${id}`;
    return this.http.delete<any>(url);
  }
}