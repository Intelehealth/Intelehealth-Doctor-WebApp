import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  base = environment.base;
  baseURL = environment.baseURL;
  mimeTypes = {
    JVBERi0: 'application/pdf',
    R0lGODdh: 'image/gif',
    R0lGODlh: 'image/gif',
    iVBORw0KGgo: 'image/png',
    '/9j/': 'image/jpg'
  };

  private profilePic: Subject<string> = new Subject<string>();
  profilePicUpdateEvent = this.profilePic.asObservable();

  constructor(private http: HttpClient) { }

  /**
  * Add/update provider attribute
  * @param {string} uuid - Provider uuid
  * @param {string} attributeTypeUuid - Provider attribute type uuid
  * @param {boolean} isExistingPresent - Record for provider attribute type already exists true/false
  * @param {boolean} existingUuid - Existing provider attribute record uuid
  * @return {Observable<any>}
  */
  updateProviderAttribute(uuid: string, attributeTypeUuid: string, attributeValue: string, isExistingPresent: boolean, existingUuid: string): Observable<any> {
    const URL = isExistingPresent ? `${this.baseURL}/provider/${uuid}/attribute/${existingUuid}`
      : `${this.baseURL}/provider/${uuid}/attribute`;
    const json = {
      attributeType: attributeTypeUuid,
      value: attributeValue,
      voided: false
    };
    return this.http.post(URL, json);
  }

  /**
  * Add/update person image
  * @param {Object} json - Payload to upload person image
  * @return {Observable<any>}
  */
  updateProfileImage(json: object): Observable<any> {
    const URL = `${this.baseURL}/personimage`;
    const header = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.post(URL, json, header);
  }

  /**
  * Create signature
  * @param {string} providerId - Provider uuid
  * @param {string} textOfSign - Signature text
  * @param {string} fontName - Font name to be used
  * @return {Observable<any>}
  */
  creatSignature(providerId: string, textOfSign: string, fontName: string): Observable<any> {
    const URL = `${this.base}/createsign`;
    const json = {
      textOfSign: textOfSign,
      fontName: fontName,
      providerId: providerId
    };
    return this.http.post(URL, json);
  }

  /**
  * Update signature
  * @param {File} file - Signature file
  * @param {string} providerId - Provider uuid
  * @return {Observable<any>}
  */
  updateSignature(file, providerId: string): Observable<any> {
    const URL = `${this.base}/uploadsign`;
    const json = {
      file: file,
      providerid: providerId
    };
    return this.http.post(URL, json);
  }

  /**
  * Delete provider attribute
  * @param {string} uuid - Provider uuid
  * @param {string} existingUuid - Provider attribute uuid
  * @return {Observable<any>}
  */
  deleteProviderAttribute(uuid: string, existingUuid: string): Observable<any> {
    const URL = `${this.baseURL}/provider/${uuid}/attribute/${existingUuid}`;
    return this.http.delete(URL);
  }

  /**
  * Return MIME type for give base64 string
  * @param {string} b64 - Base64 string
  * @return {string} - MIME type
  */
  detectMimeType(b64: string) {
    for (const s in this.mimeTypes) {
      if (b64.startsWith(s)) {
        return this.mimeTypes[s];
      }
    }
  }

  /**
  * Set profile picture
  * @param {string} imageBase64 - Base64
  * @return {void}
  */
  setProfilePic(imageBase64) {
    this.profilePic.next(imageBase64);
  }
}
