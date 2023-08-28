import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { ProfileService } from 'src/app/services/profile.service';
import { TranslateService } from '@ngx-translate/core';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Observable, Subscription } from 'rxjs';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-view-visit-prescription',
  templateUrl: './view-visit-prescription.component.html',
  styleUrls: ['./view-visit-prescription.component.scss']
})
export class ViewVisitPrescriptionComponent implements OnInit, OnDestroy {
  @Input() isDownloadPrescription: any = false;
  @Input() visitId: any;
  @Input() download: Observable<any>;
  locale: any = localStorage.getItem('selectedLanguage');
  visit: any;
  patient: any;
  baseUrl: string = environment.baseURL;
  visitStatus: string;
  providerName: string;
  hwPhoneNo: string;
  clinicName: string;
  baseURL = environment.baseURL;
  visitNotePresent: any = false;
  spokenWithPatient: any = 'No';
  diagnosis: any;
  notes: any = [];
  medicines: any = [];
  existingDiagnosis: any = [];
  advices: any = [];
  additionalInstructions: any = [];
  tests: any = [];
  referrals: any = [];
  followUp: any;
  consultedDoctor: any;

  conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  conceptNote = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptTest = '23601d71-50e6-483f-968d-aeef3031346d';
  conceptReferral = "605b6f15-8f7a-4c45-b06d-14165f6974be";
  conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';

