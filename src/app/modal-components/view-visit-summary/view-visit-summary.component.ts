import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { CoreService } from 'src/app/services/core/core.service';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { DocImagesModel, EncounterModel, ObsModel, PatientHistoryModel, PatientIdentifierModel, PatientModel, PersonAttributeModel, VisitModel, VitalModel } from 'src/app/model/model';
import { TranslateService } from '@ngx-translate/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
import { visit as visit_logos, logo as main_logo} from "../../utils/base64"
import { AppConfigService } from 'src/app/services/app-config.service';
import { Observable } from 'rxjs';
import { calculateBMI } from 'src/app/utils/utility-functions';

@Component({
  selector: 'app-view-visit-summary',
  templateUrl: './view-visit-summary.component.html',
  styleUrls: ['./view-visit-summary.component.scss']
})
export class ViewVisitSummaryComponent implements OnInit, OnDestroy {
  @Input() isDownloadVisitSummary: boolean = false;
  @Input() visitId: string;
  @Input() download: Observable<any>;
  visit: VisitModel;
  patient: PatientModel;
  baseUrl: string = environment.baseURL;
  visitStatus: string;
  providerName: string;
  hwPhoneNo: string;
  clinicName: string;
  vitalObs: ObsModel[] = [];
  cheifComplaints: string[] = [];
  checkUpReasonData: PatientHistoryModel[] = [];
  physicalExaminationData: PatientHistoryModel[] = [];
  patientHistoryData: PatientHistoryModel[] = [];
  eyeImages: DocImagesModel[] = [];
  additionalDocs: DocImagesModel[] = [];
  baseURL = environment.baseURL;
  conceptAdditionlDocument = "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba";
  conceptPhysicalExamination = '200b7a45-77bc-4986-b879-cc727f5f7d5b';
  patientRegFields: string[] = [];
  vitals: VitalModel[] = [];
  hasVitalsEnabled: boolean = false;
  hasPatientOtherEnabled: boolean = false;
  hasPatientAddressEnabled: boolean = false;
  eventsSubscription: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ViewVisitSummaryComponent>,
    private visitService: VisitService,
    private diagnosisService: DiagnosisService,
    private coreService: CoreService,
    private translateService: TranslateService,
    private appConfigService: AppConfigService) {
      Object.keys(this.appConfigService.patient_registration).forEach(obj=>{
        this.patientRegFields.push(...this.appConfigService.patient_registration[obj].filter(e=>e.is_enabled).map(e=>e.name));
      });
      this.vitals = [...this.appConfigService.patient_vitals];
      this.hasVitalsEnabled = this.appConfigService.patient_vitals_section;
      this.hasPatientAddressEnabled = this.appConfigService?.patient_reg_address;
      this.hasPatientOtherEnabled = this.appConfigService?.patient_reg_other;
    }

  ngOnInit(): void {
    this.getVisit(this.isDownloadVisitSummary ? this.visitId : this.data.uuid);
    pdfMake.fonts = {
      DmSans: {
        normal: `${window.location.origin}${environment.production ? '/intelehealth' : ''}/assets/fonts/DM_Sans/DMSans-Regular.ttf`,
        bold: `${window.location.origin}${environment.production ? '/intelehealth' : ''}/assets/fonts/DM_Sans/DMSans-Bold.ttf`,
        italics: `${window.location.origin}${environment.production ? '/intelehealth' : ''}/assets/fonts/DM_Sans/DMSans-Italic.ttf`,
        bolditalics: `${window.location.origin}${environment.production ? '/intelehealth' : ''}/assets/fonts/DM_Sans/DMSans-BoldItalic.ttf`,
      }
    };
    this.eventsSubscription = this.download?.subscribe((val) => { if (val) { this.downloadVisitSummary(); } });
  }

  ngOnDestroy() {
    this.eventsSubscription?.unsubscribe();
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @return {void}
  */
  getVisit(uuid: string) {
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: VisitModel) => {
      if (visit) {
        this.visit = visit;
        this.checkVisitStatus(visit.encounters);
        this.visitService.patientInfo(visit.patient.uuid).subscribe((patient: PatientModel) => {
          if (patient) {
            this.patient = patient;
            this.clinicName = visit.location.display;
            this.getVisitProvider(visit.encounters);
            this.getVitalObs(visit.encounters);
            this.getCheckUpReason(visit.encounters);
            this.getPhysicalExamination(visit.encounters);
            this.getEyeImages(visit);
            this.getMedicalHistory(visit.encounters);
            this.getVisitAdditionalDocs(visit);
          }
        });
      }
    }, (error) => {

    });
  }

  /**
  * Get patient identifier for given identifier type
  * @param {string} identifierType - Identifier type
  * @return {void}
  */
  getPatientIdentifier(identifierType: string) {
    let identifier: string = '';
    if (this.patient) {
      this.patient.identifiers.forEach((idf: PatientIdentifierModel) => {
        if (idf.identifierType.display == identifierType) {
          identifier = idf.identifier;
        }
      });
    }
    return identifier;
  }

  /**
  * Check visit status
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  checkVisitStatus(encounters: EncounterModel[]) {
    if (this.checkIfEncounterExists(encounters, visitTypes.PATIENT_EXIT_SURVEY)) {
      this.visitStatus = visitTypes.ENDED_VISIT;
    } else if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_COMPLETE)) {
      this.visitStatus = visitTypes.COMPLETED_VISIT;
    } else if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_NOTE)) {
      this.visitStatus = visitTypes.IN_PROGRESS_VISIT;
    } else if (this.checkIfEncounterExists(encounters, visitTypes.FLAGGED)) {
      this.visitStatus = visitTypes.PRIORITY_VISIT;
    } else if (this.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL) || this.checkIfEncounterExists(encounters, visitTypes.VITALS)) {
      this.visitStatus = visitTypes.AWAITING_VISIT;
    }
  }

  /**
  * Get encounter for a given encounter type
  * @param {EncounterModel[]} encounters - Array of encounters
  * @param {string} encounterType - Encounter type
  * @return {EncounterModel} - Encounter for a given encounter type
  */
  checkIfEncounterExists(encounters: EncounterModel[], visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  /**
  * Get age of patient from birthdate
  * @param {string} birthdate - Birthdate
  * @return {string} - Age
  */
  getAge(birthdate: string) {
    let years = moment().diff(birthdate, 'years');
    let months = moment().diff(birthdate, 'months');
    let days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} years`;
    } else if (months > 1) {
      return `${months} months`;
    } else {
      return `${days} days`;
    }
  }

  /**
  * Get person attribute value for a given attribute type
  * @param {str'} attrType - Person attribute type
  * @return {any} - Value for a given attribute type
  */
  getPersonAttributeValue(attrType: string) {
    let val = 'NA';
    if (this.patient) {
      this.patient.person.attributes.forEach((attr: PersonAttributeModel) => {
        if (attrType == attr.attributeType.display) {
          val = attr.value;
        }
      });
    }
    return val;
  }

  /**
  * Replcae the string charaters with *
  * @param {string} str - Original string
  * @return {string} - Modified string
  */
  replaceWithStar(str: string) {
    let n = str.length;
    return str.replace(str.substring(0, n - 4), "*****");
  }

  /**
  * Get visit provider details
  * @param {EncounterModel[]} encounters - Array of visit encounters
  * @return {void}
  */
  getVisitProvider(encounters: EncounterModel[]) {
    encounters.forEach((encounter: EncounterModel) => {
      if (encounter.display.match(visitTypes.ADULTINITIAL) !== null) {
        this.providerName = encounter.encounterProviders[0].display;
        encounter.encounterProviders[0].provider.attributes.forEach(
          (attribute) => {
            if (attribute.display.match(doctorDetails.PHONE_NUMBER) != null) {
              this.hwPhoneNo = attribute.value;
            }
          }
        );
      }
    });
  }

  /**
  * Get vital observations from the vital encounter
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getVitalObs(encounters: EncounterModel[]) {
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display == visitTypes.VITALS) {
        this.vitalObs = enc.obs;
      }
    });
  }

  /**
  * Get vital value for a given vital uuid
  * @param {string} uuid - Vital uuid
  * @return {any} - Obs value
  */
  getObsValue(uuid: string, key?: string): any {
    const v = this.vitalObs.find(e => e.concept.uuid === uuid);
    const value = v?.value ? ( typeof v.value == 'object') ? v.value?.display : v.value : null;
    if(!value && key === 'bmi') {
      return calculateBMI(this.vitals, this.vitalObs);
    }
    return value
  }

  /**
  * Get chief complaints and patient visit reason/summary
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getCheckUpReason(encounters: EncounterModel[]) {
    this.cheifComplaints = [];
    this.checkUpReasonData = [];
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display == visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: ObsModel) => {
          if (obs.concept.display == visitTypes.CURRENT_COMPLAINT) {
            const currentComplaint =  this.visitService.getData(obs)?.value.replace(new RegExp('►', 'g'),'').split('<b>');
            for (let i = 0; i < currentComplaint.length; i++) {
              if (currentComplaint[i] && currentComplaint[i].length > 1) {
                const obs1 = currentComplaint[i].split('<');
                if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  this.cheifComplaints.push(obs1[0]);
                }

                const splitByBr = currentComplaint[i].split('<br/>');
                if (splitByBr[0].includes(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  let obj1: PatientHistoryModel = {};
                  obj1.title = visitTypes.ASSOCIATED_SYMPTOMS;
                  obj1.data = [];
                  for (let j = 1; j < splitByBr.length; j = j + 2) {
                    if (splitByBr[j].trim() && splitByBr[j].trim().length > 1) {
                      obj1.data.push({ key: splitByBr[j].replace('• ', '').replace(' -', ''), value: splitByBr[j + 1] });
                    }
                  }
                  this.checkUpReasonData.push(obj1);
                } else {
                  let obj1: PatientHistoryModel = {};
                  obj1.title = splitByBr[0].replace('</b>:', '');
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim() && splitByBr[k].trim().length > 1) {
                      const splitByDash = splitByBr[k].split('-');
                      obj1.data.push({ key: splitByDash[0].replace('• ', ''), value: splitByDash.slice(1, splitByDash.length).join('-') });
                    }
                  }
                  this.checkUpReasonData.push(obj1);
                }
              }
            }
          }
        });
      }
    });
  }

  /**
  * Get physical examination details
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getPhysicalExamination(encounters: EncounterModel[]) {
    this.physicalExaminationData = [];
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: ObsModel) => {
          if (obs.concept.display === 'PHYSICAL EXAMINATION') {
            const physicalExam = this.visitService.getData(obs)?.value.replace(new RegExp('<br/>►', 'g'), '').split('<b>');
            for (let i = 0; i < physicalExam.length; i++) {
              if (physicalExam[i]) {
                const splitByBr = physicalExam[i].split('<br/>');
                if (splitByBr[0].includes('Abdomen')) {
                  const obj1: PatientHistoryModel = {};
                  obj1.title = splitByBr[0].replace('</b>', '').replace(':', '').trim();
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim()) {
                      obj1.data.push({ key: splitByBr[k].replace('• ', ''), value: null });
                    }
                  }
                  this.physicalExaminationData.push(obj1);
                } else {
                  const obj1: PatientHistoryModel = {};
                  obj1.title = splitByBr[0].replace('</b>', '').replace(':', '').trim();
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim()) {
                      const splitByDash = splitByBr[k].split('-');
                      obj1.data.push({ key: splitByDash[0].replace('• ', ''), value: splitByDash.slice(1, splitByDash.length).join('-') });
                    }
                  }
                  this.physicalExaminationData.push(obj1);
                }
              }
            }
          }
        });
      }
    });
  }

  /**
  * Get medical history details
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getMedicalHistory(encounters: EncounterModel[]) {
    this.patientHistoryData = [];
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: ObsModel) => {
          if (obs.concept.display === visitTypes.MEDICAL_HISTORY) {
            const medicalHistory = this.visitService.getData(obs)?.value.split('<br/>');
            const obj1: PatientHistoryModel = {};
            obj1.title = this.translateService.instant('Patient history');
            obj1.data = [];
            for (let i = 0; i < medicalHistory.length; i++) {
              if (medicalHistory[i]) {
                const splitByDash = medicalHistory[i].split('-');
                obj1.data.push({ key: splitByDash[0].replace('• ', '').trim(), value: splitByDash.slice(1, splitByDash.length).join('-').trim() });
              }
            }
            this.patientHistoryData.push(obj1);
          }
          if (obs.concept.display === visitTypes.FAMILY_HISTORY) {
            const familyHistory = this.visitService.getData(obs)?.value.split('<br/>');
            const obj1: PatientHistoryModel = {};
            obj1.title = this.translateService.instant('Family history');
            obj1.data = [];
            for (let i = 0; i < familyHistory.length; i++) {
              if (familyHistory[i]) {
                if (familyHistory[i].includes(':')) {
                  const splitByColon = familyHistory[i].split(':');
                  const splitByDot = splitByColon[1].trim().split("•");
                  splitByDot.forEach(element => {
                    if(element.trim()){
                      const splitByComma = element.split(',');
                      obj1.data.push({ key: splitByComma.shift().trim(), value: splitByComma.length ? splitByComma.toString().trim() : " " });
                    }
                  });
                } else {
                  obj1.data.push({ key: familyHistory[i].replace('•', '').trim(), value: null });
                }
              }
            }
            this.patientHistoryData.push(obj1);
          }
        });
      }
    });
  }

  /**
  * Get eye images
  * @param {VisitModel} visit - Visit
  * @return {void}
  */
  getEyeImages(visit: VisitModel) {
    this.eyeImages = [];
    this.diagnosisService.getObs(visit.patient.uuid, this.conceptPhysicalExamination).subscribe((response) => {
      response.results.forEach(async (obs: ObsModel) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const imageBase64 = await this.toObjectUrl(`${this.baseURL}/obs/${obs.uuid}/value`);
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value`, section:obs.comment, base64: imageBase64.toString()};
          this.eyeImages.push(data);
        }
      });
    });
  }

  /**
  * Open eye images preview modal
  * @param {number} index - Index
  * @param {string} section - Section title
  * @return {void}
  */
  previewEyeImages(index: number,section: string) {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.getImagesBySection(section) }).subscribe((res) => { });
  }

  /**
  * Get additional docs
  * @param {VisitModel} visit - Visit
  * @return {void}
  */
  getVisitAdditionalDocs(visit: VisitModel) {
    this.additionalDocs = [];
    this.diagnosisService.getObs(visit.patient.uuid, this.conceptAdditionlDocument).subscribe((response) => {
      response.results.forEach(async (obs: ObsModel) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const src = `${this.baseURL}/obs/${obs.uuid}/value`;
          const base64 = await this.toObjectUrl(src);
          const data = { src: src, section:obs.comment, base64: base64.toString()};
          this.additionalDocs.push(data);
        }
      });
    });
  }

  /**
  * Open doc images preview modal
  * @param {number} index - Index
  * @return {void}
  */
  previewDocImages(index: number) {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.additionalDocs }).subscribe((res) => {});
  }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

  /**
  * Getting Images by section
  * @param {string} section - Section Title
  * @returns {arra}
  */
  getImagesBySection(section){
    return this.eyeImages.filter(o=>o.section?.toLowerCase() === section?.toLowerCase());
  }

  /**
  * Get whatsapp link
  * @return {string} - Whatsapp link
  */
  getWhatsAppLink() {
    return this.visitService.getWhatsappLink(this.getPersonAttributeValue(doctorDetails.TELEPHONE_NUMBER), `Hello I'm calling for consultation`);
  }

  /**
  * Download visit summary
  * @return {void}
  */
  async downloadVisitSummary() {
    const userImg: any = await this.toObjectUrl(`${this.baseUrl}/personimage/${this.patient?.person.uuid}`);
    const pdfObj = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [ 20, 50, 20, 20 ],
      watermark: { text: 'INTELEHEALTH', color: 'var(--color-gray)', opacity: 0.1, bold: true, italics: false, angle: 0, fontSize: 50 },
      header: {
        columns: [
          { text: ''},
          { image: 'logo', width: 90, height: 30, alignment: 'right', margin: [0, 10, 10, 0] }
        ]
      },
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            { text: 'Copyright ©2023 Intelehealth, a 501 (c)(3) & Section 8 non-profit organisation', fontSize: 8, margin: [5, 5, 5, 5] },
            { text: currentPage.toString() + ' of ' + pageCount, fontSize: 8, margin: [5, 5, 5, 5], alignment: 'right'}
          ]
        };
      },
      content: [
        {
          style: 'tableExample',
          table: {
            widths: ['25%', '30%', '22%', '23%'],
            body: [
              [
                {
                  colSpan: 4,
                  fillColor: '#E6FFF3',
                  text: 'Intelehealth e-Visit Summary',
                  alignment: 'center',
                  style: 'header'
                },
                '',
                '',
                ''
              ],
              [
                {
                  table: {
                    widths: ['auto', '*'],
                    body: [
                      [
                        {
                          image: (userImg && !userImg?.includes('application/json')) ? userImg : 'user',
                          width: 30,
                          height: 30,
                          margin: [0, (userImg && !userImg?.includes('application/json')) ? 15 : 5, 0, 5]
                        },
                        [
                          {
                            text: `${this.patient?.person.display} (${this.patient?.person.gender})`,
                            bold: true,
                            margin: [0, 15, 0, 5],
                          }
                        ]
                      ]
                    ]
                  },
                  layout: "noBorders"
                },
                {
                  table: {
                    widths: ['100%'],
                    body: [
                      [
                        [
                          {text: 'Age', style: 'subheader'},
                          `${this.patient?.person.birthdate ? this.getAge(this.patient?.person.birthdate) : this.patient?.person.age}`,
                          {text: 'Address', style: 'subheader'},
                          `${this.patient?.person.preferredAddress.cityVillage.replace(':', ' : ')}`
                        ]
                      ]
                    ]
                  },
                  layout:  {
                    vLineWidth: function (i, node) {
                      if (i === 0) {
                        return 1;
                      }
                      return 0;
                    },
                    hLineWidth: function (i, node) {
                      return 0;
                    },
                    vLineColor: function (i) {
                      return "lightgray";
                    },
                  }
                },
                {
                  table: {
                    widths: ['100%'],
                    body: [
                      [
                        [
                          {text: 'Occupation', style: 'subheader'},
                          `${this.getPersonAttributeValue('occupation')}`,
                          {text: 'National ID', style: 'subheader'},
                          `${this.getPersonAttributeValue('NationalID')}`
                        ]
                      ]
                    ]
                  },
                  layout: {
                    vLineWidth: function (i, node) {
                      if (i === 0) {
                        return 1;
                      }
                      return 0;
                    },
                    hLineWidth: function (i, node) {
                      return 0;
                    },
                    vLineColor: function (i) {
                      return "lightgray";
                    },
                  }
                },
                {
                  table: {
                    widths: ['100%'],
                    body: [
                      [ 
                        [ {text: 'Contact no.', style: 'subheader'},
                          `${this.getPersonAttributeValue('Telephone Number') ? this.getPersonAttributeValue('Telephone Number') : 'NA'}`
                        ]
                      ],
                    ]
                  },
                  layout: {
                    vLineWidth: function (i, node) {
                      if (i === 0) {
                        return 1;
                      }
                      return 0;
                    },
                    hLineWidth: function (i, node) {
                      return 0;
                    },
                    vLineColor: function (i) {
                      return "lightgray";
                    },
                  }
                }
              ],
              [
                {
                  colSpan: 4,
                  table: {
                    widths: [30, '*'],
                    headerRows: 1,
                    body: [
                      [ {image: 'consultation_details', width: 25, height: 25, border: [false, false, false, true] }, {text: 'Consultation details', style: 'sectionheader', border: [false, false, false, true] }],
                      [ 
                        {
                          colSpan: 2,
                          ul: [
                            {text: [{text: 'Visit ID:', bold: true}, ` ${(this.visit?.uuid) ? this.replaceWithStar(this.visit?.uuid).toUpperCase() : "" }`], margin: [0, 5, 0, 5]},
                            {text: [{text: 'Visit Created:', bold: true}, ` ${moment(this.visit?.startDatetime).format('DD MMM yyyy')}`],  margin: [0, 5, 0, 5]},
                            {text: [{text: 'Appointment on:', bold: true}, ` No appointment`],  margin: [0, 5, 0, 5]},
                            {text: [{text: 'Status:', bold: true}, ` ${this.visitStatus}`],  margin: [0, 5, 0, 5]},
                            {text: [{text: 'Location:', bold: true}, ` ${this.clinicName}`],  margin: [0, 5, 0, 5]},
                            {text: [{text: 'Provided by:', bold: true}, ` ${this.providerName}`],  margin: [0, 5, 0, 5]}
                          ]
                        }
                        
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false
                  }
                }
              ],
              [
                {
                  colSpan: 4,
                  sectionName: 'vitals',
                  table: {
                    widths: [30, '*'],
                    headerRows: 1,
                    body: [
                      [ {image: 'vitals', width: 25, height: 25, border: [false, false, false, true] }, {text: 'Vitals', style: 'sectionheader', border: [false, false, false, true] }],
                      [ 
                        {
                          colSpan: 2,
                          ul: [
                            ...this.getRecords('Vitals')
                          ]
                        }
                      ]
                    ]
                  },
                  layout: {
                    defaultBorder: false
                  }
                },
                
              ],
              [
                {
                  colSpan: 4,
                  table: {
                    widths: [30, '*'],
                    headerRows: 1,
                    body: [
                      [ {image: 'cheifComplaint', width: 25, height: 25, border: [false, false, false, true] }, {text: 'Chief complaint', style: 'sectionheader', border: [false, false, false, true] }],
                      ...this.getRecords('symptoms'),
                      [{ text: 'Associated symptoms', style: 'subSectionheader', colSpan: 2 }, ''],
                      [
                        {
                          colSpan: 2,
                          ul: [
                            ...this.getRecords('associated_symptoms')
                          ]
                        }
                      ]
                    ]
                  },
                  layout: {
                    defaultBorder: false
                  }
                },
                '',
                '',
                ''
              ],
              [
                {
                  colSpan: 4,
                  table: {
                    widths: [30, '*'],
                    headerRows: 1,
                    body: [
                      [ {image: 'physicalExamination', width: 25, height: 25, border: [false, false, false, true] }, {text: 'Physical examination', style: 'sectionheader', border: [false, false, false, true] }],
                      ...this.getRecords('physical_examination'),
                      [{ text: 'Abdomen', style: 'subSectionheader', colSpan: 2 }, ''],
                      [
                        {
                          colSpan: 2,
                          ul: [
                            ...this.getRecords('abdomen_examination')
                          ]
                        }
                      ]
                    ]
                  },
                  layout: {
                    defaultBorder: false
                  }
                },
                '',
                '',
                ''
              ],
              [
                {
                  colSpan: 4,
                  table: {
                    widths: [30, '*'],
                    headerRows: 1,
                    body: [
                      [ {image: 'medicalHistory', width: 25, height: 25, border: [false, false, false, true] }, {text: 'Medical history', style: 'sectionheader', border: [false, false, false, true] }],
                      ...this.getRecords('medical_history')
                    ]
                  },
                  layout: {
                    defaultBorder: false
                  }
                },
                '',
                '',
                ''
              ],
              [
                {
                  colSpan: 4,
                  table: {
                    widths: [30, '*'],
                    headerRows: 1,
                    body: [
                      [ {image: 'medicalHistory', width: 25, height: 25, border: [false, false, false, true] }, {text: 'Additional documents', style: 'sectionheader', border: [false, false, false, true] }],
                      ...this.getRecords('additionalDocs')
                    ]
                  },
                  layout: {
                    defaultBorder: false
                  }
                },
                '',
                '',
                ''
              ]
            ]
          },
          layout: 'noBorders'
        }
      ],
      images: { ...visit_logos, ...main_logo},
      styles: {
        header: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 10]
        },
        subheader: {
          fontSize: 12,
          bold: false,
          margin: [0, 5, 0, 5],
          color: 'var(--color-gray)'
        },
        tableExample: {
          margin: [0, 5, 0, 5],
          fontSize: 12
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'black'
        },
        sectionheader: {
          fontSize: 12,
          bold: true,
          margin: [0, 5, 0, 10]
        },
        subSectionheader: {
          fontSize: 12,
          bold: true,
          margin: [0, 5, 0, 0]
        },
      },
      
      defaultStyle: {
        font: 'DmSans'
      }
    };
    pdfObj.content[0].table.body = pdfObj.content[0].table.body.filter((section:any)=>{
      if(section[0].sectionName === 'vitals' && !this.hasVitalsEnabled) return false;
      return true;
    });
    pdfMake.createPdf(pdfObj).download('e-visit-summary');
  }

  toObjectUrl(url: string) {
    return fetch(url)
        .then((response) => {
          return response.blob();
        })
        .then(blob => {
          return new Promise((resolve, _) => {
              if (!blob) { resolve(''); }
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
          });
        });
  }

  /**
  * Get rows for make pdf doc defination for a given type
  * @param {string} type - row type
  * @return {any} - Rows
  */
  getRecords(type: string) {
    const records = [];
    switch (type) {
      case 'medical_history':
        if (this.patientHistoryData.length) {
          this.patientHistoryData.forEach(ph => {
            records.push([{ text: `${ph.title}`, style: 'subSectionheader', colSpan: 2 }])
            let ph_data = {
              colSpan: 2,
              ul: []
            };
            ph.data.forEach(phi=>{
              ph_data.ul.push({text: [{text: `${phi.key} : `, bold: true}, `${phi.value?phi.value:'None'}`], margin: [0, 5, 0, 5]});
            });
            records.push([ph_data]);
          });
        }
        break;
      case 'physical_examination':
        if (this.physicalExaminationData.length) {
          this.physicalExaminationData.forEach(pe => {
            if(pe.title !== 'Abdomen'){
              records.push([{ text: `${pe.title}`, style: 'subSectionheader', colSpan: 2 }]);
              let pe_data = {
                colSpan: 2,
                ul: []
              };
              pe.data.forEach(pei=>{
                pe_data.ul.push({text: [{text: `${pei.key} : `, bold: true}, `${pei.value?pei.value:'None'}`], margin: [0, 5, 0, 5]});
              });
              if(this.getImagesBySection(pe.title).length){
                let colsImages = [];
                pe_data.ul.push({text: [{text: `Pictures : `, bold: true}, ''], margin: [0, 5, 0, 5]});
                records.push([pe_data]);
                this.getImagesBySection(pe.title).forEach((img,i)=>{
                  colsImages.push({image:img.base64,width:30, height:30});
                });
                records.push([{
                  colSpan: 2,
                  columns: colsImages,
                  columnGap:10
                }]);
              } else {
                records.push([pe_data]);
              }
            }
          });
        }
        break;
      case 'abdomen_examination':
        if (this.physicalExaminationData.length) {
          this.physicalExaminationData.forEach(pe => {
            if(pe.title === 'Abdomen'){
              pe.data.forEach(pei=>{
                records.push({text: [{text: `${pei.key}`, bold: true}, ` `], margin: [0, 5, 0, 5]});
              })
              if(this.getImagesBySection(pe.title).length){
                let colsImages = [];
                records.push({text: [{text: `Pictures : `, bold: true}, ` `], margin: [0, 5, 0, 5]});
                this.getImagesBySection(pe.title).forEach((img,i)=>{
                  colsImages.push({image:img.base64,width:30, height:30});
                });
                records.push([{
                  colSpan: 2,
                  columns: colsImages,
                  columnGap:10
                }]);
              }
            }
          });
        }
        break;
      case 'symptoms':
        if (this.checkUpReasonData.length) {
          this.checkUpReasonData.forEach(ckr => {
            if(ckr.title !== 'Associated symptoms'){
              records.push([{ text: `${ckr.title}`, style: 'subSectionheader', colSpan: 2 }])
              let ckr_data = {
                colSpan: 2,
                ul: []
              };
              ckr.data.forEach(ckri=>{
                ckr_data.ul.push({text: [{text: `${ckri.key} : `, bold: true}, `${ckri.value?ckri.value:'None'}`], margin: [0, 5, 0, 5]});
              })
              records.push([ckr_data])
            }
          });
        }
        break;
      case 'associated_symptoms':
        if (this.checkUpReasonData.length) {
          this.checkUpReasonData.forEach(ckr => {
            if(ckr.title === 'Associated symptoms'){
              ckr.data.forEach(ckri=>{
                records.push({text: [{text: `${ckri.key} : `, bold: true}, `${ckri.value?ckri.value:'None'}`], margin: [0, 5, 0, 5]});
              })
            }
          });
        }
        break;
      case 'cheifComplaint':
        if (this.cheifComplaints.length) {
          this.cheifComplaints.forEach(cc => {
            records.push({text: [{text: cc, bold: true}, ``], margin: [0, 5, 0, 5]});
          });
        }
        break;
      case visitTypes.VITALS:
        this.vitals.forEach((v: VitalModel) => {
          records.push({ text: [{ text: `${v.name} : `, bold: true }, `${this.getObsValue(v.uuid, v.key) ? this.getObsValue(v.uuid, v.key) : `No information`}`], margin: [0, 5, 0, 5] });
        });
        break;
      
      case 'additionalDocs':
        console.log(this.additionalDocs)
        if (this.additionalDocs.length) {
          let colsImages = [];
          this.additionalDocs.forEach(img => {
            colsImages.push({image:img.base64,width:30, height:30});
          });
          records.push([{
            colSpan: 2,
            columns: colsImages,
            columnGap:10,
            margin: [0, 5, 0, 5]
          }]);
        }
        break;
    }
    return records;
  }

  checkPatientRegField(fieldName): boolean{
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }
}
