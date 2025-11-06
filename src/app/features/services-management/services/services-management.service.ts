import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Service, CreateServiceRequest, UpdateServiceRequest } from '../models/service.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicesManagementService {
   private readonly API_URL = `${environment.apiUrl}/v2/api`;
  private dummyServices: Service[] = [
    {
      "_id": { "$oid": "6854131669f9e0657c33db08" },
      "name": "Permits & Applications",
      "type": "permitsAndApplications",
      "subCategories": [
        {
          "name": "Event Application",
          "type": "eventApplication",
          "leafCategories": [],
          "_id": { "$oid": "685a89316bb33b415cca58a4" }
        },
        {
          "name": "Traffic Application",
          "type": "trafficApplication",
          "leafCategories": [],
          "_id": { "$oid": "685a89316bb33b415cca58a5" }
        },
        {
          "name": "Amplified sound / Noise exemption",
          "type": "amplifiedSoundNoiseExemption",
          "leafCategories": [],
          "_id": { "$oid": "685a89316bb33b415cca58a6" }
        },
        {
          "name": "Structures / Tent / Constructions",
          "type": "structuresTentConstructions",
          "leafCategories": [],
          "_id": { "$oid": "685a89316bb33b415cca58a7" }
        }
      ],
      "__v": 0
    },
    {
      "_id": { "$oid": "6854131669f9e0657c33db09" },
      "name": "Entertainment Services",
      "type": "entertainmentServices",
      "subCategories": [
        {
          "name": "DJ Services",
          "type": "djServices",
          "leafCategories": [],
          "_id": { "$oid": "685a89316bb33b415cca58a8" }
        },
        {
          "name": "Live Music",
          "type": "liveMusic",
          "leafCategories": [],
          "_id": { "$oid": "685a89316bb33b415cca58a9" }
        }
      ],
      "__v": 0
    },
    {
      "_id": { "$oid": "6854131669f9e0657c33db10" },
      "name": "Catering Services",
      "type": "cateringServices",
      "subCategories": [
        {
          "name": "Food Catering",
          "type": "foodCatering",
          "leafCategories": [],
          "_id": { "$oid": "685a89316bb33b415cca58b0" }
        },
        {
          "name": "Beverage Services",
          "type": "beverageServices",
          "leafCategories": [],
          "_id": { "$oid": "685a89316bb33b415cca58b1" }
        }
      ],
      "__v": 0
    }
  ];

  constructor(
    private http: HttpClient,
  ) { }

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.API_URL}/event/get-services`);
  }

  getServiceById(id: string): Observable<Service | undefined> {
    const service = this.dummyServices.find(s => s._id.$oid === id);
    return of(service).pipe(delay(300));
  }

  createService(serviceData: CreateServiceRequest): Observable<Service> {
    const newService: Service = {
      _id: { $oid: this.generateId() },
      name: serviceData.name,
      type: serviceData.type,
      subCategories: serviceData.subCategories.map(sub => ({
        ...sub,
        _id: { $oid: this.generateId() },
        leafCategories: sub.leafCategories.map(leaf => ({
          ...leaf,
          _id: { $oid: this.generateId() }
        }))
      })),
      __v: 0
    };

    this.dummyServices.push(newService);
    return of(newService).pipe(delay(500));
  }

  updateService(serviceData: UpdateServiceRequest): Observable<Service> {
    const index = this.dummyServices.findIndex(s => s._id.$oid === serviceData._id.$oid);
    if (index !== -1) {
      const updatedService: Service = {
        ...serviceData,
        subCategories: serviceData.subCategories.map(sub => ({
          ...sub,
          _id: sub._id || { $oid: this.generateId() },
          leafCategories: sub.leafCategories.map(leaf => ({
            ...leaf,
            _id: leaf._id || { $oid: this.generateId() }
          }))
        })),
        __v: this.dummyServices[index].__v
      };
      this.dummyServices[index] = updatedService;
      return of(updatedService).pipe(delay(500));
    }
    throw new Error('Service not found');
  }

  deleteService(id: string): Observable<boolean> {
    const index = this.dummyServices.findIndex(s => s._id.$oid === id);
    if (index !== -1) {
      this.dummyServices.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 24);
  }
}