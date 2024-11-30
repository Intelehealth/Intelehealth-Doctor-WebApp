import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { environment } from "../../environments/environment";
import { HelperService } from "./helper.service";
// import { VisitData } from "../component/homepage/homepage.component";

@Injectable({
  providedIn: "root",
})
export class VisitService {
  private baseURL = environment.baseURL;
  // public flagVisit: VisitData[] = [];
  // public waitingVisit: VisitData[] = [];
  // public progressVisit: VisitData[] = [];
  // public completedVisit: VisitData[] = [];

  public isVisitSummaryShow: boolean = false;

  public isHelpButtonShow: boolean = false;

  public triggerAction: any = new Subject();

  public chatVisitId: any;

  constructor(private http: HttpClient, private helper: HelperService) {}

  getVisits(params): Observable<any> {
    const query = {
      ...{
        includeInactive: false,
        v: "custom:(uuid,startDatetime,stopDatetime,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate),attributes),location:(display),encounters:(display,obs:(display,uuid,value),encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)",
      },
      ...params,
    };
    const url = `${this.baseURL}/visit${this.helper.toParamString(query)}`;
    return this.http.get(url);
  }

  getVisit(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)`;
    return this.http.get(url);
  }

  clearVisits() {
    // this.flagVisit = new Array();
    // this.waitingVisit = new Array();
    // this.progressVisit = new Array();
    // this.completedVisit = new Array();
  }

  recentVisits(id): Observable<any> {
    // const url = `${this.baseURL}/visit?patient=${id}&v=custom:(uuid,display,patient:(uuid))`;
    const url = `${this.baseURL}/visit?patient=${id}&v=full`;
    return this.http.get(url);
  }

  fetchVisitDetails(
    uuid,
    v = "custom:(location:(display),uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier),attributes,person:(display,gender,age)),attributes)"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url);
  }

  fetchVisitDetails2(
    uuid,
    v = "custom:(location:(display),uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier),attributes,person:(display,gender,age)),attributes)"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + environment.externalPrescriptionCred);
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url, { headers });
  }

  fetchVisitPatient(uuid,v = "custom:(uuid,patient:(attributes,identifiers:(identifier)))"): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + environment.externalPrescriptionCred);
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url, { headers });
  }

  getVisitDetails(
    uuid,
    v = "custom:(location:(display),uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value),encounterProviders:(display,provider:(uuid,person:(uuid,display,gender,age),attributes))),patient:(uuid,identifiers:(identifier),person:(display,gender,age)))"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url);
  }

  getAttribute(visitId): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute`;
    return this.http.get(url);
  }

  postAttribute(visitId, json): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute`;
    return this.http.post(url, json);
  }

  updateAttribute(visitId, attributeUuid, json) {
    const url = `${this.baseURL}/visit/${visitId}/attribute/${attributeUuid}`;
    return this.http.post(url, json);
  }

  deleteAttribute(visitId, uuid) {
    const url = `${this.baseURL}/visit/${visitId}/attribute/${uuid}`;
    return this.http.delete(url);
  }

  patientInfo(id, v = 'custom:(identifiers,person:(uuid,display,gender,birthdate,age,preferredAddress:(cityVillage),attributes:(value,attributeType:(display))))'): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/patient/${id}?v=${v}`;
    return this.http.get(url);
  }

  getVisitCounts(speciality) {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getVisitCounts?speciality=${speciality}`
    );
  }

  getWhatsappLink(whatsapp: any, msg: string) {
    let text = encodeURI(msg);
    let whatsappLink = `https://wa.me/${whatsapp}?text=${text}`;
    return whatsappLink;
  }

  chatGPTCompletionDDx(payload: any, inputtype: string, customInput: string) {
    return this.http.post(`${environment.mindmapURL}/openai/ddx`, { payload, inputtype, customInput });
  }

  getGptInputs(): Observable<any> {
    return this.http.get(`${environment.mindmapURL}/openai/gptInputs`);
  }

  addGptInputs(gptinput: string): Observable<any> {
    return this.http.post(`${environment.mindmapURL}/openai/addInput`, { gptinput });
  }

  setAsDefaultGptInput(id: number): Observable<any> {
    return this.http.post(`${environment.mindmapURL}/openai/setAsDefaultInput`, { id });
  }

  deleteGptInput(id: number): Observable<any> {
    return this.http.delete(`${environment.mindmapURL}/openai/deleteInput/${id}`);
  }

  getGptModels(): Observable<any> {
    return this.http.get(`${environment.mindmapURL}/openai/gptModels`);
  }

  addGptModel(model: string): Observable<any> {
    return this.http.post(`${environment.mindmapURL}/openai/addModels`, { model });
  }

  setAsDefaultGptModel(id: number): Observable<any> {
    return this.http.post(`${environment.mindmapURL}/openai/setAsDefaultModel`, { id });
  }

  deleteGptModel(id: number): Observable<any> {
    return this.http.delete(`${environment.mindmapURL}/openai/deleteModel/${id}`);
  }

  getChatGptModels(): Observable<any> {
    return this.http.get(`${environment.mindmapURL}/openai/chatGptModels`);
    return this.http.get(`http://localhost:3004/api/openai/chatGptModels`);
  }

  setAsDefaultModelChatGpt(id: number): Observable<any> {
    return this.http.post(`${environment.mindmapURL}/openai/setAsDefaultModelChatGpt`, { id });
    return this.http.post(`http://localhost:3004/api/openai/setAsDefaultModelChatGpt`, { id });
  }

  updateModelChatGpt(model: any): Observable<any> {
    return this.http.post(`${environment.mindmapURL}/openai/updateChatGptModel`, model);
    return this.http.post(`http://localhost:3004/api/openai/updateChatGptModel`, model);
  }

  getChatGptPrompts(): Observable<any> {
    return this.http.get(`${environment.mindmapURL}/openai/chatGptPrompts`);
    return this.http.get(`http://localhost:3004/api/openai/chatGptPrompts`);
  }

  updateChatGptPrompts(prompts: any): Observable<any> {
    return this.http.post(`${environment.mindmapURL}/openai/updateChatGptPrompts`, prompts);
    return this.http.post(`http://localhost:3004/api/openai/updateChatGptPrompts`, prompts);
  }

  getDiagnosisSuggestions(caseInformation: string) {
    return this.http.post(`${environment.mindmapURL}/openai/getDiagnosisSuggestions2`, { payload: caseInformation });
    return this.http.post(`${environment.mindmapURL}/openai/getDiagnosisSuggestions`, { payload: caseInformation });
    return this.http.post(`http://localhost:3004/api/openai/getDiagnosisSuggestions`, { payload: caseInformation });
    return this.http.post(`http://localhost:3004/api/openai/getDiagnosisSuggestions2`, { payload: caseInformation });
  }

  getUpdatedDiagnosisSuggestions(caseInformation: string, additionalNotes: string) {
    return this.http.post(`${environment.mindmapURL}/openai/getUpdatedDiagnosisSuggestions2`, { caseInformation, additionalNotes });
    return this.http.post(`${environment.mindmapURL}/openai/getUpdatedDiagnosisSuggestions`, { caseInformation, additionalNotes });
    return this.http.post(`http://localhost:3004/api/openai/getUpdatedDiagnosisSuggestions`, { caseInformation, additionalNotes });
    return this.http.post(`http://localhost:3004/api/openai/getUpdatedDiagnosisSuggestions2`, { caseInformation, additionalNotes });
  }

  getTreatmentPlan(caseInformation: string, finalDiagnosis: string) {
    return this.http.post(`${environment.mindmapURL}/openai/getDiagnosticTestAndTreatmentPlan`, { caseInformation, finalDiagnosis });
    return this.http.post(`http://localhost:3004/api/openai/getDiagnosticTestAndTreatmentPlan`, { caseInformation, finalDiagnosis });
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
}
