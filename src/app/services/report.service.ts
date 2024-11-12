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
        `${environment.base}/gen/${body.selectedData.value.field1}/${body.selectedData.value.field2}/${body.selectedData.filter.villageId}/${body.selectedData.filter.stateId}/${body.selectedData.filter.districtId}/${body.selectedData.filter.sanchId}/${body.selectedData.filter.speciality}`
        , { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 2) {
      return this.http.get(
        `${environment.base}/vl2/${body.selectedData.value.field1}/${body.selectedData.value.field2}/${body.selectedData.filter.villageId}/${body.selectedData.filter.stateId}/${body.selectedData.filter.districtId}/${body.selectedData.filter.sanchId}/${body.selectedData.filter.speciality}`, { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 3) {
      return this.http.get(
        `${environment.base}/bs/${body.selectedData.value.field1}/${body.selectedData.value.field2}/${body.selectedData.filter.villageId}/${body.selectedData.filter.stateId}/${body.selectedData.filter.districtId}/${body.selectedData.filter.sanchId}`, { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 4) {
      return this.http.get(
        `${environment.base}/vlrv/${body.selectedData.value.field1}/${body.selectedData.value.field2}/${body.selectedData.filter.villageId}/${body.selectedData.filter.stateId}/${body.selectedData.filter.districtId}/${body.selectedData.filter.sanchId}`, { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 5) {
      return this.http.get(
        `${environment.base}/lcrep`, { reportProgress: true, observe: "events" });
    }
  }
}
