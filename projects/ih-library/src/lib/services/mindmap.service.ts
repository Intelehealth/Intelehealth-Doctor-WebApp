import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
// import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class MindmapService {
  // private baseURL = environment.mindmapURL;

  constructor(private http: HttpClient) { }

  /**
  * Get mindmap keys
  * @return {Observable<any>}
  */
  getMindmapKey(baseURL: string): Observable<any> {
    const url = `${baseURL}/mindmap`;
    return this.http.get(url);
  }

  /**
  * Post mindmap
  * @param {any} value - Payload for post mindmap
  * @return {Observable<any>}
  */
  postMindmap(baseURL: string, value): Observable<any> {
    const url = `${baseURL}/mindmap/upload`;
    return this.http.post(url, value);
  }

  /**
  * Get mindmap details from key
  * @param {string} key - Mindmap key
  * @return {Observable<any>}
  */
  detailsMindmap(baseURL: string, key): Observable<any> {
    const url = `${baseURL}/mindmap/details/${key}`;
    return this.http.get(url);
  }

  /**
  * Add/update mindmap license key
  * @param {any} payload - Payload for mindmap key to add/update
  * @return {Observable<any>}
  */
  addUpdateLicenseKey(baseURL: string, payload): Observable<any> {
    const url = `${baseURL}/mindmap/addUpdatekey`;
    return this.http.post(url, payload);
  }

  /**
  * Update mindmap key image
  * @param {string} key - Mindmap key
  * @param {string} imageName - Image name
  * @param {string} value - Image base64
  * @return {Observable<any>}
  */
  updateImage(baseURL: string, key, imageName, value): Observable<any> {
    const url = `${baseURL}/mindmap/${key}/${imageName}`;
    return this.http.put(url, value);
  }

  /**
  * Delete mindmap
  * @param {string} key - Mindmap key
  * @param {any} data - Mindmap data
  * @return {Observable<any>}
  */
  deleteMindmap(baseURL: string, key, data): Observable<any> {
    const url = `${baseURL}/mindmap/delete/${key}`;
    return this.http.post(url, data);
  }

  /**
  * Toggle mindmap status
  * @param {any} data - Mindmap data
  * @return {Observable<any>}
  */
  toggleMindmapStatus(baseURL: string, data: any): Observable<any> {
    const url = `${baseURL}/mindmap/toggleStatus`;
    return this.http.post(url, data);
  }

    /**
  * Notify App side
  * @param {any} hwUuid - Healthworker Id
  * @param {any} payload - Notifaication message
  * @return {Observable<any>}
  */
  notifyApp(baseURL: string, hwUuid: any, payload: any) : Observable<any>{
    return this.http.post(`${baseURL}/mindmap/notify-app/${hwUuid}`, payload)
  }


  /**
  * Send notification to health worker for available prescription
  * @returns {void}
  */
  notifyHwForRescheduleAppointment(baseURL: string, appointment): void {
    const hwUuid = appointment?.hwUUID;
    const openMRSID = appointment?.openMrsId;
    const payload = {
      title: `Appointment rescheduled for ${appointment?.patientName || 'Patient'}`,
      body: "Click notification to see!",
      type: "appointment",
      data: {
        patientFirstName: appointment?.patientName ?? '',
        patientUuid: appointment?.patientId,
        patientOpenMrsId: openMRSID,
        visitUuid: appointment?.visitUuid,
        slotDateTime: appointment?.slotJsDate
      }
    }
    this.notifyApp(baseURL, hwUuid, payload).subscribe();
  }
}
