import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
// import { environment } from "src/environments/environment";
import { MatDialog} from '@angular/material/dialog';
import { LibPresciptionComponent } from "./lib-presciption.component";

@Injectable({
  providedIn: "root",
})
export class LibPresciptionService {

  private baseURL;
  mimeTypes: any = {
    JVBERi0: 'application/pdf',
    R0lGODdh: 'image/gif',
    R0lGODlh: 'image/gif',
    iVBORw0KGgo: 'image/png',
    '/9j/': 'image/jpg'
  };


  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    @Inject('environment') environment
  ) { 
    this.baseURL = environment.baseURL;
  }
  fetchVisitDetails(
    uuid:string,
    v = "custom:(location:(display),uuid,display,startDatetime,dateCreated,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier,identifierType:(name,uuid,display)),attributes,person:(display,gender,age)),attributes)"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url);
  }

  /**
  * Get patient details
  * @param {string} id - Patient uuid
  * @param {string} v - response format
  * @return {Observable<any>}
  */
  patientInfo(id:string, v = 'custom:(uuid,attributes,identifiers,person:(uuid,display,gender,preferredName:(givenName,familyName,middleName),birthdate,age,preferredAddress:(cityVillage,address1,address2,address3,address6,country,stateProvince,countyDistrict,postalCode),attributes:(value,attributeType:(display))))'): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/patient/${id}?v=${v}`;
    return this.http.get(url);
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
  * Open view visit prescription modal
  * @param {{ uuid: string }} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openVisitPrescriptionModal(data: { uuid: string }): Observable<any> {
    const dialogRef = this.dialog.open(LibPresciptionComponent, { panelClass: 'modal-lg', data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
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
  * Get observations for a given concept id and patient id
  * @param {string} patientId - Patient uuid
  * @param {string} conceptId - Concept uuid
  * @return {Observable<any>}
  */
  getObs(patientId: string, conceptId: string): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/obs?patient=${patientId}&v=custom:(uuid,comment,value,encounter:(visit:(uuid)))&concept=${conceptId}`;
    return this.http.get(url);
  }
}
