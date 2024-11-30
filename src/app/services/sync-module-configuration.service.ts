import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class SyncModuleConfigurationService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) {}

  getList(): Observable<any> {
    return this.http.get(`${this.baseURL}/config-data-sync-module/getAll`);
  }

  updateStatus(data: any): Observable<any> {
    return this.http.post(
      `${this.baseURL}/config-data-sync-module/save`,
      data
    );
  }
}
