import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponseModel, MessageModel } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  baseURL: string = environment.mindmapURL;

  constructor(private http: HttpClient) { }

  /**
  * Send support message
  * @param {any} payload - Message payload
  * @return {Observable<any>}
  */
  sendMessage(payload: any): Observable<any> {
    return this.http.post(`${this.baseURL}/support/sendMessage?ngsw-bypass=true`, payload);
  }

  /**
  * Read support message
  * @param {string} userId - User uuid
  * @param {number} messageId - Message Id
  * @return {Observable<any>}
  */
  readMessageById(userId: string, messageId: number) {
    return this.http.put(`${this.baseURL}/support/read/${userId}/${messageId}?ngsw-bypass=true`, "");
  }

  /**
  * Get support messages
  * @param {string} from - From user uuid
  * @param {string} to - To user uuid
  * @return {Observable<any>}
  */
  getSupportMessages(from: string, to: string) {
    return this.http.get(`${this.baseURL}/support/getMessages/${from}/${to}?ngsw-bypass=true`).pipe(map(
      (res: ApiResponseModel) => {
        res.data = res.data.sort((a: MessageModel, b: MessageModel) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
        return res;
      }
    ));
  }

  /**
  * Get doctors list
  * @param {string} userUuid - User uuid
  * @return {Observable<any>}
  */
  getDoctorsList(userUuid: string) {
    return this.http.get(`${this.baseURL}/support/getDoctorsList/${userUuid}?ngsw-bypass=true`);
  }

  /**
  * Raise ticket
  * @param {{ title: string, description: string, priority: string }} data - Ticket payload
  * @return {Observable<any>}
  */
  raiseTicket(data: { title: string, description: string, priority: string }): Observable<any> {
    return this.http.post(`${environment.base}/createticket`, data);
  }

  /**
  * Store created ticket in db
  * @param {string} userUuid - User uuid
  * @param {{ ticketnumber: string }} data - Ticket details
  * @return {Observable<any>}
  */
  storeTicket(userUuid: string, data: { ticketnumber: string }): Observable<any> {
    return this.http.post(`${this.baseURL}/support/createTicket/${userUuid}`, data);
  }
}
