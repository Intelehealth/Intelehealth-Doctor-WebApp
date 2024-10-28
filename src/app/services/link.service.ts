import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LinkService {
  private baseURL = environment.mindmapURL;

  constructor(
    private http: HttpClient
  ) { }

  /**
  * Get shortened link
  * @param {string} hash - Get original link from hash
  * @return {Observable<any>}
  */
  getShortenedLink(hash): Observable<any> {
    return this.http.get(`${this.baseURL}/links/getLink/${hash}`);
  }

  /**
  * Shorten the prescription link
  * @param {string} link - Original link to be shorten
  * @return {Observable<any>}
  */
  shortUrl(link: string): Observable<any> {
    return this.http.post(`${this.baseURL}/links/shortLink`, ({ link } as any));
  }

  /**
  * Request otp for prescription
  * @param {string} hash - Hash of prescription link
  * @param {string} phoneNumber - Phone number
  * @return {Observable<any>}
  */
  requestPresctionOtp(hash, phoneNumber): Observable<any> {
    return this.http.post(`${this.baseURL}/links/requestOtp`, ({ hash, phoneNumber } as any));
  }

  /**
  * Verify otp for prescription
  * @param {any} hash - Hash of prescription link
  * @param {string} otp - Otp to be verified
  * @return {Observable<any>}
  */
  verifyPresctionOtp(hash, otp): Observable<any> {
    return this.http.post(`${this.baseURL}/links/verifyOtp`, ({ hash, otp } as any));
  }

  /**
  * get Facility Contact
  * @param {number} id - Id of Facility Contact
  * @return {Observable<any>}
  */
  getFacilityContact(id): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + environment.externalPrescriptionCred);
    return this.http.get(`${this.baseURL}/links/getFacilityContacts/${id}`, { headers });
  }
}
