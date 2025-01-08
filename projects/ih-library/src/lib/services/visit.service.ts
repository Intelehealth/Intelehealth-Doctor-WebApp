import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
// import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class VisitService {

  // private baseURL = environment.baseURL; //'https://dev.intelehealth.org/openmrs/ws/rest/v1'
  // private baseURLMindmap = environment.mindmapURL;
  // private baseURLAbha = environment.abhaURL; 
  public isVisitSummaryShow: boolean = false;
  public isHelpButtonShow: boolean = false;
  public triggerAction: Subject<any> = new Subject();
  public chatVisitId: string;

  constructor(private http: HttpClient) { }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @return {Observable<any>}
  */
  getVisit(baseURL: string, uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${baseURL}/visit/${uuid}?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier,identifierType:(name,uuid,display)),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)`;
    return this.http.get(url);
  }

  /**
  * Get visits for a patient
  * @param {string} id - Patient uuid
  * @return {Observable<any>}
  */
  recentVisits(baseURL: string, id): Observable<any> {
    const url = `${baseURL}/visit?patient=${id}&v=full`;
    return this.http.get(url);
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @param {string} v - response version format
  * @return {Observable<any>}
  */
  fetchVisitDetails(
    baseURL: string, 
    uuid,
    v = "custom:(location:(display),uuid,display,startDatetime,dateCreated,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier,identifierType:(name,uuid,display)),attributes,person:(display,gender,age)),attributes)"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url);
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @param {string} v - response version format
  * @return {Observable<any>}
  */
  fetchVisitDetails2(
    externalPrescriptionCred: string,
    baseURL: string, 
    uuid: string,
    v: string = "custom:(location:(display),uuid,display,startDatetime,dateCreated,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier,identifierType:(name,uuid,display)),attributes,person:(display,gender,age)),attributes)"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + externalPrescriptionCred);
    const url = `${baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url, { headers });
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @param {string} v - response format
  * @return {Observable<any>}
  */
  fetchVisitPatient(externalPrescriptionCred: string, baseURL: string, uuid: string, v: string = "custom:(uuid,patient:(attributes,identifiers:(identifier,identifierType:(name,uuid,display))))"): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + externalPrescriptionCred);
    const url = `${baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url, { headers });
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @param {string} v - response version format
  * @return {Observable<any>}
  */
  getVisitDetails(
    baseURL: string, 
    uuid: string,
    v: string = "custom:(location:(display),uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value),encounterProviders:(display,provider:(uuid,person:(uuid,display,gender,age),attributes))),patient:(uuid,identifiers:(identifier,identifierType:(name,uuid,display)),person:(display,gender,age)))"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url);
  }

  /**
  * Get visit attributes
  * @param {string} visitId - Visit uuid
  * @return {Observable<any>}
  */
  getAttribute(baseURL: string, visitId): Observable<any> {
    const url = `${baseURL}/visit/${visitId}/attribute`;
    return this.http.get(url);
  }

  /**
  * Post visit attribute
  * @param {string} visitId - Visit uuid
  * @param {any} json - Attribute payload
  * @return {Observable<any>}
  */
  postAttribute(baseURL: string, visitId, json): Observable<any> {
    const url = `${baseURL}/visit/${visitId}/attribute`;
    return this.http.post(url, json);
  }

  /**
  * Update visit attribute
  * @param {string} visitId - Visit uuid
  * @param {string} attributeUuid - Visit attribute uuid
  * @param {any} json - Attribute payload
  * @return {Observable<any>}
  */
  updateAttribute(baseURL: string, visitId, attributeUuid, json): Observable<any> {
    const url = `${baseURL}/visit/${visitId}/attribute/${attributeUuid}`;
    return this.http.post(url, json);
  }

  /**
  * Delete visit attribute
  * @param {string} visitId - Visit uuid
  * @param {string} uuid - Visit attribute uuid
  * @return {Observable<any>}
  */
  deleteAttribute(baseURL: string, visitId, uuid): Observable<any> {
    const url = `${baseURL}/visit/${visitId}/attribute/${uuid}`;
    return this.http.delete(url);
  }

  /**
  * Get patient details
  * @param {string} id - Patient uuid
  * @param {string} v - response format
  * @return {Observable<any>}
  */
  patientInfo(baseURL: string, id, v = 'custom:(uuid,attributes,identifiers,person:(uuid,display,gender,preferredName:(givenName,familyName,middleName),birthdate,age,preferredAddress:(cityVillage,address1,address2,country,stateProvince,countyDistrict,postalCode),attributes:(value,attributeType:(display))))'): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${baseURL}/patient/${id}?v=${v}`;
    return this.http.get(url);
  }

  /**
  * Get whatsapp link
  * @param {string} whatsapp - Whatspp number
  * @param {string} msg - Message to be sent
  * @return {Observable<any>}
  */
  getWhatsappLink(whatsapp: string, msg: string = `Hello I'm calling for consultation`) {
    let text = encodeURI(msg);
    let whatsappLink = `https://wa.me/${whatsapp}?text=${text}`;
    return whatsappLink;
  }

  /**
  * Parse observation data
  * @param {any} data - Observation data
  * @return {any} - Observation data with parsed value
  */
  getData(data: any) {
    if (data?.value.toString().startsWith("{")) {
      let value = JSON.parse(data.value.toString());
      data.value = value["en"];
    }
    return data;
  }

  /**
  * Parse custom observation data
  * @param {any} data - Custom observation data
  * @return {any} - Observation data with parsed value
  */
  getData2(data: any) {
    if (data?.value_text.toString().startsWith("{")) {
      let value = JSON.parse(data.value_text.toString());
      data.value_text = value["en"];
    }
    return data;
  }

  /**
  * Get awaiting visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
  getAwaitingVisits(baseURLMindmap: string, speciality: string, page: number = 1): Observable<any> {
    return this.http.get(`${baseURLMindmap}/openmrs/getAwaitingVisits?speciality=${speciality}&page=${page}`);
  }

  /**
  * Get priority visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
  getPriorityVisits(baseURLMindmap: string, speciality: string, page: number = 1): Observable<any> {
    return this.http.get(`${baseURLMindmap}/openmrs/getPriorityVisits?speciality=${speciality}&page=${page}`);
  }

  /**
  * Get inprogress visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
  getInProgressVisits(baseURLMindmap: string, speciality: string, page: number = 1): Observable<any> {
    return this.http.get(`${baseURLMindmap}/openmrs/getInProgressVisits?speciality=${speciality}&page=${page}`);
  }

  /**
  * Get completed visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
  getCompletedVisits(baseURLMindmap: string, speciality: string, page: number = 1, countOnly:boolean = false): Observable<any> {
    return this.http.get(`${baseURLMindmap}/openmrs/getCompletedVisits?speciality=${speciality}&page=${page}&countOnly=${countOnly}`);
  }

 /**
  * Get follow up visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
 getFollowUpVisits(baseURLMindmap: string, speciality: string, page: number = 1, countOnly:boolean = false): Observable<any> {
  return this.http.get(`${baseURLMindmap}/openmrs/getFollowUpVisits?speciality=${speciality}&page=${page}&countOnly=${countOnly}`);
 }

  /**
  * Get ended visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
  getEndedVisits(baseURLMindmap: string, speciality: string, page: number = 1): Observable<any> {
    return this.http.get(`${baseURLMindmap}/openmrs/getEndedVisits?speciality=${speciality}&page=${page}`);
  }

  /**
   * Post visit data to abdm
   * @param {any} json - Attribute payload
   * @return {Observable<any>}
   */
  postVisitToABDM(baseURLAbha: string, json: any): Observable<any> {
    const url = `${baseURLAbha}/abha/post-care-context`
    return this.http.post(url, json);
  }
}
