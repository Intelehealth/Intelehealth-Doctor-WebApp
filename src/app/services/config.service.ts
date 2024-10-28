import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private baseURL = environment.configURL;

  constructor(private http: HttpClient) { }

  /**
  * Get doctor specialties
  * @return {Observable<any>}
  */
  getDoctorSpecialities(): Observable<any> {
    const url = `${this.baseURL}/specialization/all`;
    return this.http.get(url);
  }

  /**
  * Update speciality enabled status
  * @param {boolean} id - id of speciality
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updateSpecialityStatus(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/specialization/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }

  /**
  * Get languages
  * @return {Observable<any>}
  */
  getAppLanguages(): Observable<any> {
    const url = `${this.baseURL}/language/all`;
    return this.http.get(url);
  }

  /**
  * Update language enabled status
  * @param {boolean} id - id of speciality
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updateLanguageStatus(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/language/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }

  /**
  * Set language as default
  * @param {boolean} id - id of language
  * @return {Observable<any>}
  */
  setAsDefaultLanguage(id: number): Observable<any> {
    const url = `${this.baseURL}/language/default/${id}`;
    return this.http.put(url, null);
  }

  /**
  * Publish config
  * @return {Observable<any>}
  */
  publishConfig(): Observable<any> {
    const url = `${this.baseURL}/config/publish`;
    return this.http.post(url, null);
  }

  /**
  * Get patient registartion fields
  * @return {Observable<any>}
  */
  getPatientRegistrationFields(): Observable<any> {
    const url = `${this.baseURL}/pr/all`;
    return this.http.get(url);
  }

  /**
  * Update Patient Registration enabled status
  * @param {boolean} id - id of speciality
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updatePatientRegistrationStatus(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/pr/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }

  /**
  * Update Patient Registration Mandatory status
  * @param {boolean} id - id of speciality
  * @param {boolean} is_mandatory - enabled status true/false
  * @return {Observable<any>}
  */
  updatePatientRegistrationMandatoryStatus(id: number, is_mandatory: boolean): Observable<any> {
    const url = `${this.baseURL}/pr/updateIsMandatory/${id}`;
    return this.http.put(url, { is_mandatory });
  }

  /**
  * Update Patient Registration Editable status
  * @param {boolean} id - id of speciality
  * @param {boolean} is_editable - enabled status true/false
  * @return {Observable<any>}
  */
  updatePatientRegistrationEditableStatus(id: number, is_editable: boolean): Observable<any> {
    const url = `${this.baseURL}/pr/updateIsEditable/${id}`;
    return this.http.put(url, { is_editable });
  }

  /**
  * Get Theme config
  * @return {Observable<any>}
  */
  getThemeConfig(): Observable<any> {
    const url = `${this.baseURL}/theme_config/all`;
    return this.http.get(url);
  }

  /**
  * Upload Image
  * @param {string} url - api URL
  * @param {FormData} formData - form data
  * @return {Observable<any>}
  */
  uploadImage(url: string, method: string, formData: FormData): Observable<any> {
    if (method === 'POST')
      return this.http.post(url, formData);
    else
      return this.http.put(url, formData);
  }

  /**
  * Donwload File
  * @param {string} url - api URL
  * @return {Observable<any>}
  */
  downloadImage(url: string): Observable<any> {
    return this.http.get(url, { responseType: 'blob' });
  }

  /**
  * Delete Image
  * @param {string} url - api URL
  * @param {string} filePath - file path
  * @return {Observable<any>}
  */
  deleteImage(url: string, filePath: string): Observable<any> {
    return this.http.delete(url, { body: { filePath } });
  }


  /**
  * Delete Image
  * @param {string} url - api URL
  * @param {string} filePath - file path
  * @return {Observable<any>}
  */
  updateImagesWithText(data: any): Observable<any> {
    const url = `${this.baseURL}/theme_config/updateImagesText`;
    return this.http.put(url, data);
  }

  /**
  * Get patient vitals
  * @return {Observable<any>}
  */
  getPatientVitals(): Observable<any> {
    const url = `${this.baseURL}/vitals/all`;
    return this.http.get(url);
  }

  /**
  * Update patient vital enabled status
  * @param {boolean} id - id of vital
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updateVitalEnabledStatus(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/vitals/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }

  /**
  * Update patient vital enabled status
  * @param {boolean} id - id of vital
  * @param {boolean} is_mandatory - mandatory status true/false
  * @return {Observable<any>}
  */
  updateVitalMandatoryStatus(id: number, is_mandatory: boolean): Observable<any> {
    const url = `${this.baseURL}/vitals/updateIsMandatory/${id}`;
    return this.http.put(url, { is_mandatory });
  }

  /**
  * Get diagnostics
  * @return {Observable<any>}
  */
  getDiagnostics(): Observable<any> {
    const url = `${this.baseURL}/diagnostics/all`;
    return this.http.get(url);
  }

  /**
  * Update diagnostic enabled status
  * @param {boolean} id - id of diagnostic
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updateDiagnosticEnabledStatus(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/diagnostics/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }

  /**
  * Update diagnostic mandatory status
  * @param {boolean} id - id of diagnostic
  * @param {boolean} is_mandatory - mandatory status true/false
  * @return {Observable<any>}
  */
  updateDiagnosticMandatoryStatus(id: number, is_mandatory: boolean): Observable<any> {
    const url = `${this.baseURL}/diagnostics/updateIsMandatory/${id}`;
    return this.http.put(url, { is_mandatory });
  }

  /**
  * Get Webrtc
  * @return {Observable<any>}
  */
  getWebrtcs(): Observable<any> {
    const url = `${this.baseURL}/webrtc/all`;
    return this.http.get(url);
  }

  /**
  * Update webrtc enabled status
  * @param {boolean} id - id of vital
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updateWebrtcEnabledStatus(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/webrtc/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }

  /**
  * Get Features
  * @return {Observable<any>}
  */
  getFeatures(): Observable<any> {
    const url = `${this.baseURL}/feature/all`;
    return this.http.get(url);
  }

  /**
  * Update feature enabled status
  * @param {boolean} id - id of vital
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updateFeatureEnabledStatus(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/feature/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }

  /*
  * Get patient visit summary sections
  * @return {Observable<any>}
  */
  getPatientVisitSummarySections(): Observable<any> {
    const url = `${this.baseURL}/pvs/all`;
    return this.http.get(url);
  }

  /*
  * Update patient visit summary enabled status
  * @param {boolean} id - id of section
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updatePatientVisitSummaryStatus(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/pvs/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }

  /*
  * Get Sidebar Menu Config
  * @return {Observable<any>}
  */
  getSidebarMenuConfig(): Observable<any> {
    const url = `${this.baseURL}/sidebar-menu/all`;
    return this.http.get(url);
  }

  /*
  * Update Sidebar Menu Config enabled status
  * @param {boolean} id - id of Sidebar Menu
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updateSidebarMenuConfig(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/sidebar-menu/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }


  /**
  * Get patient visit section
  * @return {Observable<any>}
  */
  getPatientVisitSections(): Observable<any> {
    const url = `${this.baseURL}/patient-visit-sections/all`;
    return this.http.get(url);
  }

  /**
  * Update Patient Visit Sections status
  * @param {boolean} id - id of section
  * @param {boolean} is_enabled - enabled status true/false
  * @return {Observable<any>}
  */
  updatePVSEnabledStatus(id: number, is_enabled: boolean): Observable<any> {
    const url = `${this.baseURL}/patient-visit-sections/updateIsEnabled/${id}`;
    return this.http.put(url, { is_enabled });
  }

  
  /**
  * Update Patient Visit Sections
  * @param {boolean} id - id of section
  * @param {any} name - update name
  * @return {Observable<any>}
  */
  updatePVSName(id: number, name: any): Observable<any> {
    const url = `${this.baseURL}/patient-visit-sections/updateName/${id}`;
    return this.http.put(url, { name });
  }
}