  signaturePicUrl: any = null;
  signatureFile: any = null;
  completedEncounter: any = null;
  cheifComplaints: any = [];
  vitalObs: any = [];
  eventsSubscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewVisitPrescriptionComponent>,
    private visitService: VisitService,
    private profileService: ProfileService,
    private diagnosisService: DiagnosisService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.getVisit(this.isDownloadPrescription ? this.visitId : this.data.uuid);
    pdfMake.fonts = {
      DmSans: {
        normal: `${window.location.origin}${environment.production?'/intelehealth':''}/assets/fonts/DM_Sans/DMSans-Regular.ttf`,
        bold: `${window.location.origin}${environment.production?'/intelehealth':''}/assets/fonts/DM_Sans/DMSans-Bold.ttf`,
        italics: `${window.location.origin}${environment.production?'/intelehealth':''}/assets/fonts/DM_Sans/DMSans-Italic.ttf`,
        bolditalics: `${window.location.origin}${environment.production?'/intelehealth':''}/assets/fonts/DM_Sans/DMSans-BoldItalic.ttf`,
      },
      ArialUnicodeMS: {
        normal: `${window.location.origin}${environment.production?'/intelehealth':''}/assets/fonts/Arial_Unicode_MS/Arial-Unicode-Regular.ttf`,
        bold: `${window.location.origin}${environment.production?'/intelehealth':''}/assets/fonts/Arial_Unicode_MS/Arial-Unicode-Bold.ttf`,
        italics: `${window.location.origin}${environment.production?'/intelehealth':''}/assets/fonts/Arial_Unicode_MS/Arial-Unicode-Italic.ttf`,
        bolditalics: `${window.location.origin}${environment.production?'/intelehealth':''}/assets/fonts/Arial_Unicode_MS/Arial-Unicode-Bold-Italic.ttf`,
      }
    };
    this.eventsSubscription = this.download?.subscribe((val) => { if(val) this.downloadPrescription(); });
    moment.locale(localStorage.getItem('selectedLanguage'));    
  }

  getVisit(uuid: string) {
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: any) => {
      if (visit) {
        this.visit = visit;
        this.checkVisitStatus(visit.encounters);
        this.visitService.patientInfo(visit.patient.uuid).subscribe((patient: any) => {
          if (patient) {
            this.patient = patient;
            this.clinicName = visit.location.display;
            // this.getAppointment(visit.uuid);
            this.getVisitProvider(visit.encounters);
            // check if visit note exists for this visit
            this.visitNotePresent = this.checkIfEncounterExists(visit.encounters, 'Visit Note');
            if (this.visitNotePresent) {
              this.checkIfPatientInteractionPresent(visit.attributes);
              this.checkIfDiagnosisPresent();
              this.checkIfNotePresent();
              this.checkIfMedicationPresent();
              this.checkIfAdvicePresent();
              this.checkIfTestPresent();
              this.checkIfReferralPresent();
              this.checkIfFollowUpPresent();
            }
            this.getCheckUpReason(visit.encounters);
            this.getVitalObs(visit.encounters);

            visit.encounters.forEach((encounter: any) => {
              if (encounter.encounterType.display == 'Remote Prescription') {
                this.completedEncounter = encounter;
                encounter.obs.forEach((o: any) => {
                  if (o.concept.display == 'Doctor details') {
                    this.consultedDoctor = JSON.parse(o.value);
                  }
                });
                encounter.encounterProviders.forEach((p: any) => {
                  this.consultedDoctor.gender = p.provider.person.gender;
                  this.consultedDoctor.person_uuid = p.provider.person.uuid;
                  this.consultedDoctor.attributes = p.provider.attributes;
                  if (this.isDownloadPrescription) {
                    this.setSignature(this.signature?.value, this.signatureType?.value);
                  }
                });
              }
            });
          }
        });
      }
    }, (error: any) => {

    });
  }

  getCheckUpReason(encounters: any) {
    this.cheifComplaints = [];
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display == 'ADULTINITIAL') {
        enc.obs.forEach((obs: any) => {
          if (obs.concept.display == 'CURRENT COMPLAINT') {
            const currentComplaint =  this.visitService.getData(obs)?.value.replace(new RegExp('►', 'g'),'').split('<b>');
            for (let i = 0; i < currentComplaint.length; i++) {
              if (currentComplaint[i] && currentComplaint[i].length > 1) {
                const obs1 = currentComplaint[i].split('<');
                if (!obs1[0].match('Associated symptoms')) {
                  this.cheifComplaints.push(obs1[0]);
                }
              }
            }
          }
        });
      }
    });
  }

  getVitalObs(encounters: any) {
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display == 'Vitals') {
        this.vitalObs = enc.obs;
      }
    });
  }

  checkIfPatientInteractionPresent(attributes: any) {
    attributes.forEach((attr: any) => {
      if (attr.attributeType.display == 'Patient Interaction') {
        this.spokenWithPatient = attr.value;
      }
    });
  }

  checkIfDiagnosisPresent() {
    this.existingDiagnosis = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptDiagnosis).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.existingDiagnosis.push({
            diagnosisName: obs.value.split(':')[0].trim(),
            diagnosisType: obs.value.split(':')[1].split('&')[0].trim(),
            diagnosisStatus: obs.value.split(':')[1].split('&')[1].trim(),
            uuid: obs.uuid
          });
          // this.diagnosis = {
          //   present: true,
          //   diagnosisIdentified: 'Yes',
          //   diagnosisName: obs.value.split(':')[0].trim(),
          //   diagnosisType: obs.value.split(':')[1].split('&')[0].trim(),
          //   diagnosisStatus: obs.value.split(':')[1].split('&')[1].trim()
          // };
        }
      });
    });
  }

  checkIfNotePresent() {
    this.notes = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptNote).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.notes.push(obs);
        }
      });
    });
  }

  checkIfMedicationPresent() {
    this.medicines = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptMed).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if (obs.value.includes(":")) {
            this.medicines.push({
              drug: obs.value?.split(":")[0],
              strength: obs.value?.split(":")[1],
              days: obs.value?.split(":")[2],
              timing: obs.value?.split(":")[3],
              remark: obs.value?.split(":")[4],
              uuid: obs.uuid
            });
          } else {
            this.additionalInstructions.push(obs);
          }
        }
      });
    });
  }

  checkIfAdvicePresent() {
    this.advices = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptAdvice)
      .subscribe((response: any) => {
        response.results.forEach((obs: any) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            if (!obs.value.includes('</a>')) {
              this.advices.push(obs);
            }
          }
        });
      });
  }

  checkIfTestPresent() {
    this.tests = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptTest)
      .subscribe((response: any) => {
        response.results.forEach((obs: any) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            this.tests.push(obs);
          }
        });
      });
  }

  checkIfReferralPresent() {
    this.referrals = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptReferral)
      .subscribe((response: any) => {
        response.results.forEach((obs: any) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            this.referrals.push({ uuid: obs.uuid, speciality: obs.value.split(':')[0].trim(), remark: obs.value.split(':')[1].trim() });
          }
        });
      });
  }

  checkIfFollowUpPresent() {
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptFollow).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          let followUpDate = (obs.value.includes('Time:')) ? moment(obs.value.split(', Time: ')[0]).format('YYYY-MM-DD') : moment(obs.value.split(', Remark: ')[0]).format('YYYY-MM-DD');
          let followUpTime = (obs.value.includes('Time:')) ? obs.value.split(', Time: ')[1].split(', Remark: ')[0] : null;
          let followUpReason = (obs.value.split(', Remark: ')[1]) ? obs.value.split(', Remark: ')[1] : null;
          this.followUp = {
            present: true,
            wantFollowUp: 'Yes',
            followUpDate,
            followUpTime,
            followUpReason
          };
        }
      });
    });
  }

  getPatientIdentifier(identifierType: string) {
    if (this.patient) {
      this.patient.identifiers.forEach((idf: any) => {
        if (idf.identifierType == 'OpenMRS ID') {
          return idf.identifier;
        }
      });
    }
  }

  checkVisitStatus(encounters: any) {
    if (this.checkIfEncounterExists(encounters, 'Patient Exit Survey')) {
      this.visitStatus = 'Ended Visit';
    } else if (this.checkIfEncounterExists(encounters, 'Visit Complete')) {
      this.visitStatus = 'Remote Prescription';
    } else if (this.checkIfEncounterExists(encounters, 'Visit Note')) {
      this.visitStatus = 'In-progress Visit';
    } else if (this.checkIfEncounterExists(encounters, 'Flagged')) {
      this.visitStatus = 'Priority Visit';
    } else if (this.checkIfEncounterExists(encounters, 'ADULTINITIAL') || this.checkIfEncounterExists(encounters, 'Vitals')) {
      this.visitStatus = 'Awaiting Visit';
    }
  }

  checkIfEncounterExists(encounters: any, visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  getAge(birthdate: string) {
    let years = moment().diff(birthdate, 'years');
    var months = moment().diff(birthdate, 'months');
    let days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} ${this.translateService.instant("years")}`;
    } else if (months > 1) {
      return `${months} ${this.translateService.instant("months")}`;
    } else {
      return `${days} ${this.translateService.instant("days")}`;
    }
  }

  getPersonAttributeValue(attrType: string) {
    let val = this.translateService.instant('NA');;
    if (this.patient) {
      this.patient.person.attributes.forEach((attr: any) => {
        if (attrType == attr.attributeType.display) {
          val = attr.value;
        }
      });
    }
    return val;
  }

  replaceWithStar(str: string) {
    let n = str.length;
    return str.replace(str.substring(0, n - 4), "*****");
  }

  getVisitProvider(encounters: any) {
    encounters.forEach((encounter: any) => {
      if (encounter.display.match("ADULTINITIAL") !== null) {
        this.providerName = encounter.encounterProviders[0].display;
        encounter.encounterProviders[0].provider.attributes.forEach(
          (attribute) => {
            if (attribute.display.match("phoneNumber") != null) {
              this.hwPhoneNo = attribute.value;
            }
          }
        );
      }
    });
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

  get isPrescriptionModal() {
    return location.hash.includes('#/i/')
  }

  get attributes() {
    return Array.isArray(this.consultedDoctor?.attributes) ? this.consultedDoctor.attributes : [];
  }

  get signatureType() {
    return this.attributes.find(a => a?.attributeType?.display === "signatureType");
  }

  get signature() {
    return this.attributes.find(a => a?.attributeType?.display === "signature");
  }

  detectMimeType(b64: string) {
    return this.profileService.detectMimeType(b64);
  }

  setSignature(signature, signatureType) {
    switch (signatureType) {
      case 'Draw':
      case 'Generate':
      case 'Upload':
        this.signaturePicUrl = signature;
        fetch(signature)
          .then(res => res.blob())
          .then(blob => {
            this.signatureFile = new File([blob], "intelehealth", { type: this.detectMimeType(signature.split(',')[0]) });
          });
        break;
      default:
        break;
    }
  }

  async downloadPrescription() {
    // console.log(this.signature);
    let userImg: any = await this.toObjectUrl(`${this.baseUrl}/personimage/${this.patient?.person.uuid}`);
    pdfMake.createPdf({
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [ 20, 50, 20, 20 ],
      watermark: { text: 'INTELEHEALTH', color: '#7F7B92', opacity: 0.1, bold: true, italics: false, angle: 0, fontSize: 50 },
      header: {
        columns: [
          { text: ''},
          { image: 'logo', width: 90, height: 30, alignment: 'right', margin: [0, 10, 10, 0] }
        ]
      },
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            { text: this.translateService.instant('Copyright ©2023 Intelehealth, a 501 (c)(3) & Section 8 non-profit organisation'), fontSize: 8, margin: [5,5,5,5]},
            { text: currentPage.toString() + ' of ' + pageCount, fontSize: 8, margin: [5,5,5,5], alignment: 'right'}
          ]
        };
      },
      content: [
        {
          style: 'tableExample',
          table: {
            widths: ['20%','*','30%','30%'],
            body: [
              // ['', '', '', { image: 'logo', width: 90, height: 30, alignment: 'right' }],
              [
                {
                  colSpan: 4,
                  fillColor: '#E6FFF3',
                  text: 'Intelehealth e-' + this.translateService.instant('Prescription'),
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
                    widths: ['auto','*'],
                    body: [
                      [
                        {
                          image: (userImg && !userImg?.includes('application/json'))?userImg: 'user',
                          width: 30,
                          height: 30,
                          margin: [0, (userImg && !userImg?.includes('application/json'))? 15 : 5, 0, 5]
                        },
                        [
                          {
                            text: `${this.patient?.person.display} (${this.translateService.instant(this.patient?.person.gender)})`,
                            bold: true,
                            margin: [0, 15, 0, 5],
                          }
                        ]
                      ]
                    ]
                  },
                  layout: 'noBorders'
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        [
                          {text: this.translateService.instant('Age'), style: 'subheader'},
                          `${this.patient?.person.birthdate ? this.getAge(this.patient?.person.birthdate) : this.patient?.person.age}`,
                          {text: this.translateService.instant('Address'), style: 'subheader'},
                          `${this.patient?.person.preferredAddress.cityVillage.replace(':',' : ')}`
                        ]
                      ]
                    ]
                  },
                  layout: 'noBorders'
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        [
                          {text: this.translateService.instant('Occupation'), style: 'subheader'},
                          `${this.getPersonAttributeValue("occupation")}`,
                          {text: this.translateService.instant('National ID'), style: 'subheader'},
                          `${this.getPersonAttributeValue("NationalID")}`
                        ]
                      ]
                    ]
                  },
                  layout: 'noBorders'
                },
                {
                  table: {
                    widths: ['auto','*'],
                    body: [
                      [ {text: this.translateService.instant('Contact no.'), style: 'subheader', colSpan: 2}, ''],
                      [ 
                        {image: 'phone', width: 15, height: 15 }, `${this.getPersonAttributeValue("Telephone Number")?this.getPersonAttributeValue('Telephone Number'):this.translateService.instant('NA')}`
                      ],
                      [ 
                        {image: 'whatsApp', width: 15, height: 15 }, `${this.getPersonAttributeValue("Telephone Number")?this.getPersonAttributeValue('Telephone Number'):this.translateService.instant('NA')}`
                      ]
                    ]
                  },
                  layout: 'noBorders'
                }
              ],
              [
                {
                  colSpan: 4,
                  table: {
                    widths: [30,'*'],
                    headerRows: 1,
                    body: [
                      [ {image: 'cheifComplaint', width: 25, height: 25, border: [false, false, false, true] },
                      {text: this.translateService.instant('Cheif Complaint'), style: 'sectionheader', border: [false, false, false, true] }],
                      [
                        {
                          colSpan: 2,
                          ul: [
                            ...this.getRecords('cheifComplaint')
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
                    widths: [30,'*'],
                    headerRows: 1,
                    body: [
                      [ 
                        {image: 'vitals', width: 25, height: 25, border: [false, false, false, true] }, 
                        {text: this.translateService.instant('Vitals'), style: 'sectionheader', border: [false, false, false, true] }
                      ],
                      [
                        {
                          colSpan: 2,
                          ul: [
                            ...this.getRecords('vitals')
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
                    widths: [30,'*'],
                    headerRows: 1,
                    body: [
                      [ 
                        {image: 'consultation', width: 25, height: 25, border: [false, false, false, true] }, 
                        {text: this.translateService.instant('Consultation details'), style: 'sectionheader', border: [false, false, false, true] }
                      ],
                      [
                        {
                          colSpan: 2,
                          ul: [
                            {text: [{text: this.translateService.instant('Patient ID') + ":", bold: true},` ${this.patient?.identifiers?.[0]?.identifier}`], margin: [0, 5, 0, 5]},
                            {text: [{text: this.translateService.instant('Prescription Issued') + ":", bold: true},` ${moment(this.completedEncounter?.encounterDatetime).format('DD MMM yyyy')}`],  margin: [0, 5, 0, 5]}
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
                    widths: [30,'*'],
                    headerRows: 1,
                    body: [
                      [ 
                        {image: 'diagnosis', width: 25, height: 25, border: [false, false, false, true]  }, 
                        {text: this.translateService.instant('Diagnosis'), style: 'sectionheader', border: [false, false, false, true] }
                      ],
                      [
                        {
                          colSpan: 2,
                          table: {
                            widths: ['*','*', '*'],
                            headerRows: 1,
                            body: [
                              [
                                {text: this.translateService.instant('Diagnosis'), style: 'tableHeader'}, 
                                {text: this.translateService.instant('Type'), style: 'tableHeader'}, 
                                {text: this.translateService.instant('Status'), style: 'tableHeader'}
                              ],
                              ...this.getRecords('diagnosis')
                            ]
                          },
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
              ],
              [
                {
                  colSpan: 4,
                  table: {
                    widths: [30,'*'],
                    headerRows: 1,
                    body: [
                      [ 
                        {image: 'medication', width: 25, height: 25, border: [false, false, false, true]  }, 
                        {text: this.translateService.instant('Medication'), style: 'sectionheader', border: [false, false, false, true] }
                      ],
                      [
                        {
                          colSpan: 2,
                          table: {
                            widths: ['*','auto', 'auto', 'auto', 'auto'],
                            headerRows: 1,
                            body: [
                              [
                                {text:this.translateService.instant('Drug name'), style: 'tableHeader'}, 
                                {text:this.translateService.instant('Strength'), style: 'tableHeader'}, 
                                {text:this.translateService.instant('No. of days'), style: 'tableHeader'}, 
                                {text:this.translateService.instant('Timing'), style: 'tableHeader'}, 
                                {text:this.translateService.instant('Remarks'), style: 'tableHeader'}
                              ],
                              ...this.getRecords('medication')
                            ]
                          },
                          layout: 'lightHorizontalLines'
                        }
                      ],
                      [{ text: this.translateService.instant('Additional instructions') + ':', style: 'sectionheader', colSpan:2 },''],
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
                    widths: [30,'*'],
                    headerRows: 1,
                    body: [
                      [ 
                        {image: 'advice', width: 25, height: 25, border: [false, false, false, true]  }, 
                        {text: this.translateService.instant('Advice'), style: 'sectionheader', border: [false, false, false, true] }
                      ],
                      [
                        {
                          colSpan: 2,
                          ul: [
                            ...this.getRecords('advice')
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
                    widths: [30,'*'],
                    headerRows: 1,
                    body: [
                      [ 
                        {image: 'test', width: 25, height: 25, border: [false, false, false, true]  }, 
                        {text: this.translateService.instant('Test'), style: 'sectionheader', border: [false, false, false, true] }
                      ],
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
              // [
              //   {
              //     colSpan: 4,
              //     table: {
              //       widths: [30,'*'],
              //       headerRows: 1,
              //       body: [
              //         [ {image: 'referral', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Referral Out', style: 'sectionheader', border: [false, false, false, true] }],
              //         [
              //           {
              //             colSpan: 2,
              //             table: {
              //               widths: ['30%','30%','10%','30%'],
              //               headerRows: 1,
              //               body: [
              //                 [{text: 'Referral to', style: 'tableHeader'}, {text: 'Referral facility', style: 'tableHeader'}, {text: 'Priority', style: 'tableHeader'}, {text: 'Referral for (Reason)', style: 'tableHeader'}],
              //                 ...this.getRecords('referral')
              //               ]
              //             },
              //             layout: 'lightHorizontalLines'
              //           }
              //         ]
              //       ]
              //     },
              //     layout: {
              //       defaultBorder: false
              //     }
              //   },
              //   '',
              //   '',
              //   ''
              // ],
              [
                {
                  colSpan: 4,
                  table: {
                    widths: [30,'*'],
                    headerRows: 1,
                    body: [
                      [ 
                        {image: 'followUp', width: 25, height: 25, border: [false, false, false, true]  }, 
                        {text: this.translateService.instant('Follow-up'), style: 'sectionheader', border: [false, false, false, true] }
                      ],
                      [
                        {
                          colSpan: 2,
                          table: {
                            widths: ['30%','30%', '10%', '30%'],
                            headerRows: 1,
                            body: [
                              [
                                {text: this.translateService.instant('Follow-up Requested'), style: 'tableHeader'}, 
                                {text: this.translateService.instant('Date'), style: 'tableHeader'}, 
                                {text: this.translateService.instant('Time'), style: 'tableHeader'}, 
                                {text: this.translateService.instant('Reason'), style: 'tableHeader'}
                              ],
                              ...this.getRecords('followUp')
                            ]
                          },
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
              ],
              [
                {
                  colSpan:4,
                  alignment: 'right',
                  stack: [
                    { image: `${this.signature?.value}`, width: 100, height: 100, margin: [0, 5, 0, 5] },
                    { text: `Dr. ${this.consultedDoctor?.name}`, margin: [0,5,0,5]},
                    { text: `${this.consultedDoctor?.qualification}`},
                    { text: `${this.translateService.instant('Registration No')}. ${this.consultedDoctor?.registrationNumber}`},
                  ]
                },
                '',
                '',
                ''
              ],
            ]
          },
          layout:'noBorders'
        }
      ],
      images: {
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABkAAAAJYCAYAAAA6xipCAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAmlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjYwMDwvZXhpZjpQaXhlbFlEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNjAwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgov1nH4AABAAElEQVR4AezdCbxlR10g/rrvdXe6sy+drbNBB5JAEpaEsMYkLIGwhEVlNWEXAT+uo+AKOqgwo44LLqN/UVlm/v9xYcZxxnEZGEVHBASZPwZHUURFxJFF9izd9079qk7d5S2d1/22e+/7nqTfufesVd+qU6dO1Tnn9q468BODZCBAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJHAwhzFRVQIECBAgAABAgQIECBAgAABAgQIECBAgAABAkVAB4iMQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAwQIECBAgAABAgQIECBAgAABAgQIECBAgMDcCegAmbskFSECBAgQIECAAAECBAgQIECAAAECBAgQIEBAB4g8QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECMydgA6QuUtSESJAgAABAgQIECBAgAABAgQIECBAgAABAgR0gMgDBAgQIECAAAECBAgQIECAAAECBAgQIECAwNwJ6ACZuyQVIQIECBAgQIAAAQIECBAgQIAAAQIECBAgQEAHiDxAgAABAgQIECBAgAABAgQIECBAgAABAgQIzJ2ADpC5S1IRIkCAAAECBAgQIECAAAECBAgQIECAAAECBHSAyAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIDA3AnoAJm7JBUhAgQIECBAgAABAgQIECBAgAABAgQIECBAQAeIPECAAAECBAgQIECAAAECBAgQIECAAAECBAjMnYAOkLlLUhEiQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEdIDIAysKHE6D1O8tn7XStOVLmUJgIwVGxVRvULfbxqO9jJYZTfOJAAECBAgQIECAAAECBAgQIECAAIGdLLBrJ0de3JcL9Hq9NBgM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/2L1SZATT9wz/UEVQgLbKHDCCYv56Y/2TqxtDIhdEyBAgAABAgQIECBAgAABAgQIECCwqQI6QDaVdys3HknZT7t3R+Nue9/PVu7fvgjMhsCePbs8JTUbSSWUBAgQIECAAAECBAgQIECAAAECBNYloANkXXxWJkCAAAECBAgQIECAAAECBAgQIECAAAECBKZRQAfINKaKMBEgQIAAAQIECBAgQIAAAQIECBAgQIAAAQLrEtABsi4+KxMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQLTKKADZBpTRZgIECBAgAABAgQIECBAgAABAgQIECBAgACBdQnoAFkXn5UJECBAgAABAgQIECBAgAABAgQIECBAgACBaRTQATKNqSJMBAgQIECAAAECBAgQIECAAAECBAgQIECAwLoEdICsi8/KBAgQIECAAAECBAgQIECAAAECBAgQIECAwDQK6ACZxlQRJgIECBAgQIAAAQIECBAgQIAAAQIECBAgQGBdAjpA1sVnZQIECBAgQIAAAQIECBAgQIAAAQIECBAgQGAaBXSATGOqCBMBAgQIECBAgAABAgQIECBAgAABAgQIECCwLgEdIOviszIBAgQIECBAgAABAgQIECBAgAABAgQIECAwjQI6QKYxVYSJAAECBAgQIECAAAECBAgQIECAAAECBAgQWJeADpB18VmZAAECBAgQIECAAAECBAgQIECAAAECBAgQmEYBHSDTmCrCRIAAAQIECBAgQIAAAQIECBAgQIAAAQIECKxLQAfIuvisTIAAAQIECBAgQIAAAQIECBAgQIAAAQIECEyjgA6QaUwVYSJAgAABAgQIECBAgAABAgQIECBAgAABAgTWJaADZF18ViZAgAABAgQIECBAgAABAgQIECBAgAABAgSmUUAHyDSmijARIECAAAECBAgQIECAAAECBAgQIECAAAEC6xLQAbIuPisTIECAAAECBAgQIECAAAECBAgQIECAAAEC0yigA2QaU0WYCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgXUJ6ABZF5+VCRAgQIAAAQIECBAgQIAAAQIECBAgQIAAgWkU0AEyjakiTAQIECBAgAABAgQIECBAgAABAgQIECBAgMC6BHSArIvPygQIECBAgAABAgQIECBAgAABAgQIECBAgMA0CuyaxkAJEwECxy4wyKv2yp9j34Y1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jdQipHS45N8f2ZpnTo4qgBYmQIAAAQIECBAgQIAAAQIECBAgQGCHCugA2aEJL9pzJND1Ooy/Bmt7Yqc42R53eyVAgAABAgQIECBAgAABAgQIECBAYCUBLZYrqZhGgAABAgQIECBAgAABAgQIECBAgAABAgQIzLSADpCZTj6BJ0CAAAECBAgQIECAAAECBAgQIECAAAECBFYS0AGykoppBAgQIECAAAECBAgQIECAAAECBAgQIECAwEwL6ACZ6eQTeAIECBAgQIAAAQIECBAgQIAAAQIECBAgQGAlAR0gK6mYRoAAAQIECBAgQIAAAQIECBAgQIAAAQIECMy0gA6QmU4+gSdAgAABAgQIECBAgAABAgQIECBAgAABAgRWEtABspKKaQQIECBAgAABAgQIECBAgAABAgQIECBAgMBMC+gAmenkE3gCBAgQIECAAAECBAgQIECAAAECBAgQIEBgJQEdICupmEaAAAECBAgQIECAAAECBAgQIECAAAECBAjMtIAOkJlOPoEnQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEVhLQAbKSimkECBAgQIAAAQIECBAgQIAAAQIECBAgQIDATAvoAJnp5BN4AgQIECBAgAABAgQIECBAgAABAgQIECBAYCUBHSArqZhGgAABAgQIECBAgAABAgQIECBAgAABAgQIzLSADpCZTj6BJ0CAAAECBAgQIECAAAECBAgQIECAAAECBFYS0AGykoppBAgQIECAAAECBAgQIECAAAECBAgQIECAwEwL6ACZ6eQTeAIECBAgQIAAAQIECBAgQIAAAQIECBAgQGAlAR0gK6mYRoAAAQIECBAgQIAAAQIECBAgQIAAAQIECMy0gA6QmU4+gSdAgAABAgQIECBAgAABAgQIECBAgAABAgRWEtABspKKaQQIECBAgAABAgQIECBAgAABAgQIECBAgMBMC+gAmenkE3gCBAgQIECAAAECBAgQIECAAAECBAgQIEBgJQEdICupmEaAAAECBAgQIECAAAECBAgQIECAAAECBAjMtIAOkJlOPoEnQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEVhLQAbKSimkECBAgQIAAAQIECBAgQIAAAQIECBAgQIDATAvsmunQCzyBnS4wyAC9SYQVJk0usEXfBoNB6vWWBG6L9j1Nu+lngoVIlG0cenn/gxyO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CZAACZAACZAACZAACZAACZAACSyQQDz7ZkyNIU2xzcTrP/cU+Z0rjlugL909BmNGFo+ZM00eufE78vrnXCe3qMkie1afq8fLY3UXB75NAiRAAiRAAlUSoAGkStoMiwRIgARIgARIgARIgARIgARIgARIYKQJYFPzqfq01KfVCNI4Vt77P54kVSlndA5Kxr5lG5fjSkvNMbde9Rn5xTdsDfdtySt/lsaPDBrPSIAESIAEBo0AW7FByzHGlwRIgARIgARIgARIgARIgARIgARIYKAJNGRcWmN1ecG7r5BzVyEp+SWkSktcYtPAylcIEcYYkUPy+bf8o7z8jXfhR3At3ZPE44TVr+y55CYPJEACJEACJDBABKoaZDBASBhVEiABEiABEiABEiABEiABEiABEiABEiiJQB3LS01L6/HnyK8955iwkbkuTJXuD1JSqIm3TQ0bYWEuCJbAOiQfed3fy9s/OaX3MUYWy3LV9d6UzgqBymhKNzwfk5buU0JHAiRAAiRAAoNIgAaQQcw1xpkESIAESIAESIAESIAESIAESIAESGAgCWBvDcyquPLPL5HVySbkuaWpSk2VGjd8Fkhtn/zjKz4g77jWA3QjCGwyZvyohWWyYPyAcYRGECfFIwmQAAmQwOAQ4BJYg5NXjCkJkAAJkAAJkAAJkAAJkAAJkAAJkMAQEKj/3JPl585UI0MwRlRrWMDsE5EDctVr/0H++PM650NnhMA1czuRmNFD54voHTWatKqNY4gQ/5AACZAACZBAAQRoACkAIr0gARIgARIgARIgARIgARIgARIgARIggbkJmBGhqft//N6V58g47A5hDw5VzYTj3G8Xdrc2LZ//3Q/LWz/V0uWt6tJINviopzM8dHP0sEyXLswVpotovOtVRrCwlNIjEiABEiABEghzGImBBEiABEiABEiABPqKADfanDs7arVGWDoDy1K4w3IaWNO7CAd/kQft/psSpIgQ6MdCCCBPR9VhaZhsqRVTGBYl3wtnmpWvLC4Lf5tPksDCCIzWqHrsORHXbdauoKzF5W1h5JbylLWVqtQP1WvS1gUFfzFxyPdf1Jwwo1m2VciPeeml8qx12GRcw/Vn/LiUhPk7uWYjka3cNXvwP/7uKvmv73sU8zrUwOEPxHnQlFrTjR/2TvV1sCeKRxIgARIgARLojkDcwnXnE98mARIgARIg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AQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQJzjjQUAABNkSURBVAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIACBFgSYAGkBh0sQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQj0JwEmQPqz3JAaAhCAAAQgAAEIQAACEIAABCAAAQhA4P9vzw5tAABgGIb9/3U/CK9kXDJ5MAQIECBAgEAICCCBYyJAgAABAgQIECBAgAABAgQIECBAgAABAgQ+BQSQz7+5mgABAgQIECBAgAABAgQIECBAgAABAgQIEAgBASRwTAQIECBAgAABAgQIECBAgAABAgQIECBAgMCngADy+TdXEyBAgAABAgQIECBAgAABAgQIECBAgAABAiEggASOiQABAgQIECBAgAABAgQIECBAgAABAgQIEPgUEEA+/+ZqAgQIECBAgAABAgQIECBAgAABAgQIECBAIAQEkMAxESBAgAABAgQIECBAgAABAgQIECBAgAABAp8CAsjn31xNgAABAgQIECBAgAABAgQIECBAgAABAgQIhIAAEjgmAgQIECBAgAABAgQIECBAgAABAgQIECBA4FNAAPn8m6sJECBAgAABAgQIECBAgAABAgQIECBAgACBEBBAAsdEgAABAgQIECBAgAABAgQIECBAgAABAgQIfAoIIJ9/czUBAgQIECBAgAABAgQIECBAgAABAgQIECAQAgJI4JgIECBAgAABAgQIECBAgAABAgQIECBAgACBTwEB5PNvriZAgAABAgQIECBAgAABAgQIECBAgAABAgRCQAAJHBMBAgQIECBAgAABAgQIECBAgAABAgQIECDwKSCAfP7N1QQIECBAgAABAgQIECBAgAABAgQIECBAgEAICCCBYyJAgAABAgQIECBAgAABAgQIECBAgAABAgQ+BQSQz7+5mgABAgQIECBAgAABAgQIECBAgAABAgQIEAgBASRwTAQIECBAgAABAgQIECBAgAABAgQIECBAgMCngADy+TdXEyBAgAABAgQIECBAgAABAgQIECBAgAABAiEggASOiQABAgQIECBAgAABAgQIECBAgAABAgQIEPgUEEA+/+ZqAgQIECBAgAABAgQIECBAgAABAgQIECBAIAQEkMAxESBAgAABAgQIECBAgAABAgQIECBAgAABAp8CAsjn31xNgAABAgQIECBAgAABAgQIECBAgAABAgQIhIAAEjgmAgQIECBAgAABAgQIECBAgAABAgQIECBA4FNAAPn8m6sJECBAgAABAgQIECBAgAABAgQIECBAgACBEBBAAsdEgAABAgQIECBAgAABAgQIECBAgAABAgQIfAoIIJ9/czUBAgQIECBAgAABAgQIECBAgAABAgQIECAQAgJI4JgIECBAgAABAgQIECBAgAABAgQIECBAgACBTwEB5PNvriZAgAABAgQIECBAgAABAgQIECBAgAABAgRCQAAJHBMBAgQIECBAgAABAgQIECBAgAABAgQIECDwKSCAfP7N1QQIECBAgAABAgQIECBAgAABAgQIECBAgEAICCCBYyJAgAABAgQIECBAgAABAgQIECBAgAABAgQ+BQSQz7+5mgABAgQIECBAgAABAgQIECBAgAABAgQIEAgBASRwTAQIECBAgAABAgQIECBAgAABAgQIECBAgMCngADy+TdXEyBAgAABAgQIECBAgAABAgQIECBAgAABAiEggASOiQABAgQIECBAgAABAgQIECBAgAABAgQIEPgUEEA+/+ZqAgQIECBAgAABAgQIECBAgAABAgQIECBAIAQEkMAxESBAgAABAgQIECBAgAABAgQIECBAgAABAp8CAsjn31xNgAABAgQIECBAgAABAgQIECBAgAABAgQIhIAAEjgmAgQIECBAgAABAgQIECBAgAABAgQIECBA4FNAAPn8m6sJECBAgAABAgQIECBAgAABAgQIECBAgACBEBBAAsdEgAABAgQIECBAgAABAgQIECBAgAABAgQIfAoIIJ9/czUBAgQIECBAgAABAgQIECBAgAABAgQIECAQAgJI4JgIECBAgAABAgQIECBAgAABAgQIECBAgACBTwEB5PNvriZAgAABAgQIECBAgAABAgQIECBAgAABAgRCQAAJHBMBAgQIECBAgAABAgQIECBAgAABAgQIECDwKSCAfP7N1QQIECBAgAABAgQIECBAgAABAgQIECBAgEAICCCBYyJAgAABAgQIECBAgAABAgQIECBAgAABAgQ+BQaTdqOUMOuxhwAAAABJRU5ErkJggg==',
        user: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABWVBMVEUAAAD/2//f3//j4//q6v/r6//byO3t7f/IyOnq6v/r6//s7P/w6f/x6v/y6//IwufGxuju6P/IyOnu6f/v6v/Oxufw5//w6P/u6P/u6P/v5//w6P/u6f/v5//IweTGv+Tw5//u6P/u6P/u6P/v6P/v6P/v6P/CuuLBu+Hw6P/w6P/v6P/v6f/v6P/v6P+/uOC+uOC/ueDv6P/v6f/q4/zq4/zv6P/v6P/v6P/v6P+3stu4sdu3sNrv6P/v6P/v6P/v6P/v6P/v6P/v6P+wqterpdOsptStp9Stp9WuqNWvqtaxqtexq9exrNe2sdu3sdu3stu4stu4sty+uOC/uODDvePFvuTFv+THwOXIwebLw+fLxOfNx+nOx+nTzO3Tze3Vzu7Vz+7b1PLc1fLc1fPe2PTg2vbh2vbh2/bm3/no4vvp4vvq5Pzr4/zt5f3t5v3u5/7v6P////8RRFeOAAAARXRSTlMABwgJDA0ODhcYGRsiJSYqLS0uLjE/VVdYWYGHioyPkJaYmZqbnJ3BxsbHyszQ09TV1uLj5OXl6err8fLz8/T1+Pn6+/2LnXBYAAAAAWJLR0RyNg4NWAAAAV5JREFUGBl9wfsjU3EYB+BPc12MQkKuzXUr12JKm433cOSyKRTV5Jpq+Pz/vzjmPd9955jnQUld52A8kckk4tGOGgQ1DadopIYiKFfVs8Qyme4QLJFxBsSewmhL8AEzrVCRBB80E0ZR6C0reFOFWz2sqAuepiX6Cj9yrrv9s0DfpzCAYfpOP0vR+il9/UBdiup8VdTqH6pkDTqprjfF2LqmeolBqhOxnFC9RpxqXywHVDHMU+2IZYdqDmmqb2L5TrWINNWhWH5TLWKe6v+aGGsFqjnE6cuL8Yu+GKI09kUd0BhAB0uOsuLJHbGkHdVJWi6Ojy9oSVYDQ3xEFEAkw4rSjfB0886//G52Y2VlI7uX/8s7r3ArFKPn7IsjhvP1nJ6xJygKT/NyV+7Zu+JsA1Tr+5wEbL97DqP5gwR8fAZL7YgrZZzRWpRrmXDFcKdeIKi+b3Jh2XGWFyZ762HcALFGLHGzyTzIAAAAAElFTkSuQmCC',
        consultation: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAABelBMVEUAAABAAIAzM5krK4AkJJIrHI4oG5QuI5csIZArIJUzH48vHI4uG5IrHI4wHJEvG5QuIZAtIJMuHZAtHY8vH5EuH5AvHpEvHZAuHZItH5EtHZIuH5EtHpEvHpIvHZEuHZAtH5EtH5AvHpEuHpIuHpEvH5AuH5EtHpIvHpEuHpEuHZItH5EvH5EuHpAuHpEuHpAuHZAuH5EtHpEuHZEuH5EuHpEtHpEuHpAuHpIuHpEuHpEvHZEuHpEvHpIuHpEuHpEuHpEuHpEuHpEtHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEvH5E1JpU6K5c8LZg9Lpk+L5k+MJpJO59KPKBMPqFYS6daTqhwZbR5b7l6cLl7cbp8crqAdryCeb2Der6OhcOPhsSQh8SQiMWRicWel8yfmM2sptOtp9SvqdWwqtaxq9a8t9y9uNy+ud3MyOTNyeXOyuXTz+jV0unX1OrY1erj4fDr6vXx8Pj+/v/////5zO56AAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAAAAWJLR0R9prEQyQAAAedJREFUSMeVlldXwkAQhVdUUGxYsRewa0SxF1SUIkrGbuwVFXvBhpj/bkA9bnaTTfa+kdzvnNkwc2cRIpVf4/H65hYX53xeT3U+MpDVPQoqjbisDHthXxgohYQCHbulNQiaCnflaPkdk6CriRLaXxkEhgIVpL92CZiKNqr9DWAol6qeqDEQLf/3F82DCQVL//zZk2BK45ZfoBNMqv3HXxDCnm3fv75her2T8KLsGaAPe7TxKRP6XMde92T6De+fI/l5dwfTbkI+wPsq3YluvMqYHFeXfSWf4T+bFWCUBFYkSVoB2NQChhGyiyTwoVT+Dsdfe/B0QwJiHqoBErhJJpPXEJdjEDshAXAiD2ifIQ3QJYGAvBSwvLa2qgv0oxkKSChneM4At1cU4EN+CnhMpVIPGSB+QQGzKMJ3hgV+gFnSpUZJ07yH5v6s3H9cNaM1zk8poArlMZrvUav50AhPew8q8+DiGaCm9IjiGXBIjuiLvE+OKBLMh0A3HTPSnTpmbrfwDP/dYB1mg6ztb/WMm/OPWTjD2PEf3xVm4r4MXxD1hn6xjnNlNZBLrjzA8s+X0Wu0mPGtxoq0FnVWa0BvsWfr3AXsvSGNq0MP64ZibRlSzYc42JxrdKGxOYWBKX8k4p8aEJw26vU3Ct9OgFaQm8gAAAAASUVORK5CYII=',
        diagnosis: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAACHFBMVEUAAABAAIAzM5krK4AkJJIrHI4oG5QuI5csIZArIJUzH48vHI4uG5IrHI4wHJEvG5QuIZAtIJMuHZAtHY8vH5EuH5AvHpEvHZAuHZItH5EtHZIuH5EtHpEvHpIvHZEuHZAtH5EtH5AvHpEuHpIuHpEvH5AuH5EtHpIvHpEuHpEuHZItH5EvH5EuHpAuHpEuHpAuHZAuH5EtHpEuHZEuH5EuHpEtHpEuHpAuHpIuHpEuHpEvHZEuHpEvHpIuHpEuHpEuHpEuHpEuHpEtHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEvH5EwIJIwIZIxIpIxIpMyIpMzI5Q0JJQ1JZQ1JpU3KJY+MJo/MZpAMZpBMptCNJxENp1FN51HOJ5JOp9KPKBMP6FPQaJQQ6NRRKRVR6VZTKdgVKtrYLFsYbJuY7NvZLNwZbRxZrR0abZ2bLd3bbd4bbiEe76GfL+LgsKLg8KMg8OOhcOQh8SSisaTi8aWjsiXj8iZkcmZksqaksqdlcudlsyims6im86jnM+knc+oodGqo9KuqNSyrdezrde5tNq8t9y9uNzBvN7Cvt/FweDIxOLPy+bU0enY1erZ1uva1+zb2Ozd2u3d2+3e3O7f3e7i4PDl4/Hm5PLn5fLo5vPp5/Pq6PTr6vXu7Pbu7fbv7fbw7/fy8fjy8vj29fr39vv49/v7+/39/P7+/v////8trPREAAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAAAAWJLR0Sz2m3/fgAAAoFJREFUSMeVlvk/1EEYx5+oxUoJhUpp6dTarBKhLLsrsh9bG7tKd0qX0OmIkqQ7XWpzdm3S6fkH+8F6mZ3Z4+vz087M572v78w8xxDJiks3mUvLq6vLS82mtDiKIF3WbgSowKALY1+aWwlFdmN8CHtUtg1BVbl1cTB/YjFCas9y1b/ShjCypsj+1QcQVjXrAv0ZiChDwPfURAZqkuf9CRXQINuKOX90MTSpKMoPbIFGbZr1x9u1AjY9ERHlinPu1s4uQZ1X68XVHCIinRg/5z+ypPEmMa50RJQl/v8Iex/0CxoY5eE6wZBJRGI8t/P7OvdZAA1n/DOeMb4iGHYR6R3C+A7fP/ST78I9wc/8U4PcIRgcsZQubqqHe08zv8LxGf7kn+rnLtGRSiYJOMG/m4BBfhMcMJJZAb4AuMxDAJ7MvJCBHbRPAo7xDwBt/BLAd/4lA6VkkQDnFLfANcR9AJ7yaxkooyoJwA3+N/mVfY0AbvGADOxXgdruv8yjFxAKkD8JwCX2HgQA3FaBMtqrAk3smx0+5m5102YVcH7jVgA46uOL6rGaVAAdPH3dheZ3/LZWvbi0IIDzOfOfKebJU8pNr6JYKfgAAM6b48zTj44AeCgHHxUI42s8fNj/s/GkCwDqR7hFMOQTkUEYN3zm4XtiivZ5+YOYQOuJSCfWgOYxOUUnzskpSkZxU572HjFFe9o84uq2BZYZq7+DbdYKbJxrPUXa/IVRCyzGifPlO0VLuU8SG8TaiH7HmgW2rAy5ySVbw/krktQ2uizMWRUmBGvUi7KtoRp7dIi3gH57kEu354R7oeg27HQEnE1+5pJID5qYVGNeiaWqylKSZ0yNUZb/Axj7fGBCKa/gAAAAAElFTkSuQmCC',
        medication: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAB41BMVEUAAABAAIAzM5krK4AkJJIrHI4oG5QuI5csIZArIJUzH48vHI4uG5IrHI4wHJEvG5QuIZAtIJMuHZAtHY8vH5EuH5AvHpEvHZAuHZItH5EtHZIuH5EtHpEvHpIvHZEuHZAtH5EtH5AvHpEuHpIuHpEvH5AuH5EtHpIvHpEuHpEuHZItH5EvH5EuHpAuHpEuHpAuHZAuH5EtHpEuHZEuH5EuHpEtHpEuHpAuHpIuHpEuHpEvHZEuHpEvHpIuHpEuHpEuHpEuHpEuHpEtHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEvH5ExIpMyIpMzI5Q0JJQ1JZQ1JpU2J5U3KJY4KZY5KZc+MJk+MJo/MZpAMZpENp1GOJ5HOZ5JO59OQKJQQqNQQ6NRRKRTRqRVSKZXSqdvZLNwZbRxZrR0arZ1a7d5b7l/dbyAdryCeL2Der6FfL+HfcCJgMGQh8SRicWUi8aZksqdlcugmc2potKrpdOtp9S2sNm4stm5s9q7ttu8t9y9uNzFwODGweHMyOTPzObQzebY1erY1uvZ1uva1+zk4vHl4/Hm5fLn5fLp5/Ps6/Xv7fby8fjz8vn29fr49/v4+Pz6+vz7+/38+/39/P79/f7+/v////9z13OtAAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAAAAWJLR0SgXtO+oAAAAmNJREFUSMeVlulbElEUxk9ao2KWqYVWlqGtNqJYLiklyhIGh0CkLKFFqCQrAytbbVOxjZIwt+r8qX0IH+/M3Fl8P3Hm/d2Hy3Cf970AcpXVWW32/sHBfrvNWlsGOhIaO1GiDougge9s8aBCbrFcBS9qciFXnpPbeXxlD6rq3G4lv9eFGnLWyPn9l1BTvkNSvh51ZZHsx6e/wFe9yVcMoAG59mzwxT1oSN1FhQUn0KCO/efL3Sr+8M2rsk2ZAACghUsHJjJ/iL5OhdiHzQAAgofHh98RrX5fJlqIsudKAIBGLj9H+ckIBseztMB+RwMAdPL5XBwREaPfKM0YZwFMfj4/VvicpM+M4y+FOm0eg8t/rzCeGazaPOIixRhTBJsOP7K2PsS4rXBBzs9KeEzRPGvbwaHk48ycWKL7rN8HXk0+nqOZAAtclC4IvKVc/ON7lp8No3SBZEsTlE9g6jG+fqbCYx+cZ8cMTYYREd9MIyKOKXm0S17r8O/VWyuPhp6MYoGfk/PYKvnjbtCPy89v36EH+OIDxnk8ilDLTCP0K4jXQzHE9Es+j/uglD18X2g88PMVTt/j/d7C4YMOZp6ibPTh3Uj+aYLPYzsAWJg5lKFsMoTXUkt8Hg8DgMBmwGiGaGVxjWiGy7sFAACRfRRMfyJan0/yc+QUN2YisZBahhca7LjRIDu6UT3dxviuoi2GceVmfNcYifsqtiAO6vL+A1usrHp5yVU7tfiBKmWN7tJ4V10VvKLe1uRUK/ZilbuA6TSnW9zNWjcU4cgZSTj72xt26F1oSsxiW6/D63X0tonmEoX9D8J9UUxEkfbwAAAAAElFTkSuQmCC',
        advice: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAACFlBMVEUAAABAAIAzM5krK4AkJJIrHI4oG5QuI5csIZArIJUzH48vHI4uG5IrHI4wHJEvG5QuIZAtIJMuHZAtHY8vH5EuH5AvHpEvHZAuHZItH5EtHZIuH5EtHpEvHpIvHZEuHZAtH5EtH5AvHpEuHpIuHpEvH5AuH5EtHpIvHpEuHpEuHZItH5EvH5EuHpAuHpEuHpAuHZAuH5EtHpEuHZEuH5EuHpEtHpEuHpAuHpIuHpEuHpEvHZEuHpEvHpIuHpEuHpEuHpEuHpEuHpEtHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEwIJIwIZIxIpM0JJQ1JZQ1JpU2J5U3KJY4KZY5KZc6K5c8LZg/MZpAMZpCNJxDNZxENp1GOJ5HOZ5IOp9KPKBLPaBMPqFNQKFOQKJQQqNUR6VVR6VVSKZZTahiVqxkWK1lWa5nXK9oXbByZ7VzaLV0abZ4bbh5brh6cLl7cbp8crp9c7p9dLt/dbyAdryEe76HfcCLg8KOhcOQiMWTi8abk8qdlcunodGrpNOrpdO5tNq5tNu/ut3BvN7GweHGwuHHw+LJxePLx+PLx+TNyeXPy+bTz+jW0+nX1OrY1erY1uvb2Ozc2e3d2+3g3e/h3+/j4fDk4vHl4/Hm5fLo5vPq6PTr6fTr6vXx8Pjy8fjz8vn09Pn5+fz6+vz7+/39/P79/f7+/v////8IImQ/AAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAAAAWJLR0SxNGOeUgAAAqBJREFUSMeVVvkjVGEUvVHPlhIKlRJaNdayxFRjGZE5EmPaUCSS9kVRaU8RpVDaTLQQmfsf9sPM8973zZvF+ende8553/K+d+9HJCMiKSvXXFpdXWrOzUqMoABQ0gogID9V8SNfnVkJL1hNUT7kIekVMETl7pVG+phi+MSBtd769RXwg/J4Wb/xKPyiZouoT0ZApArzqQlsqInT9NFlCAIV61R9aDGCQlGIx7BLl2wb/S3gXZuO3OHWR1l1uSGWMAQMTBz3TCqSiIgy9cNOcdcpHS7xFODkVg+bQUSkCOdHJbsdAIBWduoNVoWI0mBgOOt6ZmRAChEVGBhuvubPzx0Ghv1EkTYDwxgzu7pVw+TiaZW2hVMSDAz2W/zq3NKUOq9ofAJlGRnQOHZDW8PDF7VLvIlyRcO0uK1dPA2M/T25xGfTIdEwL3+4eeBMh8abySIa5nhWfzJmeU7kD1OV4RpUtLJT5I9Ihl7mJn3cxK4eyWCR1vwIwMCgHbAPvgTwmH9IUzqoD48t/GsA6hf4ItDFC/VA4+J8rV5hlrZ1lMf7geu3AeDONaB/gt8Kgmzpw3U62dWshS0unuoQBCZKFHfBPsJ9WvSAh+0iv4HCxcOH+/xeCz5wr8jawonyxZRjli+rz1f5jzRAHhGlSrXhKX9x/2048ZWfSORWIlKsYq5hkt80AoBjhD/VS6VfISIySW+58Iu/9TS33P3OP9slao93mQGA9o/ugzp+Xq7hng62Uy5xdX3DMzPD9+rk/Ha19RQFVyoLQ5ZZjGO08h0fTLmP1TeIzQH1tk3LbFnJcpOLK/enL4v1bqNr/OxVYbRRo16RXu6rsYf6uAtE7rUaXB0y/N1QlG37hP/DlpeyKtCFJizBlFNiqaqylOSYEsK86P+uZ3c6bzSh9AAAAABJRU5ErkJggg==',
        test: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAABlVBMVEUAAABAAIAzM5krK4AkJJIrHI4oG5QuI5csIZArIJUzH48vHI4uG5IrHI4wHJEvG5QuIZAtIJMuHZAtHY8vH5EuH5AvHpEvHZAuHZItH5EtHZIuH5EtHpEvHpIvHZEuHZAtH5EtH5AvHpEuHpIuHpEvH5AuH5EtHpIvHpEuHpEuHZItH5EvH5EuHpAuHpEuHpAuHZAuH5EtHpEuHZEuH5EuHpEtHpEuHpAuHpIuHpEuHpEvHZEuHpEvHpIuHpEuHpEuHpEuHpEuHpEtHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEvH5EwIJIwIZI1JpU6K5c8LZhBMptCNJxKPKBRRKRYS6dZTahcT6lfU6tiVq1nW69tYrJuY7NwZbSBd72CeL2Ceb2Ee76HfcCNhMOOhcOQh8SSisaZkcmdlsyel8yim86mn9Ctp9S/ut3BvN7OyuXSzufV0unZ1uvc2eze3O7h3+/j4fDo5vPr6vXt7Pbv7fb09Pn19Pr29fr6+vz8+/39/P79/f7///8TgK2BAAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAAAAWJLR0SGjN47XQAAAf9JREFUSMeVlulD00AQxZ9FQymCCGhBBUu5VAyFotwFC22x2AwBRbT1AvGuclVUUDyq+3f7wQImO5vjfZx9v+zskZkF7KppjcUTM/PzM4l4rKUGLtI6R8ii4ajmYD/dP0eSMnqtwh7oShOruasnOX/DBCk1fkb2n0uTg1LNdv+FO+SoXLvV30auilryybkDuaZjf90seVD67KG/aoI8aSxQAa5Y4+b6m4rWTetIzz9/bcYazosj5W1JhQAA/baZzQ9iv1gsFr+K97YZqA8ANOn+PBI7REQfxUPpXmkAOsk7QBEAIwzwvVQqlX4ywE0gZDBARTJgBNFKDLBbKBQKnxmAwogRu4YFfg2kI84Cd7+t8cAApllgcSPPAwkkyc+20i1k/QG3VcDzL0sKQJHS401TkdKUv5QSim1VAgOqgyPlwbXwwD0FcB5B7vLtLJdfsoARBIY5wHy9wgJDAKJS9IH4RES0J1akocsAtIw9uvjjzxOiZ+Jggf1FoUvfeSXKW9u/xQtp4BpbZojMd2Uhfr2VJkhVOlivvHv3V58uy9Huw9Yz5q1UjgZ8FuOG4/Ld7KXcN/7fIC65+o2LPltWm73JNaWc/LONchutd9ir0TquUZ/oSqkae5XiLRC6nmGeDn1OLxSt44bl/zCGIqfcHjTVYX1wMpnNJicH9XC1NPwXrYpAw0ew7roAAAAASUVORK5CYII=',
        referral: 'data:image/png;base64,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',
        followUp: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAACHFBMVEUAAABAAIAzM5krK4AkJJIrHI4oG5QuI5csIZArIJUzH48vHI4uG5IrHI4wHJEvG5QuIZAtIJMuHZAtHY8vH5EuH5AvHpEvHZAuHZItH5EtHZIuH5EtHpEvHpIvHZEuHZAtH5EtH5AvHpEuHpIuHpEvH5AuH5EtHpIvHpEuHpEuHZItH5EvH5EuHpAuHpEuHpAuHZAuH5EtHpEuHZEuH5EuHpEtHpEuHpAuHpIuHpEuHpEvHZEuHpEvHpIuHpEuHpEuHpEuHpEuHpEtHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEuHpEvH5EwIJIwIZIyIpM0JJQ1JZQ1JpU3KJY5KZc6K5c8LZg9Lpk+L5lCM5tCNJxENp1HOJ5HOZ5IOp9KPKBLPaBMPqFMP6FTRqVUR6VYS6dZTahbT6leUqphVathVaxjV61kWK1nXK9qXrBrYLFtYrJvY7NxZrRzaLV0abZ5brh8crqEer6HfsCLg8KMg8ONhMOOhsSQh8SQiMWRicWSicaUjMelntCnodGvqdW4stm5tNq8t9y9uNy/ut3Cvd/JxePKxuPLx+TMyOTQzebSzufU0OjY1era1+zd2u3e3O7f3e7i4PDj4fDk4vHm5PLn5fLo5vPs6vXv7fbv7/fw7/fx8Pjy8fjz8vn19fr29fr39vv49/v4+Pz5+fz6+vz7+/38+/39/P79/f7+/v////9csO6DAAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAAAAWJLR0Sz2m3/fgAAAldJREFUSMdjYEAHnJL6RrZOXl5Otkb6EpwMBACbsrkfCjBTYsOjnEfP3Q8DuOly41DOpOLqhxW4a7JgUy9g7YcTWPFjqhd19cMDXETQ1Ut5++EFPnKo6mX9CAIlFPf4ENbgI4xQz+vsRwRwFYSpZ7b2IwpYMkE1aPgRCdQg6rndkMT8g6CMlCgsjuICa9BDiIS0LlvTEwdila2biMUKbXB6Q0o/bZs3rds8JRCofv3mJiwa3EApURnBD1yxIT1yzuYMv5xNm1cvAYLFU8pRdSgANSCl59ANK8P8Jm3O8yvZDAeFKBpMGRi4fJH4/ZunT9y8MNzPr37zxqrIyMiols1dKBp8ORgkkfnJ0zdvXlQAYtVungyiMjdPQXWTOIM+Cj94weY0CCs/FasGXQYjVIG5mxOQuRgaDBjsSdNgy+BImgYHBk/SNHiQroFkJ9mR6mmSg1Ufq4ZsaBIq2jwjCC3iJLBqmLepGkRVrtq8eWossrwYA4cvioYJmxuTgKB506YaP7/41Zu6Z27uQE18DGYoGsoQCTvXr2Jzp1/M5iVI0sbA/KCE6qbSvtkgsHzz2lSgD6ZGFG+ehSQrD8qibljyYvvmZVnADDUTZFMdWhZl0MWiYdrSLBCV2LtyfkMAQlgLs5iBgvBorGU4tAZTJ7YgU4VVPZbEqbdgIrEwFkAU3yLEFPdCyBWEDEH1vtIkVlmy6JWcsAs+9c5CmNUoH56wsuDFVlEzqrjgqtiZcbQFuHSwRLqbNr4WCpuiCUr+8DVWYCXUoGEX1zW0cfT0dLQx1BVnx5AGAFU+ZDhvjvXVAAAAAElFTkSuQmCC',
        phone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAMAAADzN3VRAAABO1BMVEUAAAAAAAAAAAAAAFUAAEArKyskJEkgIEAcHDkXFy4UFDsiETMeDzwaGkAWFjcgFTUdFDscEzkaEj4ZGToYGDgeFzwdFjocFTkaFDsZGTgaFDgcGDkbFzsaFjgZFTsdFTobGDsbFzodFjkcFTsbFDocFjkcFjscFjobFToaFzsaFzscFzscFzobFjkcFTobFzsaFjsaFjobFTsbFzscFjkbFjsbFzkcFjsbFTocFzkbFjobFjobFjsbFjkbFjsaFjsbFTobFTobFzsbFzobFzobFjkaFjocFjobFjsbFjkaFzocFzobFjobFTobFjobFjobFjobFjobFjobFjobFTobFjoaFjsbFjobFjobFjobFjobFjobFjobFjkbFjobFjobFjobFjobFjobFjobFjobFjobFjobFjr///8TGImGAAAAZ3RSTlMAAQIDBAYHCAkLDQ8RFBcYGhsdHyAiIyQnKTI2ODs9PkFCR0lLUVJTVFdjZGVnbnF1dnl6gYKGi5CTlZaYoKGlp6iqtLW2uLm7yMvM09bZ2tvc3+Di5ufo6+zt7/L09fb3+Pn7/P3+/mSK/QAAAAFiS0dEaMts9CIAAADbSURBVBgZpcFZIwJhGIDRpw8t9m2yZK0sKWQJ2ZfUiOyqSUTo/f//QLoy38wV5/AfRnzFwMVgTkRqMzj4Cs/Jkb6ra4UuJmFgQebRpeoKUHcZdAf3/DDz6NIVmpKyjm5VumFDjtvRTcsiXbVDhYN6OiXwmcLFzls/56UATsP1NKHGNi723ofY/VqK7l9mJrAZqGY9PlOkevbwOo7NsiRoi8x20PN408lvHvMlRMvUxxY2vbflUVpyF9gFi1aUpqB1hMbIN04m/ZFi2UDn3bREpDCGC39sbc7Ln30DzMggyYid+XAAAAAASUVORK5CYII=',
        whatsApp: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAMAAADzN3VRAAABa1BMVEUAAAAAAAAAAAAAAFUAAEAzADMrKyskJEkaGjMXFy4VFUASEjciETMgEEAeDzwcHDkbGzYYGD0WFjcgFTUbEjcaGjwcFTkcFTcaEzkZGTgeGDscFjcaFDgZFDwdFDscFDkbGDsbFzkaFjscFTkcFTsbFDoaFzsaFzocFjscFjobFTobFTkcFzkbFjkaFzscFzsbFjocFTocFzkaFjkcFTocFTkbFTscFjkbFTobFzkaFzsaFzobFjobFjobFToaFzocFjsbFjoaFjocFTkcFzobFzobFjobFjocFjobFzkbFjobFjobFjkcFjobFjobFTkbFToaFjscFjobFjobFjsbFTobFTkbFjobFjkbFjobFTocFzobFjobFjobFjoaFjocFjkbFTobFzobFjobFjobFjobFjobFjocFjkbFjobFjoaFjsbFjobFjobFzocFjobFjkbFjobFjobFjobFjobFjobFjobFjr///9WqwUkAAAAd3RSTlMAAQIDBAUGBwoLDA4PEBESExUXGBweJCUoKSsuMjM0P0FDRUhJS05PUlNUVVpeY2Rpbm90d3h5gYOGh4iMjZCSlJmanJ2en6Omqausra+xsrO3ubq7vr/GyMnKzM3P0tTV1tfZ2tvc3d7f5Ofo6+7x9Pn6+/z9/r4lQT8AAAABYktHRHjW2+RGAAABEklEQVQYGbXBhz8CYRwH4K83I67IzsjemZkZpayIIiNSlIw0rOve37/vPvfeXfwBPQ+qw7mRKP7krzwO/Gc/KFPmdC9aoM8Vhj+6svzICRUbilPUCpPj5WsKOualcA0Mx8okKnZoEboBHgAL5ewQLOmCFcKu0oFRIg90szQD4S0OzBOdQyd970PD5CDQw6kfhudraJppC8AhrcJwl4KmTgkCaHxQFgBXH1TvMQiZFFSdWTqb/uBRG9oUP4Rt6oWq9YRUcguWaARCtxyGZjCUT7shFZ5qIbDSJSpYhI9D56JlmKQIbcKwRuvB1/u5BgDtniL3MhhuiMqJEsm525xCj2MwNSV9EzbUuwOx5IVv2IKq+AUdBzf/4jfWoQAAAABJRU5ErkJggg==',
        cheifComplaint: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAB7FBMVEUAAAAAv4AAzJkA1aoA25IO1ZwN15QM0ZcL05sL1ZUKzJkT0JcS0ZsO1ZUOz5gN0JQN0ZYN0pkQ0ZYQ0pYQ0JcP0ZcP0JcP0JgO0ZgO0pYQ0pcP0ZYP0pYP0JcP0JgO0ZgO0pYO0pcO0JgO0ZcQ0ZgQ0JcP0ZgP0pYP0JcQ0ZcP0ZcO0pYO0JcO0ZgO0ZcQ0ZcP0ZcP0ZYP0pgP0ZcP0ZYP0ZcP0pcP0ZcP0ZcP0ZcP0ZgP0JcP0ZcP0JcP0ZcP0ZcP0ZcP0ZcP0ZcP0pcP0ZcP0ZcP0ZYP0ZcP0ZcP0ZcP0ZcP0ZcP0ZcP0ZcP0ZcQ0ZcR0ZgX05sZ05sc1J0e050g1J4p1qIt16Qv16Ux16Y42ak52ak/2qxC261F265H3K9O3bJP3bNV3rVY37dZ37da37hc4Lhl4bxn4r1p4r5r479u48Bv48F65sV75sZ85sZ95sd+5sd/5siB58iH6MuI6MyO6c6P6s6Q6s+R6s+S6tCT6tCa7NOc7NSf7dWg7daj7dek7del7tin7tmp7tms79ut8Nuw8N2x8N238eC98uK/8+PF9ObG9ObJ9ejM9enP9urR9uvS9uvU9+zY9+7Z+O/a+O/b+O/d+fDf+fHh+fLk+vPn+vXo+/Xs+/f4/vz5/v39//7+//////9GKtO2AAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAAAAWJLR0Sjx9rvGgAAAlhJREFUSMdjYEAHnJL6RrZOXl5Otkb6EpwMBACbsrkfCjBTYsOjnEfP3Q8DuOly41DOpOLqhxW4a7JgUy9g7YcTWPFjqhd19cMDXETQ1Ut5++EFPnKo6mX9CAIlFPf4ENbgI4xQz+vsRwRwFYSpZ7b2IwpYMkE1aPgRCdQg6rnd0CXSOicAQWcqhqO4wBr00MVTF0NBCrqMNji9oaSfgKT8oqmLS2KAoHTxlKL8pACUdAVKicoo6jvBRjcnAkELmNmJokMBqAElPSctnlNV3rYI4qJFreVVcxcnIcubMjBw+SIL5C6uBpLxDd1A0BAPZFYvzkOW9+VgkETxVcHiSlRvViwuROGLM+iTpkGXwYg0DQYM9rg1hM/owdBgy+CIoaF+5syZ0xMSJmfNWtyFocGBwRNDw0RQkGbnAIm+YAwNHlg0BEZERIT5+deA1GPR4IjLD/5xgVg87cBgh0tDWWNIYzkWT2MGa2ZdXV1tpN/UxfMWT8MSrJgRNxvk6WK/6PmLF8RgiTgJDA1ROTk56UF+7YsXLu7A0CDGwOGLww8T5ybPnYSuAZj4GMxwaAgM8gsKRNdgDMwPSqSkJXlQFkUuAzIW98bGIIHY3sUZ6FmUQRdJJHTuYjQwJxRJWguzmIlo6p+ABPobI5DLcGgNpk5sQaYKq3osiVNvwURiYSyAKL5FiCnuhZArCBmC6n2lSayyZNErOWEXfOqdhTCrUT48YWXBi62iZlRxwVWxM+NoC3DpuGFpOmjja6GwKZqg5A9fYwVWQg0adnFdQxtHT09HG0NdcXYMaQC9hGhmjxA9UwAAAABJRU5ErkJggg==',
        vitals: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAABy1BMVEUAAAAAv4AAzJkA1aoA25IO1ZwN15QM0ZcL05sL1ZUKzJkT0JcS0ZsO1ZUOz5gN0JQN0ZYN0pkQ0ZYQ0pYQ0JcP0ZcP0JcP0JgO0ZgO0pYQ0pcP0ZYP0pYP0JcP0JgO0ZgO0pYO0pcO0JgO0ZcQ0ZgQ0JcP0ZgP0pYP0JcQ0ZcP0ZcO0pYO0JcO0ZgO0ZcQ0ZcP0ZcP0ZYP0pgP0ZcP0ZYP0ZcP0pcP0ZcP0ZcP0ZcP0ZgP0JcP0ZcP0JcP0ZcP0ZcP0ZcP0ZcP0ZcP0pcP0ZcP0ZcP0ZYP0ZcP0ZcP0ZcP0ZcP0ZcP0ZcP0ZcP0Zca05wb05wc05wd050f1J4g1J4j1aAk1aAl1aAm1aEo1qIp1qIq1qM02Kc12Kc52ak62ao72apD261E265F265G269H3K9P3bNR3rRa37hb4Lhc4Lhp4r5u48B35cR45cV75saT6tCU6tGV69GX69KY69OZ7NOf7dWg7dap79qr79uu79yx8N2y8N6z8N648eC58uG78uK/8+PA8+TN9enO9urW9+3X9+3X9+7a+O/b+O/e+fHf+fHk+vPq+/br+/bu/Pjv/Pj0/fr1/fv5/v36/v38/v79//7+//////+9E5UiAAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAAAAWJLR0SYdtEGPgAAAiBJREFUSMeVVllbE0EQbIMuEEQR0ICIYsATl0BQ7qiBJBhMxiNeRCUiCgoocnoLXnhhIufWz/VB+DDTs7vZeuyq2q93pqe7iWQUVvr8ge6+vu6A31dRSDbQaltFFlq8moV8d0OvYIjoRSZyV11YKNF7aqdKX9IpTNGxl+v3h4UFQuWy/uBlYYnY4Wx9tbCFNyufmL0hVratL+4ROSC8b0uf1ylyQrtr03CSc4mRkQSPHv+nL4owZnwFWB7nSbmJiKiBEcOG8fGTYQwzop6ISOP1M48JISbwgdeVRkS1PNcl3BUiiSXO1BBRKw//xi0hbiLNmXNE7rgTQ7yAKoUTg/CQT22YnlYbdPKrDYahNjTSBbUBUBsCFHRmuEhRZ4ZLzg2OUzrPg8+xfhW4so5nqp/mxzqwtjF2B7g9trE2oDhWfnEvMfMgA2RSs5hTXFwFi/1AagEA5lP4zsgDVMCKL4MbvwDgZwJ/FMVHLXLwGwZfA8Crh1iUuWYi8srBKbxJLgJf+99iUuaOEJEm94DkCl5cf/zo2hSW+1VPlHT5M09XkX73Po3VJzJz2qTNDH0BgM+DrIdvTrAT/ELvj47e49FjW6OnPbdW2eZy2IxLttt3eS7tvvT/AXHIVh+vcjiyquUhVxay0veU8jG6x+Ks2opVg3pHXchssOeZ7ALuMxHF6lBvtaFoR89mvY94c80uu4Um36M3dQWj0WBXk+7JZ/Rfqe5Qy5n8GbkAAAAASUVORK5CYII='
      },
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
          color: '#7F7B92'
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
      },
      defaultStyle: {
        // alignment: 'justify',
        font: 'ArialUnicodeMS',

      }
    }).download('e-precription');
  }

  getRecords(type: string) {
    let records = [];
    switch (type) {
      case 'diagnosis':
        if (this.existingDiagnosis.length) {
          this.existingDiagnosis.forEach(d => {
            records.push([this.translateService.instant(d.diagnosisName), this.translateService.instant(d.diagnosisType), this.translateService.instant(d.diagnosisStatus)]);
          });
        } else {
          records.push([{ text: 'NIL', colSpan: 3, alignment: 'center' }]);
        }
        break;
      case 'medication':
        if (this.medicines.length) {
          this.medicines.forEach(m => {
            records.push([this.translateService.instant(m.drug), this.translateService.instant(m.strength), m.days, m.timing, m.remark]);
          });
        } else {
          records.push([{ text: 'NIL', colSpan: 5, alignment: 'center' }]);
        }
        break;
      case 'additionalInstruction':
        if (this.additionalInstructions.length) {
          this.additionalInstructions.forEach(ai => {
            records.push({ text: ai.value, margin: [0, 5, 0, 5] });
          });
        }
        break;
      case 'advice':
        if (this.advices.length) {
          this.advices.forEach(a => {
            records.push({ text: this.translateService.instant(a.value), margin: [0, 5, 0, 5] });
          });
        }
        break;
      case 'test':
        if (this.tests.length) {
          this.tests.forEach(t => {
            records.push({ text: this.translateService.instant(t.value), margin: [0, 5, 0, 5] });
          });
        }
        break;
      case 'referral':
        if (this.referrals.length) {
          this.referrals.forEach(r => {
            records.push([r.speciality, r.facility, r.priority, r.reason]);
          });
        } else {
          records.push([{ text: 'NIL', colSpan: 4, alignment: 'center' }]);
        }
        break;
      case 'followUp':
          if (this.followUp) {
            records.push([this.translateService.instant(this.followUp.wantFollowUp), moment(this.followUp.followUpDate).format('DD MMM YYYY'), this.followUp.followUpTime, this.followUp.followUpReason]);
          } else {
            records.push(['No','-','-','-']);
          }
          break;
      case 'cheifComplaint':
        if (this.cheifComplaints.length) {
          this.cheifComplaints.forEach(cc => {
            records.push({text: [{text: cc, bold: true},``], margin: [0, 5, 0, 5]});
          });
        }
        break;
      case 'vitals':
        if (this.vitalObs.length) {
          this.vitalObs.forEach(v => {
            records.push({text: [{text: `${this.translateService.instant(v.concept.display)} : `, bold: true},`${v.value}`], margin: [0, 5, 0, 5]});
          });
        }
        break;
    }
    return records;
  }

  toObjectUrl(url: any) {
    return fetch(url)
        .then((response)=> {
          return response.blob();
        })
        .then(blob=> {
          return new Promise((resolve, _) => {
              if(!blob) resolve("");
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
          });
        });
  }

  ngOnDestroy() {
    this.eventsSubscription?.unsubscribe();
  }
}
