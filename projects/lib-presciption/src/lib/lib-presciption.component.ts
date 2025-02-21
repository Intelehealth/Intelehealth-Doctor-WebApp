import { Component, Inject, Input, OnDestroy, OnInit ,NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AppConfigService } from '../lib/services/app-config.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DiagnosisModel, EncounterModel, EncounterProviderModel, FollowUpDataModel, MedicineModel, ObsApiResponseModel, ObsModel, PatientIdentifierModel, PatientModel, PatientRegistrationFieldsModel, PatientVisitSection, PersonAttributeModel, ProviderAttributeModel, ReferralModel, TestModel, VisitAttributeModel, VisitModel, VitalModel } from './model/model';
import { checkIsEnabled, VISIT_SECTIONS } from './utils/visit-sections';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { calculateBMI, getFieldValueByLanguage, isFeaturePresent } from './utils/utility-functions';
import { conceptIds, doctorDetails, visitTypes } from './config/constant';
import * as pdfMake from 'pdfmake/build/pdfmake';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { precription } from "./utils/base64"
import { visit as visit_logos, logo as main_logo} from "./utils/base64"
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'lib-presciption',
  standalone: true,
  imports: [  
    CommonModule,
    MatIconModule,
    MatButtonModule, 
   ],
  templateUrl: './lib-prescription.component.html',
  styleUrls: ['./lib-prescription.component.scss'],
  providers: [AppConfigService],
   schemas: [NO_ERRORS_SCHEMA]
})
export class LibPresciptionComponent implements OnInit,OnDestroy {

    @Input() isDownloadPrescription: boolean = false;
    @Input() visitId: string;
    @Input() download: Observable<any>;

    configPublicURL = "https://dev.intelehealth.org:4004/";
    baseUrl: string = "https://dev.intelehealth.org/openmrs/ws/rest/v1"
    logoImageURL: string;
    visit: VisitModel;
    patient: PatientModel;
    pvsConfigs: PatientVisitSection[] = [];
    pvsConstant = VISIT_SECTIONS;
    patientRegFields: string[] = [];
    completedEncounter: EncounterModel = null;
    visitNotePresent: EncounterModel;
    spokenWithPatient: string = 'No';
    notes: ObsModel[] = [];
    medicines: MedicineModel[] = [];
    existingDiagnosis: DiagnosisModel[] = [];
    advices: ObsModel[] = [];
    additionalInstructions: ObsModel[] = [];
    tests: TestModel[] = [];
    referrals: ReferralModel[] = [];
    followUp: FollowUpDataModel;
    consultedDoctor: any;
    followUpInstructions: ObsModel[] = [];

  conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  conceptNote = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptTest = '23601d71-50e6-483f-968d-aeef3031346d';
  conceptReferral = '605b6f15-8f7a-4c45-b06d-14165f6974be';
  conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';
  conceptFollowUpInstruction = conceptIds.conceptFollowUpInstruction;

  signaturePicUrl: string = null;
  signatureFile = null;
  
  cheifComplaints: string[] = [];
  vitalObs: ObsModel[] = [];
  
  vitals: VitalModel[] = [];
  hasVitalsEnabled: boolean = false;
  hasPatientOtherEnabled: boolean = false;
  hasPatientAddressEnabled: boolean = false;
  visitStatus: string;
  clinicName: string;
  providerName: string;

  eventsSubscription: any;

 
  constructor(
     @Inject(MAT_DIALOG_DATA) public data:any,
      private dialogRef: MatDialogRef<LibPresciptionComponent>,
      private appConfigService: AppConfigService,
      private translateService: TranslateService,
    ) {
     
    }

ngOnInit(): void {
  console.log("Inside ngOnInit in LibPresciptionComponent");

  this.appConfigService.load().then(() => {
    console.log("AppConfigService Loaded Successfully:", this.appConfigService);

    if (!this.appConfigService.patient_registration) {
      console.warn("AppConfigService is still undefined.");
      return;
    }

    this.vitals = [...(this.appConfigService.patient_vitals || [])];
    this.hasVitalsEnabled = this.appConfigService.patient_vitals_section || false;
    this.hasPatientAddressEnabled = this.appConfigService?.patient_reg_address || false;
    this.hasPatientOtherEnabled = this.appConfigService?.patient_reg_other || false;

    Object.keys(this.appConfigService.patient_registration).forEach(obj => {
      this.patientRegFields.push(
        ...this.appConfigService.patient_registration[obj]
          .filter((e: { is_enabled: any }) => e.is_enabled)
          .map((e: { name: any }) => e.name)
      );
    });
  }).catch(error => {
    console.error("Failed to load AppConfigService:", error);
  });
}



