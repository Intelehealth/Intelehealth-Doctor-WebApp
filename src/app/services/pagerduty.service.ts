import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class PagerdutyService {
  private baseURL = environment.pagerdutyURL;

  constructor(private http: HttpClient) { }

  getAllTickets(pageIndex:number, pageSize:number){
    const url = `${this.baseURL}/getUserTickets?page=${pageIndex}&size=${pageSize}`;
    return this.http.get(url);
  }

  createTicket(data){
    const url = `${this.baseURL}/createTicket`;
    return this.http.post(url,data);
  }

  getTicket(id: string) {
    const url = `${this.baseURL}/getTicket/${id}`;
    return this.http.get(url);
  }
}
