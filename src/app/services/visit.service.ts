import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { environment } from "../../environments/environment";
import * as moment from "moment";
import { visitTypes } from "src/config/constant";
import { getCacheData } from 'src/app/utils/utility-functions';
import { PatientModel, PersonAttributeModel } from "../model/model";

@Injectable({
  providedIn: "root",
})
export class VisitService {

  private baseURL = environment.baseURL;
  private baseURLMindmap = environment.mindmapURL;
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
  getVisit(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)`;
    return this.http.get(url);
  }

  /**
  * Get visits for a patient
  * @param {string} id - Patient uuid
  * @return {Observable<any>}
  */
  recentVisits(id): Observable<any> {
    const url = `${this.baseURL}/visit?patient=${id}&v=full`;
    return this.http.get(url);
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @param {string} v - response version format
  * @return {Observable<any>}
  */
  fetchVisitDetails(
    uuid,
    v = "custom:(location:(display),uuid,display,startDatetime,dateCreated,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier),attributes,person:(display,gender,age)),attributes)"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url);
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @param {string} v - response version format
  * @return {Observable<any>}
  */
  fetchVisitDetails2(
    uuid: string,
    v: string = "custom:(location:(display),uuid,display,startDatetime,dateCreated,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier),attributes,person:(display,gender,age)),attributes)"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + environment.externalPrescriptionCred);
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url, { headers });
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @param {string} v - response format
  * @return {Observable<any>}
  */
  fetchVisitPatient(uuid: string, v: string = "custom:(uuid,patient:(attributes,identifiers:(identifier)))"): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + environment.externalPrescriptionCred);
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url, { headers });
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @param {string} v - response version format
  * @return {Observable<any>}
  */
  getVisitDetails(
    uuid: string,
    v: string = "custom:(location:(display),uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value),encounterProviders:(display,provider:(uuid,person:(uuid,display,gender,age),attributes))),patient:(uuid,identifiers:(identifier),person:(display,gender,age)))"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url);
  }

  /**
  * Get visit attributes
  * @param {string} visitId - Visit uuid
  * @return {Observable<any>}
  */
  getAttribute(visitId): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute`;
    return this.http.get(url);
  }
  
  /**
  * Post visit attribute
  * @param {string} visitId - Visit uuid
  * @param {any} json - Attribute payload
  * @return {Observable<any>}
  */
  postAttribute(visitId, json): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute`;
    return this.http.post(url, json);
  }

  /**
  * Update visit attribute
  * @param {string} visitId - Visit uuid
  * @param {string} attributeUuid - Visit attribute uuid
  * @param {any} json - Attribute payload
  * @return {Observable<any>}
  */
  updateAttribute(visitId, attributeUuid, json): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute/${attributeUuid}`;
    return this.http.post(url, json);
  }

  /**
  * Delete visit attribute
  * @param {string} visitId - Visit uuid
  * @param {string} uuid - Visit attribute uuid
  * @return {Observable<any>}
  */
  deleteAttribute(visitId, uuid): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute/${uuid}`;
    return this.http.delete(url);
  }

  /**
  * Get patient details
  * @param {string} id - Patient uuid
  * @param {string} v - response format
  * @return {Observable<any>}
  */
  patientInfo(id, v = 'custom:(identifiers,person:(uuid,names,display,gender,birthdate,age,preferredAddress:(cityVillage,stateProvince,address1,address2),attributes:(value,attributeType:(display))))'): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/patient/${id}?v=${v}`;
    return this.http.get(url);
  }

  /**
  * Get whatsapp link
  * @param {string} whatsapp - Whatspp number
  * @param {string} msg - Message to be sent
  * @return {Observable<any>}
  */
  getWhatsappLink(whatsapp: string, msg: string) {
    let text = encodeURI(msg);
    let whatsappLink = `https://wa.me/91${whatsapp}?text=${text}`;
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
  getAwaitingVisits(speciality: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.baseURLMindmap}/openmrs/getAwaitingVisits?speciality=${speciality}&page=${page}`);
  }

  /**
  * Get priority visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
  getPriorityVisits(speciality: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.baseURLMindmap}/openmrs/getPriorityVisits?speciality=${speciality}&page=${page}`);
  }

  /**
  * Get inprogress visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
  getInProgressVisits(speciality: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.baseURLMindmap}/openmrs/getInProgressVisits?speciality=${speciality}&page=${page}`);
  }

  /**
  * Get completed visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
  getCompletedVisits(speciality: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.baseURLMindmap}/openmrs/getCompletedVisits?speciality=${speciality}&page=${page}`);
  }

  /**
  * Get ended visits
  * @param {string} speciality - Visit speciality
  * @param {number} page - Page number
  * @return {Observable<any>}
  */
  getEndedVisits(speciality: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.baseURLMindmap}/openmrs/getEndedVisits?speciality=${speciality}&page=${page}`);
  }

   /**
  * Get Locations
  * @return {Observable<any>}
  */
   getLocations(): Observable<any> {
    return this.http.get(`${this.baseURLMindmap}/openmrs/getLocations`);
  }

  /**
  * close Visit
  * @return {Observable<any>}
  */
   closeVisit(visitId: string, json): Observable<any> {
     let url = `${this.baseURL}/visit/${visitId}`;
     return this.http.post(url, json)
  }

  /**
   * Get followup date for a given encounter type
   * @param  visit - Visit
   * @param {string} encounterName - Encounter type
   * @return {string} - Encounter ProviderName
   */
    getFollowupDate(visit, encounterName) {
      let followup_date = '';
      const encounters = visit.encounters;
      encounters.forEach((encounter) => {
        const display = encounter.type?.name;
        if (display?.match(encounterName) !== null) {
          encounter.obs.forEach((obs) => {
            if (obs?.concept_id === 163345 && !obs?.value_text.includes('No')) {
              if(obs.value_text.includes('Time:')) {
                followup_date = ((obs.value_text.includes('Time:')) ? moment(obs.value_text.split(', Time: ')[0]).format('YYYY-MM-DD') : moment(obs.value_text.split(', Remark: ')[0]).format('YYYY-MM-DD'))
                .concat(', ',(obs.value_text.includes('Time:')) ? obs.value_text.split(', Time: ')[1].split(', Remark: ')[0] : '-');
              } else if(!obs?.value_text.includes('No')) {
                followup_date = moment(obs.value_text,'DD-MM-YYYY').format('YYYY-MM-DD');
              }
            } else if( obs?.display && obs?.display?.match("Follow up visit") !== null  && !obs?.display.includes('No')) {
              followup_date = ((obs.display.includes('Time:')) ? moment(obs.display.split(', Time: ')[0]).format('YYYY-MM-DD') : moment(obs.display.split(', Remark: ')[0]).format('YYYY-MM-DD'))
              .concat(', ',(obs.display.includes('Time:')) ? obs.display.split(', Time: ')[1].split(', Remark: ')[0] : '-');
            }
          });
        }
      });
      return followup_date;
    }

     /**
     * Retreive the chief complaints for the visit
     * @param visit - Visit
     * @return {string[]} - Chief complaints array
     */
      getCheifComplaint1(visit) {
        let recent: string[] = [];
        const encounters = visit.encounters;
        encounters.forEach((encounter) => {
          const display = encounter.encounterType ? encounter.encounterType.display : encounter.type?.name;
          if (display.match(visitTypes.ADULTINITIAL) !== null) {
            const obs = encounter.obs;
            obs.forEach((currentObs) => {
              if (currentObs.display && currentObs.display.match("CURRENT COMPLAINT") !== null) {
                const currentComplaint = currentObs.display.split("<b>");
                for (let i = 1; i < currentComplaint.length; i++) {
                  const obs1 = currentComplaint[i].split("<");
                  if (!obs1[0].match("Associated symptoms")) {
                    recent.push(obs1[0]);
                  }
                }
              } else if (currentObs.concept_id == 163212) {
                const currentComplaint = this.getData2(currentObs)?.value_text.replace(new RegExp('►', 'g'), '').split('<b>');
                for (let i = 1; i < currentComplaint.length; i++) {
                  const obs1 = currentComplaint[i].split('<');
                  if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                    recent.push(obs1[0]);
                  }
                }
              }
            });
          }
        });
        return recent;
      }
    
       /**
  * Returns the age in years from the birthdate
  * @param {string} birthdate - Date in string format
  * @return {number} - Age
  */
  calculateAge(birthdate: string) {
    return moment().diff(birthdate, 'years');
  }

 /**
     * Retreive the patient verdict for the visit
     * @param visit - Visit
     * @return {string[]} - patient verdict
     */
   getPatientVerdict(visit) {
    let recent: string[] = [];
    const encounters = visit?.encounters;
    encounters?.forEach((encounter) => {
      const display = encounter.encounterType ? encounter.encounterType.display : encounter.type?.name;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach((currentObs) => {
          if (currentObs.display && currentObs.display.match("CURRENT COMPLAINT") !== null) {
            const currentComplaint = currentObs.display.split("<b>");
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split("<");
              if (obs1[0].includes("Follow Up") || obs1[0].includes("Follow-Up") || obs1[0].includes("Follow up visit")) {
                if(currentComplaint[i].includes('Patient is feeling better')) {
                recent.push('Patient is feeling better');
                } else if(currentComplaint[i].includes(`Patient's condition is still the same`)) {
                  recent.push(`Patient's condition is still the same`);
                } else if(currentComplaint[i].includes(`Patient's condition has worsened`)) {
                  recent.push(`Patient's condition has worsened`);
                } else {
                  recent.push('NA');
                }
              }
            }
          } else if (currentObs.concept_id == 163212) {
            const currentComplaint = this.getData2(currentObs)?.value_text.replace(new RegExp('►', 'g'), '').split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (obs1[0].includes("Follow Up") || obs1[0].includes("Follow-Up") || obs1[0].includes("Follow up visit")) {
                if(currentComplaint[i].includes('Patient is feeling better')) {
                recent.push('Patient is feeling better');
                } else if(currentComplaint[i].includes(`Patient's condition is still the same`)) {
                  recent.push(`Patient's condition is still the same`);
                } else if(currentComplaint[i].includes(`Patient's condition has worsened`)) {
                  recent.push(`Patient's condition has worsened`);
                } else {
                  recent.push('NA');
                }
          }
        }
      }
        });
      }
    });
    return recent;
  }

  /**
  * Get height value in feet and inches
  * @param {string} n - height
  * @returns 
  */
  heightToInches(n: any) {
    if(!n) return n;
    const realFeet = ((n * 0.393700) / 12);
    const feet = Math.floor(realFeet);
    const inches = Math.round((realFeet - feet) * 12);
    return `${feet} ft ${inches} in`;
  }

  /**
  * Get age of patient from birthdate
  * @param {string} birthdate - Birthdate
  * @return {string} - Age
  */
  getAge(birthdate1: string): string {
    const birthDate = new Date(birthdate1);
    const today = new Date();
  
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
  
    if (days < 0) {
      months -= 1;
      const lastMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      days += lastMonthDays;
    }
  
    if (months < 0) {
      years -= 1;
      months += 12;
    }
  
    if (years >= 1 && months >= 1) {
      return `${years} years ${months} months`;
    } else if (years >= 1) {
      return `${years} years`;
    } else if (months >= 1 || days > 0) {
      return `${months} months ${days} days`;
    } else {
      return `0 months 0 days`;
    }
  }

   /**
    * Get Sevikas attribute value for a given attribute type
    * @param {string} attrType - Sevikas attribute type
    * @return {any} - Value for a given attribute type
    */
    getSevikasPhoneNo(attrType: string) {
      let val ='NA';
      let sevika = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER);
      if (sevika.provider.attributes.length > 0) {
        sevika.provider.attributes.forEach((attr: PersonAttributeModel) => {
          if (attrType === attr.attributeType.display) {
            val = attr.value;
          }
        });
      }
      return val;
    }
  
    /**
    * Get whatsapp link
    * @param {PatientModel} patient - patient details
    * @return {string} - Whatsapp link
    */
    getSevikasLink(patient:PatientModel) {
      return this.getWhatsappLink(this.getSevikasPhoneNo('phoneNumber'), `Hello I'm calling for patient
       ${patient.person.display} OpenMRS ID ${patient.identifiers[0].identifier}`);
    }
  }