   /**
      * Download prescription
      * @return {Promise<void>}
      */
    async downloadPrescription(): Promise<void> {
      console.log("Download Prescription")
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
  * Get image from url as a base64
  * @param {string} url - Image url
  * @return {Promise} - Promise containing base64 image
  */
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
   checkPatientRegField(fieldName: string): boolean{
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

    getPersonalInfo() {
      const data = {
        colSpan: 4,
        layout: 'noBorders',
        table: {
          widths: ['*','*','*','*'],
          body: [
            [
              {
                colSpan: 4,
                text: `Personal Information`,
                style: 'subheader'
              },
              '',
              '',
              ''
            ]
          ]
        }
      };
  
      let other = [];
      this.appConfigService.patient_registration['personal'].forEach((e: PatientRegistrationFieldsModel) => {
        let value: any;
        switch (e.name) {
          case 'Gender':
            value = this.patient?.person.gender == 'M' ? 'Male' : 'Female';
            break;
          case 'Age':
            value = this.patient?.person.age + ' years';
            break;
          case 'Date of Birth':
            value = new Date(this.patient?.person.birthdate).toDateString();
            break;
          case 'Phone Number':
            value = this.getPersonAttributeValue('Telephone Number');
            break;
          case 'Guardian Type':
            value = this.getPersonAttributeValue('Guardian Type');
            break;
          case 'Guardian Name':
            value = this.getPersonAttributeValue('Guardian Name');
            break;
          case 'Emergency Contact Name':
            value = this.getPersonAttributeValue('Emergency Contact Name');
            break;
          case 'Emergency Contact Number':
            value = this.getPersonAttributeValue('Emergency Contact Number');
            break;
          case 'Contact Type':
            value = this.getPersonAttributeValue('Contact Type');
            break;
          case 'Email':
            value = this.getPersonAttributeValue('Email');
            break;
          default:
            break;
        }
        if (value !== 'NA' && value) {
          other.push({
            stack: [
              { text: e.name, style: 'subsubheader' },
              { text: value, style: 'pval' }
            ]
          });
        }
      });
      const chunkSize = 4;
      for (let i = 0; i < other.length; i += chunkSize) {
        const chunk = other.slice(i, i + chunkSize);
        if (chunk.length == chunkSize) {
          data.table.body.push([...chunk]);
        } else {
          for (let x = chunk.length; x < chunkSize; x++) {
            chunk[x] = '';
          }
          data.table.body.push([...chunk]);
        }
      }
  
      return data;
    }
  
    getAddress() {
      const data = {
        colSpan: 4,
        layout: 'noBorders',
        table: {
          widths: ['*','*','*','*'],
          body: []
        }
      };
      if (this.hasPatientAddressEnabled) {
        data.table.body.push([
          {
            colSpan: 4,
            text: `Address`,
            style: 'subheader'
          },
          '',
          '',
          ''
        ]);
        let other = [];
        this.appConfigService.patient_registration['address'].forEach((e: PatientRegistrationFieldsModel) => {
          let value: any;
          switch (e.name) {
            case 'Household Number':
              value = this.patient?.person?.preferredAddress?.address6;
              break;
            case 'Corresponding Address 1':
              value = this.patient?.person?.preferredAddress?.address1;
              break;
            case 'Corresponding Address 2':
              value = this.patient?.person?.preferredAddress?.address2;
              break;
            case 'Block':
              value = this.patient?.person?.preferredAddress?.address3;
              break;
            case 'Village/Town/City':
              value = this.patient?.person.preferredAddress.cityVillage;
              break;
            case 'District':
              value = this.patient?.person.preferredAddress.countyDistrict;
              break;
            case 'State':
              value = this.patient?.person.preferredAddress.stateProvince;
              break;
            case 'Country':
              value = this.patient?.person.preferredAddress.country;
              break;
            case 'Postal Code':
              value = this.patient?.person.preferredAddress.postalCode;
              break;
            default:
              break;
          }
          if (value) {
            other.push({ 
              stack: [
                { text: e.name, style: 'subsubheader' },
                { text: value, style: 'pval' }
              ] 
            });
          }
        });
        const chunkSize = 4;
        for (let i = 0; i < other.length; i += chunkSize) {
            const chunk = other.slice(i, i + chunkSize);
            if (chunk.length == chunkSize) {
              data.table.body.push([...chunk]);
            } else {
              for (let x = chunk.length; x < chunkSize; x++) {
                chunk[x] = '';
              }
              data.table.body.push([...chunk]);
            }
        }
      } else {
        data.table.body.push(['','','','']);
      }
      return data;
    }
  
    getOtherInfo() {
      const data = {
        colSpan: 4,
        layout: 'noBorders',
        table: {
          widths: ['*','*','*','*'],
          body: []
        }
      };
      if (this.hasPatientOtherEnabled) {
        data.table.body.push([
          {
            colSpan: 4,
            text: `Other Information`,
            style: 'subheader'
          },
          '',
          '',
          ''
        ]);
        let other = [];
        this.appConfigService.patient_registration['other'].forEach((e: PatientRegistrationFieldsModel) => {
          let value: any;
          switch (e.name) {
            case 'Occupation':
              value = this.getPersonAttributeValue('occupation');
              break;
            case 'Education':
              value = this.getPersonAttributeValue('Education Level');
              break;
            case 'National ID':
              value = this.getPersonAttributeValue('NationalID');
              break;
            case 'Economic Category':
              value = this.getPersonAttributeValue('Economic Status');
              break;
            case 'Social Category':
              value = this.getPersonAttributeValue('Caste');
              break;
            // case 'TMH Case Number':
            //   value = this.getPersonAttributeValue('TMH Case Number');
            //   break;
            case 'Request ID':
              value = this.getPersonAttributeValue('Request ID');
              break;
            case 'Discipline':
              value = this.getPersonAttributeValue('Discipline');
              break;
            case 'Department':
              value = this.getPersonAttributeValue('Department');
              break;
            case 'Relative Phone Number':
              value = this.getPersonAttributeValue('Relative Phone Number');
              break;
            default:
              break;
          }
          if (value != 'NA' && value) {
            other.push({ 
              stack: [
                { text: e.name, style: 'subsubheader' },
                { text: value, style: 'pval' }
              ] 
            });
          }
        });
        const chunkSize = 4;
        for (let i = 0; i < other.length; i += chunkSize) {
            const chunk = other.slice(i, i + chunkSize);
            if (chunk.length == chunkSize) {
              data.table.body.push([...chunk]);
            } else {
              for (let x = chunk.length; x < chunkSize; x++) {
                chunk[x] = '';
              }
              data.table.body.push([...chunk]);
            }
        }
      } else {
        data.table.body.push(['','','','']);
      }
      return data;
    }

      /**
      * Get person attribute value for a given attribute type
      * @param {str'} attrType - Person attribute type
      * @return {any} - Value for a given attribute type
      */
      getPersonAttributeValue(attrType: string) {
        let val = this.translateService.instant('NA');
        if (this.patient) {
          this.patient.person.attributes.forEach((attr: PersonAttributeModel) => {
            if (attrType === attr.attributeType.display) {
              val = attr.value;
            }
          });
        }
        return val;
      }
        /**
        * Get rows for make pdf doc defination for a given type
        * @param {string} type - row type
        * @return {any} - Rows
        */
        getRecords(type: string) {
          const records = [];
          switch (type) {
            case 'diagnosis':
              if (this.existingDiagnosis.length) {
                this.existingDiagnosis.forEach(d => {
                  records.push([d.diagnosisName, (this.isFeatureAvailable('tnmStaging') ? d.diagnosisTNMStaging ?? '-' : []), d.diagnosisType, d.diagnosisStatus]);
                });
              } else {
                records.push([{ text: 'No diagnosis added', colSpan: 3, alignment: 'center' }]);
              }
              break;
            case 'medication':
              if (this.medicines.length) {
                this.medicines.forEach(m => {
                  records.push([m.drug, m.strength, m.days, m.timing, m.frequency, m.remark]);
                });
              } else {
                records.push([{ text: 'No medicines added', colSpan: 6, alignment: 'center' }]);
              }
              break;
            case 'additionalInstruction':
              if (this.additionalInstructions.length) {
                this.additionalInstructions.forEach(ai => {
                  records.push({ text: ai.value, margin: [0, 5, 0, 5] });
                });
              } else {
                records.push([{ text: 'No additional instructions added'}]);
              }
              break;
            case 'advice':
              if (this.advices.length) {
                this.advices.forEach(a => {
                  records.push({ text: a.value, margin: [0, 5, 0, 5] });
                });
              } else {
                records.push([{ text: 'No advices added'}]);
              }
              break;
            case 'test':
              if (this.tests.length) {
                this.tests.forEach(t => {
                  records.push({ text: t.value, margin: [0, 5, 0, 5] });
                });
              } else {
                records.push([{ text: 'No tests added'}]);
              }
              break;
            case 'referral':
              const referralFacility = this.isFeatureAvailable('referralFacility', true)
              const priorityOfReferral = this.isFeatureAvailable('priorityOfReferral', true)
              let length = 2;
              if (this.referrals.length) {
                this.referrals.forEach(r => {
                  const referral = [r.speciality];
                  if(referralFacility) referral.push(r.facility)
                  if(priorityOfReferral) referral.push(r.priority)
                  referral.push(r.reason? r.reason : '-')
                  records.push(referral);
                  length = referral.length
                });
              } else {
                if(referralFacility) length += 1;
                if(priorityOfReferral) length += 1;
                records.push([{ text: 'No referrals added', colSpan: length, alignment: 'center' }]);
              }
              break;
            case 'followUp':
                if (this.followUp) {
                  records.push([this.followUp.wantFollowUp, (this.isFeatureAvailable('followUpType') ? [this.followUp.followUpType ?? '-'] : []), this.followUp.followUpDate ? moment(this.followUp.followUpDate).format('DD MMM YYYY') : '-', 
                   this.followUp.followUpTime ?? '-', this.followUp.followUpReason ?? '-']);
                } else {
                  records.push([{ text: 'No follow-up added', colSpan: this.isFeatureAvailable('followUpType') ? 5 : 4, alignment: 'center' }]);
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
                records.push({ text: [{ text: `${v.lang !== null ? this.getLanguageValue(v) : v.name } : `, bold: true }, `${this.getObsValue(v.uuid, v.key) ? this.getObsValue(v.uuid, v.key) : `No information`}`], margin: [0, 5, 0, 5] });        });
              break;
            case 'followUpInstructions':
              if (this.followUpInstructions) {
                this.followUpInstructions.forEach(t => {
                  records.push({ text: t.value, margin: [0, 5, 0, 5] });
                });
              } else {
                records.push([{ text: 'No Follow Up Instructions added'}]);
              }
              break;
          }
          return records;
        }
/**
    * Retrieve the appropriate language value from an element.
    * @param {any} element - An object containing `lang` and `name`.
    * @return {string} - The value in the selected language or the first available one.
    * Defaults to `element.name` if no language value is found.
    */
  getLanguageValue(element: any): string {
    return getFieldValueByLanguage(element)
  }
          
  isFeatureAvailable(featureName: string, notInclude = false): boolean {
    return isFeaturePresent(featureName, notInclude);
  }
   getDoctorRecommandation(){
    let subFields = [[
      {
        colSpan: 4,
        table: {
          widths: [30, '*'],
          headerRows: 1,
          body: [
            [ {image: 'medication', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Medications Advised', style: 'sectionheader', border: [false, false, false, true] }],
            [
              {
                colSpan: 2,
                table: {
                  widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                  headerRows: 1,
                  body: [
                    [{text: 'Drug name', style: 'tableHeader'}, {text: 'Strength', style: 'tableHeader'}, {text: 'No. of days', style: 'tableHeader'}, {text: 'Timing', style: 'tableHeader'}, {text: 'Frequency', style: 'tableHeader'}, {text: 'Remarks', style: 'tableHeader'}],
                    ...this.getRecords('medication')
                  ]
                },
                layout: 'lightHorizontalLines'
              }
            ],
            [{ text: 'Additional Instructions:', style: 'sectionheader', colSpan: 2 }, ''],
            [
              {
                colSpan: 2,
                ul: [
                  ...this.getRecords('additionalInstruction')
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
            [ {image: 'test', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Investigations Advised', style: 'sectionheader', border: [false, false, false, true] }],
            [
              {
                colSpan: 2,
                ul: [
                  ...this.getRecords('test')
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
          body:  [
            [ {image: 'referral', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Referral Advise', style: 'sectionheader', border: [false, false, false, true] }],
            [
              {
                colSpan: 2,
                table: this.renderReferralSectionPDF(),
                layout: 'lightHorizontalLines'
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
    ]];

    if(this.isFeatureAvailable('doctor-recommendation')){
      return [
        [
          {
            colSpan: 4,
            table: {
              widths: [30, '*','auto','auto'],
              headerRows: 1,
              body: [
                [ {image: 'advice', width: 25, height: 25, border: [false, false, false, true]  }, {colSpan: 3, text: 'Doctor\'s Recommendation', style: 'sectionheader', border: [false, false, false, true] },'',''],
                ...subFields
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
    } else {
      return subFields;
    }
  }

  
    renderReferralSectionPDF() {
      const referralFacility = isFeaturePresent('referralFacility', true)
      const priorityOfReferral = isFeaturePresent('priorityOfReferral', true)
      if (!referralFacility && !priorityOfReferral) {
        return {
          widths: ['35%', '65%'],
          headerRows: 1,
          body: [
            [{ text: 'Referral to', style: 'tableHeader' }, { text: 'Referral for (Reason)', style: 'tableHeader' }],
            ...this.getRecords('referral')
          ]
        }
      }
  
      if (!priorityOfReferral) {
        return {
          widths: ['35%', '35%', '30%'],
          headerRows: 1,
          body: [
            [{ text: 'Referral to', style: 'tableHeader' }, { text: 'Referral facility', style: 'tableHeader' }, { text: 'Referral for (Reason)', style: 'tableHeader' }],
            ...this.getRecords('referral')
          ]
        }
      }
  
      if (!referralFacility) {
        return {
          widths: ['35%', '35%', '30%'],
          headerRows: 1,
          body: [
            [{ text: 'Referral to', style: 'tableHeader' }, { text: 'Priority', style: 'tableHeader' }, { text: 'Referral for (Reason)', style: 'tableHeader' }],
            ...this.getRecords('referral')
          ]
        }
      }
  
      return {
        widths: ['30%', '30%', '10%', '30%'],
        headerRows: 1,
        body: [
          [{ text: 'Referral to', style: 'tableHeader' }, { text: 'Referral facility', style: 'tableHeader' }, { text: 'Priority', style: 'tableHeader' }, { text: 'Referral for (Reason)', style: 'tableHeader' }],
          ...this.getRecords('referral')
        ]
      }
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
    * Getter for signature
    * @return {any} - Signature
    */
    get signature(): any {
      return this.attributes.find((a: { attributeType: { display: string; }; }) => a?.attributeType?.display === doctorDetails.SIGNATURE);
    }
      /**
  * Getter for doctor provider attributes
  * @return {ProviderAttributeModel[]} - Doctor provider attributes
  */
  get attributes() {
    return Array.isArray(this.consultedDoctor?.attributes) ? this.consultedDoctor.attributes : [];
  }

   /**
  * Get patient identifier for a given identifier type
  * @param {string} identifierType - Identifier type
  * @returns {string} - Patient identifier for a given identifier type
  */
  getPatientIdentifier(identifierType: string): string {
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
  * Get age of patient from birthdate
  * @param {string} birthdate - Birthdate
  * @return {string} - Age
  */
  getAge(birthdate: string) {
    const years = moment().diff(birthdate, 'years');
    const months = moment().diff(birthdate, 'months');
    const days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} years`;
    } else if (months > 1) {
      return `${months} months`;
    } else {
      return `${days} days`;
    }
  }

   /**
  * Replcae the string charaters with *
  * @param {string} str - Original string
  * @return {string} - Modified string
  */
  replaceWithStar(str: string) {
    const n = str.length;
    return str.replace(str.substring(0, n - 4), '******');
  }

  
  ngOnDestroy() {
    this.eventsSubscription?.unsubscribe();
  }
  
}