import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FacilityModuleConfigurationService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }
  getFacilityConfigurationList(): Observable<any> {
    return this.http.get(`${this.baseURL}/config-facility/getAll`);
  }
  postFacilities(data: any): Observable<any> {
    return this.http.post(
      `${this.baseURL}/config-facility/save`,
      data
    );
  }

}
