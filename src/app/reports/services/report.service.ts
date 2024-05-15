import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReoportService {

  constructor(private http: HttpClient) { }

  getReport(body) {
    if (body.reportId === 1) {
      return this.http.get(
        `${environment.reportURL}/gen/${body.selectedData.value.field1}/${body.selectedData.value.field2}`, { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 2) {
      return this.http.get(
        `${environment.reportURL}/vl2/${body.selectedData.value.field1}/${body.selectedData.value.field2}`, { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 3) {
      return this.http.get(
        `${environment.reportURL}/bs/${body.selectedData.value.field1}/${body.selectedData.value.field2}`, { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 4) {
      return this.http.get(
        `${environment.reportURL}/vlr`, { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 5) {
      return this.http.get(
        `${environment.reportURL}/lcrep`, { reportProgress: true, observe: "events" });
    }
  }
}
