import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncounterService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  /**
  * Post encounter
  * @param {any} json - Payload for post encounter
  * @return {Observable<any>}
  */
  postEncounter(json): Observable<any> {
    const url = `${this.baseURL}/encounter`;
    return this.http.post(url, json);
  }

  /**
  * Post observation
  * @param {any} json - Payload for post observattion
  * @return {Observable<any>}
  */
  postObs(json): Observable<any> {
    const url = `${this.baseURL}/obs`;
    return this.http.post(url, json);
  }
  /**
  * Post observation
  * @param {any} json - Payload for post observattion
  * @return {Observable<any>}
  */
  searchMedicine(term): Observable<any> {
    const url = `${this.baseURL}/drug?q=${term}&v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))`;
    return this.http.get(url);
  }
  /**
  * Post observation
  * @param {any} json - Payload for post observattion
  * @return {Observable<any>}
  */
  getDrugType(): Observable<any> {
    const url = `${this.baseURL}/orderentryconfig`;
    return this.http.get(url);
  }
  getTestList(): Observable<any> {
    const url = `${this.baseURL}/concept/67b78549-10bd-476b-bd40-094b52249b49`;
    return this.http.get(url);
  }
  /**
  * Post observation
  * @param {any} json - Payload for post observattion
  * @return {Observable<any>}
  */
  addMedicine(data:any): Observable<any> {
    const url = `${this.baseURL}/order`;
    return this.http.post(url,data);
  }
  addEncounter(data:any): Observable<any> {
    const url = `${this.baseURL}/encounter`;
    return this.http.post(url,data);
  }
}
