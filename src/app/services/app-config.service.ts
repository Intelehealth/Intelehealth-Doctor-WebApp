import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { LanguageModel, PatientRegistrationFieldsConfigModel, VitalModel, SpecializationModel, WebRTCConfigModel, PatientVisitSummaryConfigModel } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private baseURL = environment.configURL;
  public version: string;
  public apiEndpoint: string;
  public specialization: SpecializationModel[];
  public language: LanguageModel[];
  public patient_registration: PatientRegistrationFieldsConfigModel;
  public theme_config: any[];
  public patient_vitals: VitalModel[];
  public webrtc_section: boolean;
  public webrtc: WebRTCConfigModel;
  public patient_visit_summary: PatientVisitSummaryConfigModel;
  public patient_vitals_section: boolean;
  public patient_reg_other: boolean;
  public patient_reg_address: boolean;
  public abha_section: boolean;
  public sidebar_menus: any;

  constructor(private http: HttpClient) { }

  load(): Promise<any> {
    const promise = this.http.get(`${this.baseURL}/config/getPublishedConfig`)
      .toPromise()
      .then(data => {
        Object.assign(this, data);
        return data;
      });
    return promise;
  }
}
