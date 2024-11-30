import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from "@angular/material/snack-bar";
import { conceptIds } from 'src/config/constant';
declare var getEncounterProviderUUID: any,
  getFromStorage: any;


@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  diagnosisArray = [];
  public isVisitSummaryChanged = false
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient,  private snackbar: MatSnackBar) { }

  concept(uuid): Observable<any> {
    const url = `${this.baseURL}/concept/${uuid}`;
    return this.http.get(url);
  }

  deleteObs(uuid): Observable<any> {
    const url = `${this.baseURL}/obs/${uuid}`;
    return this.http.delete(url);
  }

  getObs(patientId, conceptId): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/obs?patient=${patientId}&v=custom:(uuid,value,comment,encounter:(visit:(uuid)))&concept=${conceptId}`;
    return this.http.get(url);
  }

   /**
  * Get diagnosis list
  * @param {string} term - Search term
  * @return {Observable<any>}
  */
  getDiagnosisList(term: string): Observable<any> {
    const url = `${environment.baseURL}/concept?class=${conceptIds.conceptDiagnosisClass}&source=ICD-10-WHO&q=${term}`;
    return this.http.get(url)
    .pipe(
      map((response: any) => {
        return (response?.results ?? []).map((element: any) => element.display);
      })
    );;
  }

  
  isSameDoctor() {
    const providerDetails = getFromStorage("provider");
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      return true;
    } else {
      this.snackbar.open("Another doctor is viewing this case", null, {
        duration: 4000,
      });
    }
  }
}
