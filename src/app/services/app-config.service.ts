import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { LanguageModel, PatientRegistrationFieldsConfigModel, VitalModel, SpecializationModel, WebRTCConfigModel, PatientVisitSummaryConfigModel, PatientVisitSection } from '../model/model';

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
  public sidebar_menus: { [key: string]: boolean };
  public patient_visit_sections: PatientVisitSection[]

  constructor(private http: HttpClient) { }

  load(): Promise<any> {
    const promise = this.http.get(`${this.baseURL}/config/getPublishedConfig`)
      .toPromise()
      .then((data) => {
        this.setPatientVisitSections(data)
        Object.assign(this, data);
        return data;
      });
    return promise;
  }

  setPatientVisitSections(data: any) {
    data.patient_visit_sections = (data?.patient_visit_sections ?? [])
    .map((pvs: PatientVisitSection) => {
      return {
        ...pvs,
        lang: pvs.lang ? (typeof pvs.lang === 'object' ? pvs.lang : JSON.parse(pvs.lang)) : null,
      }
    })
  }

  public get tourConfig(){
    try {
      return JSON.parse(this.theme_config.find((config: any) => config.key === 'help_tour_config').value);
    } catch (error) {
      return null;
    }
  }
}
