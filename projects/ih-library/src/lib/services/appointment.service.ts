import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
// import { environment } from "src/environments/environment";
import { ScheduleModel } from "../model/model";
import { AppointmentModel } from "../model/model";

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  // private baseURL = environment.mindmapURL; 'https://dev.intelehealth.org:3004/api'
  constructor(private http: HttpClient) {}

  /**
  * Create or update appointment
  * @param {any} payload - Payload for create or update appointment
  * @return {Observable<any>}
  */
  updateOrCreateAppointment(payload: ScheduleModel, mindmapURL: string): Observable<any> {
    return this.http.post(
      `${mindmapURL}/appointment/createOrUpdateSchedule`,
      payload
    );
  }

  /**
  * Update daysOffs
  * @param {any} payload - Payload for update daysOff's
  * @return {Observable<any>}
  */
  updateDaysOff(mindmapURL: string, payload: { userUuid: any; daysOff: any[] | string[]; month: string; year: any; }): Observable<any> {
    return this.http.post(
      `${mindmapURL}/appointment/updateDaysOff`,
      payload
    );
  }

  /**
  * Get user appointments
  * @param {string} userUuid - User uuid
  * @param {string} year - Year
  * @param {string} month - Month
  * @return {Observable<any>}
  */
  getUserAppoitment(mindmapURL: string, userUuid: string, year: string, month: string): Observable<any> {
    return this.http.get(
      `${mindmapURL}/appointment/getSchedule/${userUuid}?year=${year}&month=${month}`
    );
  }

  /**
  * Get user slots
  * @param {string} userUuid - User uuid
  * @param {string} fromDate - From date
  * @param {string} toDate - To date
  * @return {Observable<any>}
  */
  getUserSlots(mindmapURL: string, userUuid: string, fromDate: string, toDate: string, speciality = null): Observable<any> {    
    let url = `${mindmapURL}/appointment/getUserSlots/${userUuid}?fromDate=${fromDate}&toDate=${toDate}`
  
    if(speciality) {
      url += `&speciality=${speciality}`;
    }
    return this.http.get(url);
  }

  /**
  * Get user appointment slots
  * @param {string} fromDate - From date
  * @param {string} toDate - To date
  * @param {string} speciality - Speciality
  * @return {Observable<any>}
  */
  getAppointmentSlots(mindmapURL: string, fromDate: string, toDate: string, speciality: any): Observable<any> {
    return this.http.get(
      `${mindmapURL}/appointment/getAppointmentSlots?fromDate=${fromDate}&toDate=${toDate}&speciality=${speciality}`
    );
  }

  /**
  * Get appointment for a visit
  * @param {string} visitId - Visit uuid
  * @return {Observable<any>}
  */
  getAppointment(mindmapURL: string, visitId: string): Observable<any> {
    return this.http.get(
      `${mindmapURL}/appointment/getAppointment/${visitId}`
    );
  }

  /**
  * Get scheduled months
  * @param {string} userUuid - User uuid
  * @param {string} year - Year
  * @param {string} speciality - Speciality
  * @return {Observable<any>}
  */
  getScheduledMonths(mindmapURL: string, userUuid: any, year: string, speciality: string = null): Observable<any> {
    let url = `${mindmapURL}/appointment/getScheduledMonths/${userUuid}?year=${year}`;
    if(speciality) {
      url += `&speciality=${speciality}`;
    }
    return this.http.get(url);
  }

  /**
  * Get followup visits
  * @param {string} providerId - Provider uuid
  * @return {Observable<any>}
  */
  getFollowUpVisit(mindmapURL: string, providerId: string): Observable<any> {
    return this.http.get(
      `${mindmapURL}/openmrs/getFollowUpVisit/${providerId}`
    );
  }

  /**
  * Reschedule appointment
  * @param {string} payload - Payload to reschedule appointment
  * @return {Observable<any>}
  */
  rescheduleAppointment(mindmapURL: string, payload: AppointmentModel): Observable<any> {
    return this.http.post(
      `${mindmapURL}/appointment/rescheduleAppointment`,
      payload
    );
  }

  /**
  * Cancel appointment
  * @param {string} payload - Payload to cancel appointment
  * @return {Observable<any>}
  */
  cancelAppointment(mindmapURL: string, payload: { id: any; visitUuid: any; hwUUID: any; }): Observable<any> {
    return this.http.post(
      `${mindmapURL}/appointment/cancelAppointment`,
      payload
    );
  }

  /**
  * Complete appointment
  * @param {string} payload - Payload to complete appointment
  * @return {Observable<any>}
  */
  completeAppointment(mindmapURL: string, payload: { visitUuid: string; }): Observable<any> {
    return this.http.post(
      `${mindmapURL}/appointment/completeAppointment`,
      payload
    );
  }

  /**
  * Check appointment present or not
  * @param {string} userUuid - User uuid
  * @param {string} fromDate - From date
  * @param {string} toDate - To date
  * @param {string} speciality - Speciality
  * @return {Observable<any>}
  */
  checkAppointmentPresent(mindmapURL: string, userUuid: string, fromDate: string, toDate: string, speciality: string): Observable<any> {
    return this.http.get(
      `${mindmapURL}/appointment/checkAppointment/${userUuid}?fromDate=${fromDate}&toDate=${toDate}&speciality=${speciality}`
    );
  }

  /**
  * Update speciality for the calendar slots
  * @param {string} userUuid - User uuid
  * @param {string} speciality - Speciality
  * @return {Observable<any>}
  */
  updateSlotSpeciality(mindmapURL: string, userUuid: string, speciality: string): Observable<any> {
    return this.http.put(
      `${mindmapURL}/appointment/updateSlotSpeciality/${userUuid}?speciality=${speciality}`,
      null
    );
  }
}
