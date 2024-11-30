import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/services/appointment.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { MatAccordion } from '@angular/material/expansion';
import medicines from '../../core/data/medicines';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { SocketService } from 'src/app/services/socket.service';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { LinkService } from 'src/app/services/link.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatBoxComponent } from 'src/app/modal-components/chat-box/chat-box.component';
import { VideoCallComponent } from 'src/app/modal-components/video-call/video-call.component';
import { visitTypes } from 'src/config/constant';

export const PICK_FORMATS = {
  parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd MMMM yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class VisitSummaryComponent implements OnInit, OnDestroy {

  visit: any;
  patient: any;
  baseUrl: string = environment.baseURL;
  visitAppointment: any;
  visitStatus: string;
  providerName: string;
  hwPhoneNo: string;
  clinicName: string;
  vitalObs: any = [];
  cheifComplaints: any = [];
  checkUpReasonData: any = [];
  physicalExaminationData: any = [];
  patientHistoryData: any = [];
  conceptAdditionlDocument = "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba";
  conceptPhysicalExamination = '200b7a45-77bc-4986-b879-cc727f5f7d5b';
  conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  conceptNote = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptTest = '23601d71-50e6-483f-968d-aeef3031346d';
  conceptReferral = "605b6f15-8f7a-4c45-b06d-14165f6974be";
  conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';
  conceptDDx = 'bc48889e-b461-4e5e-98d1-31eb9dd6160e';
  conceptAiDiagnosisSuggestions ="d29d33c8-9307-4d7a-b0c6-38d6d80e60f4";
  conceptAiTreatmentPlan = "9c55ff9e-8f35-4b3d-8e37-abb73f1701d9";
  conceptChiefComplaintNotes = "589f6615-48c7-4ca8-9b8f-9f8c6daacb9f";
  conceptSecondaryDiagnosisNotes = "c3db7e59-7433-4eb0-b1cc-2e342c534b34";

  baseURL = environment.baseURL;
  additionalDocs: any = [];
  eyeImages: any = [];
  notes: any = [];
  medicines: any = [];
  existingDiagnosis: any = [];
  advices: any = [];
  additionalInstructions: any = [];
  tests: any = [];
  referrals: any = [];
  pastVisits: any = [];
  minDate = new Date();
  selectedTabIndex: number = 0;
  specializations: any[] = [
    {
      id: 1,
      name: 'General Physician'
    },
    {
      id: 2,
      name: 'Dermatologist'
    },
    {
      id: 3,
      name: 'Gynecologist'
    },
    {
      id: 4,
      name: 'Pediatrician'
    }
  ];
  diagnosis: any[] = [
    // {
    //   id: 1,
    //   name: 'Viral Flu'
    // }
  ];
  strengthList: any[] = [
    {
      id: 1,
      name: '5 Mg'
    },
    {
      id: 2,
      name: '10 Mg'
    },
    {
      id: 3,
      name: '50 Mg'
    },
    {
      id: 4,
      name: '75 Mg'
    },
    {
      id: 5,
      name: '100 Mg'
    },
    {
      id: 6,
      name: '500 Mg'
    },
    {
      id: 7,
      name: '1000 Mg'
    }
  ];
  daysList: any[] = [
    {
      id: 1,
      name: '7'
    },
    {
      id: 2,
      name: '14'
    },
    {
      id: 3,
      name: '20'
    },
    {
      id: 4,
      name: '25'
    },
    {
      id: 5,
      name: '30'
    }
  ];
  timingList: any[] = [
    {
      id: 1,
      name: '1 - 0 - 0'
    },
    {
      id: 2,
      name: '0 - 1 - 0'
    },
    {
      id: 3,
      name: '0 - 0 - 1'
    },
    {
      id: 4,
      name: '1 - 1 - 0'
    },
    {
      id: 5,
      name: '1 - 0 - 1'
    },
    {
      id: 6,
      name: '0 - 1 - 1'
    },
    {
      id: 7,
      name: '1 - 1 - 1'
    }
  ];
  timeList: any = [];
  drugNameList: any = [];
  advicesList: any = [];
  testsList: any = [];

  visitEnded: any = false;
  visitCompleted: any = false;
  visitNotePresent: any = false;
  isVisitNoteProvider: boolean = false;
  referSpecialityForm: FormGroup;
  provider: any;
  showAll: boolean = true;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  addMoreNote: boolean = false;
  addMoreMedicine: boolean = false;
  addMoreAdditionalInstruction: boolean = false;
  addMoreAdvice: boolean = false;
  addMoreTest: boolean = false;
  addMoreReferral: boolean = false;
  addMoreDiagnosis: boolean = false;

  patientInteractionForm: FormGroup;
  diagnosisForm: FormGroup;
  addNoteForm: FormGroup;
  addMedicineForm: FormGroup;
  addAdditionalInstructionForm: FormGroup;
  addAdviceForm: FormGroup;
  addTestForm: FormGroup;
  addReferralForm: FormGroup;
  followUpForm: FormGroup;

  displayedColumns: string[] = ['action', 'created_on', 'consulted_by', 'cheif_complaint', 'summary', 'prescription', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();

  diagnosisSubject: BehaviorSubject<any>;
  diagnosis$: Observable<any>;
  private dSearchSubject: Subject<string> = new Subject();

  dialogRef1: MatDialogRef<ChatBoxComponent>;
  dialogRef2: MatDialogRef<VideoCallComponent>;
  currentComplaint: any;
  familyHistory: any;
  physicalExamination: any;
  medicalHistory: any;

  ddx: any;
  ddxPresent: any = false;
  ddxForm: FormGroup;

  aiDiagnosisPresent: any = false;
  diagnosisSuggestions: any[] = [];
  diagnosisSuggestionsObsUuid: string;
  treatmentPlan: any;

  submittedPatientInteraction: boolean = false;

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.advicesList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  search2 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.testsList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  search3 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.drugNameList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
    )

  search4 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.strengthList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
    )

  search5 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.daysList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
    )

  search6 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.timingList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
    )

  constructor(
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private appointmentService: AppointmentService,
    private diagnosisService: DiagnosisService,
    private toastr: ToastrService,
    private coreService: CoreService,
    private encounterService: EncounterService,
    private linkSvc: LinkService,
    private socket: SocketService) {
    this.referSpecialityForm = new FormGroup({
      refer: new FormControl(false, [Validators.required]),
      specialization: new FormControl(null, [Validators.required])
    });

    this.patientInteractionForm = new FormGroup({
      uuid: new FormControl(null),
      present: new FormControl(false, [Validators.required]),
      spoken: new FormControl(null, [Validators.required]),
      chiefComplaintNotes: new FormControl(null)
    });

    this.diagnosisForm = new FormGroup({
      present: new FormControl(false, [Validators.required]),
      diagnosisIdentified: new FormControl(null, [Validators.required]),
      diagnosisName: new FormControl(null, Validators.required),
      diagnosisType: new FormControl(null, Validators.required),
      diagnosisStatus: new FormControl(null, Validators.required)
    });

    this.addNoteForm = new FormGroup({
      note: new FormControl(null, [Validators.required])
    });

    this.addMedicineForm = new FormGroup({
      drug: new FormControl(null, [Validators.required]),
      strength: new FormControl(null, [Validators.required]),
      days: new FormControl(null, [Validators.required]),
      timing: new FormControl(null, [Validators.required]),
      remark: new FormControl(null, [Validators.required])
    });

    this.addAdditionalInstructionForm = new FormGroup({
      note: new FormControl(null, [Validators.required])
    });

    this.addAdviceForm = new FormGroup({
      advice: new FormControl(null, [Validators.required])
    });

    this.addTestForm = new FormGroup({
      test: new FormControl(null, [Validators.required])
    });

    this.addReferralForm = new FormGroup({
      speciality: new FormControl(null, [Validators.required]),
      remark: new FormControl(null, [Validators.required]),
    });

    this.followUpForm = new FormGroup({
      present: new FormControl(false, [Validators.required]),
      wantFollowUp: new FormControl('No', [Validators.required]),
      followUpDate: new FormControl(null),
      followUpTime: new FormControl(null),
      followUpReason: new FormControl(null),
      uuid: new FormControl(null)
    });

    this.diagnosisSubject = new BehaviorSubject<any[]>([]);
    this.diagnosis$ = this.diagnosisSubject.asObservable();

    this.ddxForm = new FormGroup({
      inputtype: new FormControl('default', Validators.required),
      customInput: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    this.provider = JSON.parse(localStorage.getItem("provider"));
    this.drugNameList = this.drugNameList.concat(medicines);
    // this.timeList = this.getHours();
    this.getVisit(id);
    this.formControlValueChanges();
    this.dSearchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(searchTextValue => {
      this.searchDiagnosis(searchTextValue);
    });
  }

  get pif() { return this.patientInteractionForm.controls; }

  formControlValueChanges() {
    this.referSpecialityForm.get('refer').valueChanges.subscribe((val: boolean) => {
      if (val) {
        this.referSpecialityForm.get('specialization').setValue(null);
      }
    });

    this.diagnosisForm.get('diagnosisIdentified').valueChanges.subscribe((val: any) => {
      if (val == 'Yes') {
        this.diagnosisForm.get('diagnosisName').setValidators(Validators.required);
        this.diagnosisForm.get('diagnosisName').updateValueAndValidity();
        this.diagnosisForm.get('diagnosisType').setValidators(Validators.required);
        this.diagnosisForm.get('diagnosisType').updateValueAndValidity();
        this.diagnosisForm.get('diagnosisStatus').setValidators(Validators.required);
        this.diagnosisForm.get('diagnosisStatus').updateValueAndValidity();
      } else {
        this.diagnosisForm.get('diagnosisName').setValue(null);
        this.diagnosisForm.get('diagnosisName').clearValidators();
        this.diagnosisForm.get('diagnosisName').updateValueAndValidity();
        this.diagnosisForm.get('diagnosisType').setValue(null);
        this.diagnosisForm.get('diagnosisType').clearValidators();
        this.diagnosisForm.get('diagnosisType').updateValueAndValidity();
        this.diagnosisForm.get('diagnosisStatus').setValue(null);
        this.diagnosisForm.get('diagnosisStatus').clearValidators();
        this.diagnosisForm.get('diagnosisStatus').updateValueAndValidity();
      }
    });

    this.followUpForm.get('wantFollowUp').valueChanges.subscribe((val: any) => {
      if (val == 'Yes') {
        this.followUpForm.get('followUpDate').setValidators(Validators.required);
        this.followUpForm.get('followUpDate').updateValueAndValidity();
        this.followUpForm.get('followUpTime').setValidators(Validators.required);
        this.followUpForm.get('followUpTime').updateValueAndValidity();
      } else {
        this.followUpForm.get('followUpDate').clearValidators();
        this.followUpForm.get('followUpDate').updateValueAndValidity();
        this.followUpForm.get('followUpTime').clearValidators();
        this.followUpForm.get('followUpTime').updateValueAndValidity();
      }
    });
    this.followUpForm.get('followUpDate').valueChanges.subscribe((val: any) => {
      if (val) {
        this.timeList = this.getHours(false, val);
      } else {
        this.timeList = [];
      }
    });

    this.ddxForm.get('inputtype').valueChanges.subscribe(val => {
      if (val == 'custom') {
        this.ddxForm.get('customInput').setValidators([Validators.required]);
        this.ddxForm.get('customInput').updateValueAndValidity();
      } else {
        this.ddxForm.get('customInput').clearValidators();
        this.ddxForm.get('customInput').updateValueAndValidity();
      }
    });

    this.patientInteractionForm.get('spoken').valueChanges.subscribe((val: any) => {
      if (val == 'Yes') {
        this.patientInteractionForm.get('chiefComplaintNotes').setValidators(Validators.required);
        this.patientInteractionForm.get('chiefComplaintNotes').updateValueAndValidity();
      } else {
        this.patientInteractionForm.get('chiefComplaintNotes').setValue(null);
        this.patientInteractionForm.get('chiefComplaintNotes').clearValidators();
        this.patientInteractionForm.get('chiefComplaintNotes').updateValueAndValidity();
      }
    });
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
            // check if visit note exists for this visit
            this.visitNotePresent = this.checkIfEncounterExists(visit.encounters, 'Visit Note');
            // check if visit complete exists for this visit
            this.visitCompleted = this.checkIfEncounterExists(visit.encounters, 'Visit Complete');
            // check if visit note provider and logged in provider are same
            this.visitEnded = this.checkIfEncounterExists(visit.encounters, 'Patient Exit Survey') || visit.stopDatetime;
            // check if visit note exists for this visit
            this.ddxPresent = this.checkIfEncounterExists(visit.encounters, 'Differential Diagnosis');
            // check if visit note exists for this visit
            this.aiDiagnosisPresent = this.checkIfEncounterExists(visit.encounters, 'AI Diagnosis and Treatment Plan');
            // check if visit note provider and logged in provider are same
            this.getPastVisitHistory();
            if (this.visitNotePresent) {
              this.visitNotePresent.encounterProviders.forEach((p: any) => {
                if (p.provider.uuid == this.provider.uuid) {
                  this.isVisitNoteProvider = true;
                }
              });
              this.checkIfPatientInteractionPresent(visit.attributes);
              this.checkIfDiagnosisPresent();
              this.checkIfNotePresent();
              this.checkIfMedicationPresent();
              this.getAdvicesList();
              this.checkIfAdvicePresent();
              this.getTestsList();
              this.checkIfTestPresent();
              this.checkIfReferralPresent();
              this.checkIfFollowUpPresent();
              if (this.aiDiagnosisPresent) {
                this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptAiDiagnosisSuggestions).subscribe((response: any) => {
                  response.results.forEach((obs: any) => {
                    if (obs.encounter.visit.uuid === this.visit.uuid && obs.value) {
                      // const result = (JSON.parse(obs.value)?.data.choices[0]?.message.content.trim()).match(/```json((.|[\n\r])*)```/);
                      // this.diagnosisSuggestions = JSON.parse(result[0].replace('```json','').replace('``json','').replace('```','').replace('``','').trim()).diagnosis;
                      this.diagnosisSuggestions = JSON.parse(obs.value)?.data.choices[0]?.message.content.split('\n');
                      this.diagnosisSuggestionsObsUuid = obs.uuid;
                    }
                  });
                });
                this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptAiTreatmentPlan).subscribe((response: any) => {
                  response.results.forEach((obs: any) => {
                    if (obs.encounter.visit.uuid === this.visit.uuid && obs.value) {
                      // const result = (JSON.parse(obs.value)?.data.choices[0]?.message.content.trim()).match(/```json((.|[\n\r])*)```/);
                      this.treatmentPlan = JSON.parse(obs.value)?.data?.choices[0]?.message?.content?.split('\n');
                    }
                  });
                });
              } else {
                setTimeout(() => {
                  this.getDiagnosisSuggestions();
                }, 3000);
              }
            }
            this.getAppointment(visit.uuid);
            this.getVisitProvider(visit.encounters);
            this.getVitalObs(visit.encounters);
            this.getCheckUpReason(visit.encounters);
            this.getPhysicalExamination(visit.encounters);
            this.getEyeImages(visit);
            this.getMedicalHistory(visit.encounters);
            this.getVisitAdditionalDocs(visit);
            // if (this.ddxPresent) {
            //   if (this.username == 'doctorai') {
            //     this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptDDx).subscribe((response: any) => {
            //       response.results.forEach((obs: any) => {
            //         if (obs.encounter.visit.uuid === this.visit.uuid) {
            //           this.ddx = {
            //             maxCols: 1,
            //             data: [],
            //             model: null
            //           };
            //           let maxCol = 1;
            //           const rows = obs?.value.split('\n');
            //           rows.forEach(r => {
            //             const cols = r.split('|');
            //             if(cols.length > maxCol) maxCol = cols.length;
            //             this.ddx.data.push(cols);
            //           });
            //           this.ddx.maxCols = maxCol;
            //           this.ddx.model = obs?.value.comment
            //           console.log(this.ddx);
            //         }
            //       });
            //     });
            //   }
            // } else {
            //   setTimeout(() => {
            //     this.getDDx();
            //   }, 3000);
            // }
          }
        });
      }
    }, (error: any) => {
      this.router.navigate(['/dashboard']);
    });
  }

  getVisitProvider(encounters: any) {
    encounters.forEach((encounter: any) => {
      if (encounter.display.match("ADULTINITIAL") !== null) {
        this.providerName = encounter.encounterProviders[0].provider.person.display;
        // store visit provider in localStorage
        localStorage.setItem('patientVisitProvider', JSON.stringify(encounter.encounterProviders[0]));
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

  getAppointment(visitId: string) {
    this.appointmentService.getAppointment(visitId).subscribe((res: any) => {
      if (res) {
        this.visitAppointment = res?.data?.slotJsDate;
      }
    });
  }

  getPatientIdentifier(identifierType: string) {
    let identifier = '';
    if (this.patient) {
      this.patient.identifiers.forEach((idf: any) => {
        if (idf.identifierType.display == identifierType) {
          identifier = idf.identifier;
        }
      });
    }
    return identifier;
  }

  getVitalObs(encounters: any) {
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display == 'Vitals') {
        this.vitalObs = enc.obs;
      }
    });
  }

  getObsValue(obsName: string) {
    let val = null;
    this.vitalObs.forEach((obs: any) => {
      if (obs.concept.display == obsName) {
        val = obs.value;
      }
    });
    return val;
  }

  /**
  * Get chief complaints and patient visit reason/summary
  * @param {any[]} encounters - Array of encounters
  * @return {void}
  */
  getCheckUpReason(encounters: any[]) {
    this.cheifComplaints = [];
    this.checkUpReasonData = [];
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: any) => {
          if (obs.concept.display === visitTypes.CURRENT_COMPLAINT) {
            this.currentComplaint = obs.value;
            const currentComplaint = this.visitService.getData(obs)?.value.split('<b>');
            for (let i = 0; i < currentComplaint.length; i++) {
              if (currentComplaint[i] && currentComplaint[i].length > 1) {
                const obs1 = currentComplaint[i].split('<');
                if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  this.cheifComplaints.push(obs1[0]);
                }
                const splitByBr = currentComplaint[i].split('<br/>');
                if (splitByBr[0].includes(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  const obj1: any = {};
                  obj1.title = visitTypes.ASSOCIATED_SYMPTOMS;
                  obj1.data = [];
                  for (let j = 1; j < splitByBr.length; j = j + 2) {
                    if (splitByBr[j].trim() && splitByBr[j].trim().length > 1) {
                      obj1.data.push({ key: splitByBr[j].replace('• ', '').replace(' -', ''), value: splitByBr[j + 1] });
                    }
                  }
                  this.checkUpReasonData.push(obj1);
                } else {
                  const obj1: any = {};
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
  * @param {any[]} encounters - Array of encounters
  * @return {void}
  */
  getPhysicalExamination(encounters: any[]) {
    this.physicalExaminationData = [];
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: any) => {
          if (obs.concept.display === 'PHYSICAL EXAMINATION') {
            const physicalExam = this.visitService.getData(obs)?.value.replace(new RegExp('<br/>►', 'g'), '').split('<b>');
            for (let i = 0; i < physicalExam.length; i++) {
              if (physicalExam[i]) {
                const splitByBr = physicalExam[i].split('<br/>');
                if (splitByBr[0].includes('Abdomen')) {
                  const obj1: any = {};
                  obj1.title = splitByBr[0].replace('</b>', '').replace(':', '').trim();
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim()) {
                      obj1.data.push({ key: splitByBr[k].replace('• ', ''), value: null });
                    }
                  }
                  this.physicalExaminationData.push(obj1);
                } else {
                  const obj1: any = {};
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
  * @param {any[]} encounters - Array of encounters
  * @return {void}
  */
  getMedicalHistory(encounters: any[]) {
    this.patientHistoryData = [];
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: any) => {
          if (obs.concept.display === visitTypes.MEDICAL_HISTORY) {
            const medicalHistory = this.visitService.getData(obs)?.value.split('<br/>');
            const obj1: any = {};
            obj1.title = 'Patient history';
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
            const obj1: any = {};
            obj1.title = 'Family history';
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

  getEyeImages(visit: any) {
    this.eyeImages = [];
    this.diagnosisService.getObs(visit.patient.uuid, this.conceptPhysicalExamination).subscribe((response) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value` };
          this.eyeImages.push(data);
        }
      });
    });
  }

  previewEyeImages(index: number) {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.eyeImages }).subscribe((res: any) => { });
  }

  getVisitAdditionalDocs(visit: any) {
    this.additionalDocs = [];
    this.diagnosisService.getObs(visit.patient.uuid, this.conceptAdditionlDocument).subscribe((response) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value` };
          this.additionalDocs.push(data);
        }
      });
    });
  }

  previewDocImages(index: number) {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.additionalDocs }).subscribe((res: any) => { });
  }

  onTabChange(event: number) {
    // console.log(event);
    this.selectedTabIndex = event;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  getAge(birthdate: string) {
    let years = moment().diff(birthdate, 'years');
    var months = moment().diff(birthdate, 'months');
    let days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} years`;
    } else if (months > 1) {
      return `${months} months`;
    } else {
      return `${days} days`;
    }
  }

  getPersonAttributeValue(attrType: string) {
    let val = 'NA';
    if (this.patient) {
      this.patient.person.attributes.forEach((attr: any) => {
        if (attrType == attr.attributeType.display) {
          val = attr.value;
        }
      });
    }
    return val;
  }

  getWhatsAppLink() {
    return this.visitService.getWhatsappLink(this.getPersonAttributeValue('Telephone Number'), `Hello I'm calling for consultation`);
  }

  replaceWithStar(str: string) {
    let n = str.length;
    return str.replace(str.substring(0, n - 4), "*****");
  }

  checkIfEncounterExists(encounters: any, visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  checkVisitStatus(encounters: any) {
    if (this.checkIfEncounterExists(encounters, 'Patient Exit Survey')) {
      this.visitStatus = 'Ended Visit';
    } else if (this.checkIfEncounterExists(encounters, 'Visit Complete')) {
      this.visitStatus = 'Completed Visit';
    } else if (this.checkIfEncounterExists(encounters, 'Visit Note')) {
      this.visitStatus = 'In-progress Visit';
    } else if (this.checkIfEncounterExists(encounters, 'Flagged')) {
      this.visitStatus = 'Priority Visit';
    } else if (this.checkIfEncounterExists(encounters, 'ADULTINITIAL') || this.checkIfEncounterExists(encounters, 'Vitals')) {
      this.visitStatus = 'Awaiting Visit';
    }
  }

  referSpecialist() {
    if (this.referSpecialityForm.invalid) {
      this.toastr.warning("Please select specialization", "Invalid!");
      return;
    }

    if (this.visitNotePresent) {
      this.toastr.warning("Can't refer, visit note already exists for this visit!", "Can't refer");
      return;
    }

    this.coreService.openConfirmationDialog({ confirmationMsg: 'Are you sure to re-assign this visit to another doctor?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' })
      .afterClosed().subscribe((res: any) => {
        if (res) {
          let attr = this.checkIfAttributeExists(this.visit.attributes);
          if (attr) {
            this.visitService.updateAttribute(this.visit.uuid, attr.uuid, { attributeType: attr.attributeType.uuid, value: this.referSpecialityForm.value.specialization }).subscribe((result: any) => {
              if (result) {
                this.updateEncounterForRefer();
              }
            });
          } else {
            this.visitService.postAttribute(this.visit.uuid, { attributeType: attr.attributeType.uuid, value: this.referSpecialityForm.value.specialization }).subscribe((result: any) => {
              if (result) {
                this.updateEncounterForRefer();
              }
            });
          }
        }
      });
  }

  updateEncounterForRefer() {
    const timestamp = new Date(Date.now() - 30000);
    const patientUuid = this.visit.patient.uuid;
    const providerUuid = this.provider.uuid;
    const json = {
      patient: patientUuid,
      encounterType: "8d5b27bc-c2cc-11de-8d13-0010c6dffd0f", //ADULTINITIAL encounter
      encounterProviders: [
        {
          provider: providerUuid,
          encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e04", // Doctor encounter role
        },
      ],
      visit: this.visit.uuid,
      encounterDatetime: timestamp,
    };
    this.encounterService.postEncounter(json).subscribe((response) => {
      if (response) {
        this.router.navigate(["/dashboard"]);
        this.toastr.success("Visit has been re-assigned to the another speciality doctor successfully.", "Visit Re-assigned!")
      }
    });
  }

  checkIfAttributeExists(attrs: any) {
    let currentAttr;
    attrs.forEach((attr: any) => {
      if (attr.attributeType.display == 'Visit Speciality') {
        currentAttr = attr;
      }
    });
    return currentAttr;
  }

  startChat() {
    if (this.dialogRef1) {
      this.dialogRef1.close();
      return;
    };
    this.dialogRef1 = this.coreService.openChatBoxModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID')
    });

    this.dialogRef1.afterClosed().subscribe((res: any) => {
      this.dialogRef1 = undefined;
    });
  }

  startCall() {
    if (this.dialogRef2) {
      this.dialogRef2.close();
      return;
    };
    this.dialogRef2 = this.coreService.openVideoCallModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      connectToDrId: this.userId,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID'),
      initiator: 'dr',
      drPersonUuid: this.provider?.person.uuid,
      patientAge: this.patient.person.age,
      patientGender: this.patient.person.gender,
    });

    this.dialogRef2.afterClosed().subscribe((res: any) => {
      this.dialogRef2 = undefined;
    });
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  get username() {
    return JSON.parse(localStorage.user).username;
  }

  checkIfDateOldThanOneDay(data: any) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if (hours > 24) {
      return moment(data).format('DD MMM, YYYY');
    };
    if (hours < 1) {
      if (minutes < 0) return `Due : ${moment(data).format('DD MMM, YYYY hh:mm A')}`;
      return `${minutes} minutes ago`;
    }
    return `${hours} hrs ago`;
  }

  startVisitNote() {
    const json = {
      patient: this.visit.patient.uuid,
      encounterType: "d7151f82-c1f3-4152-a605-2f9ea7414a79", // Visit Note encounter
      encounterProviders: [
        {
          provider: this.provider.uuid,
          encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03", // Doctor encounter role
        },
      ],
      visit: this.visit.uuid,
      encounterDatetime: new Date(Date.now() - 30000)
    };
    this.encounterService.postEncounter(json).subscribe((response) => {
      if (response) {
        this.getVisit(this.visit.uuid);
      }
    });
  }

  checkIfPatientInteractionPresent(attributes: any) {
    attributes.forEach((attr: any) => {
      if (attr.attributeType.display == 'Patient Interaction') {
        this.patientInteractionForm.patchValue({ present: true, spoken: attr.value, uuid: attr.uuid });
      }
    });

    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptChiefComplaintNotes).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.patientInteractionForm.patchValue({
            chiefComplaintNotes: obs.value
          });
        }
      });
    });
  }

  savePatientInteraction() {
    this.submittedPatientInteraction = true;
    if (this.patientInteractionForm.invalid || !this.isVisitNoteProvider) {
      return;
    }
    this.visitService.postAttribute(this.visit.uuid, { attributeType: "6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc", value: this.patientInteractionForm.value.spoken })
      .subscribe((res: any) => {
        if (res) {
          this.patientInteractionForm.patchValue({ present: true, uuid: res.uuid });
          this.encounterService.postObs({
            concept: this.conceptChiefComplaintNotes,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: this.patientInteractionForm.value.chiefComplaintNotes,
            encounter: this.visitNotePresent.uuid
          }).subscribe((result: any) => {
            if (result) {
              this.updateAIDiagnosis();
            }
          });
        }
      });
    
  }

  deletePatientInteraction() {
    this.visitService.deleteAttribute(this.visit.uuid, this.patientInteractionForm.value.uuid).subscribe((res: any) => {
      this.patientInteractionForm.patchValue({ present: false, spoken: null, uuid: null });
    });
  }

  toggleDiagnosis() {
    this.addMoreDiagnosis = !this.addMoreDiagnosis;
    this.diagnosisForm.reset();
  }

  checkIfDiagnosisPresent() {
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptDiagnosis).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          let identified = obs.value === 'DIAGNOSIS NOT IDENTIFIED' ? false : true;
          this.diagnosisForm.patchValue({
            present: true,
            diagnosisIdentified: identified ? 'Yes' : 'No',
            diagnosisName: identified ? obs.value.split(':')[0].trim(): null,
            diagnosisType: identified ? obs.value.split(':')[1].split('&')[0].trim() : null,
            diagnosisStatus: identified ? obs.value.split(':')[1].split('&')[1].trim(): null
          });
          this.diagnosisForm.get('diagnosisName')?.disable();
        }
      });
    });
  }

  onKeyUp(event: any) {
    this.dSearchSubject.next(event.term);
    // this.dSearchSubject.next(event.target.value);
  }

  searchDiagnosis(val: any) {
    if (val?.length >= 3) {
      this.diagnosisService.getDiagnosisList(val).subscribe(response => {
        if (response && response.length) {
          let data = [];
          response.forEach(element => {
            if (element) {
              data.push({ name: element });
            }
          });
          this.diagnosisSubject.next(data);
        } else {
          this.diagnosisSubject.next([]);
        }
      }, (error) => {
        this.diagnosisSubject.next([]);
      });
    }
  }

  saveDiagnosis() {
    if (this.diagnosisForm.invalid || !this.isVisitNoteProvider) {
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptDiagnosis,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.diagnosisForm.value.diagnosisIdentified === 'Yes' ? `${this.diagnosisForm.value.diagnosisName}:${this.diagnosisForm.value.diagnosisType} & ${this.diagnosisForm.value.diagnosisStatus}`: 'DIAGNOSIS NOT IDENTIFIED',
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: any) => {
      if (res) {
        this.diagnosisForm.patchValue({ present: true });
        this.existingDiagnosis.push({ uuid: res.uuid, ...this.diagnosisForm.value });
        // this.diagnosisForm.reset();
        this.getTreatmentPlan(res.value);
      }
    });
  }

  deleteDiagnosis(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe((res: any) => {
      this.existingDiagnosis.splice(index, 1);
    });
  }

  toggleNote() {
    this.addMoreNote = !this.addMoreNote;
    this.addNoteForm.reset();
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

  addNote() {
    if (this.addNoteForm.invalid) {
      this.toastr.warning("Please enter note text to add", "Invalid note");
      return;
    }
    if (this.notes.find((o: any) => o.value == this.addNoteForm.value.note)) {
      this.toastr.warning("Note already added, please add another note.", "Already Added");
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptNote,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addNoteForm.value.note,
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: any) => {
      this.notes.push({ uuid: res.uuid, value: this.addNoteForm.value.note });
      this.addNoteForm.reset();
    });
  }

  deleteNote(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe((res: any) => {
      this.notes.splice(index, 1);
    });
  }

  toggleMedicine() {
    this.addMoreMedicine = !this.addMoreMedicine;
    this.addMedicineForm.reset();
  }

  toggleAdditionalInstruction() {
    this.addMoreAdditionalInstruction = !this.addMoreAdditionalInstruction;
    this.addAdditionalInstructionForm.reset();
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

  addMedicine() {
    if (this.addMedicineForm.invalid) {
      return;
    }
    if (this.medicines.find((o: any) => o.drug == this.addMedicineForm.value.drug)) {
      this.toastr.warning("Drug already added, please add another drug.", "Already Added");
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptMed,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: `${this.addMedicineForm.value.drug}:${this.addMedicineForm.value.strength}:${this.addMedicineForm.value.days}:${this.addMedicineForm.value.timing}:${this.addMedicineForm.value.remark}`,
      encounter: this.visitNotePresent.uuid
    }).subscribe(response => {
      this.medicines.push({ ...this.addMedicineForm.value, uuid: response.uuid });
      this.addMedicineForm.reset();
    });
  }

  addAdditionalInstruction() {
    if (this.addAdditionalInstructionForm.invalid) {
      return;
    }
    if (this.additionalInstructions.find((o: any) => o.value == this.addAdditionalInstructionForm.value.note)) {
      this.toastr.warning("Additional instruction already added, please add another instruction.", "Already Added");
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptMed,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addAdditionalInstructionForm.value.note,
      encounter: this.visitNotePresent.uuid
    }).subscribe(response => {
      this.additionalInstructions.push({ uuid: response.uuid, value: this.addAdditionalInstructionForm.value.note });
      this.addAdditionalInstructionForm.reset();
    });
  }

  deleteMedicine(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.medicines.splice(index, 1);
    });
  }

  deleteAdditionalInstruction(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe((res) => {
      this.additionalInstructions.splice(index, 1);
    });
  }

  getAdvicesList() {
    const adviceUuid = '0308000d-77a2-46e0-a6fa-a8c1dcbc3141';
    this.diagnosisService.concept(adviceUuid).subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.advicesList.push(ans.display);
      });
    });
  }

  toggleAdvice() {
    this.addMoreAdvice = !this.addMoreAdvice;
    this.addAdviceForm.reset();
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

  addAdvice() {
    if (this.addAdviceForm.invalid) {
      return;
    }
    if (this.advices.find((o: any) => o.value == this.addAdviceForm.value.advice)) {
      this.toastr.warning("Advice already added, please add another advice.", "Already Added");
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptAdvice,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addAdviceForm.value.advice,
      encounter: this.visitNotePresent.uuid,
    }).subscribe(response => {
      this.advices.push({ uuid: response.uuid, value: this.addAdviceForm.value.advice });
      this.addAdviceForm.reset();
    });
  }

  deleteAdvice(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.advices.splice(index, 1);
    });
  }

  getTestsList() {
    const testUuid = '98c5881f-b214-4597-83d4-509666e9a7c9';
    this.diagnosisService.concept(testUuid).subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.testsList.push(ans.display);
      });
    });
  }

  toggleTest() {
    this.addMoreTest = !this.addMoreTest;
    this.addTestForm.reset();
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

  addTest() {
    if (this.addTestForm.invalid) {
      return;
    }
    if (this.tests.find((o: any) => o.value == this.addTestForm.value.test)) {
      this.toastr.warning("Test already added, please add another test.", "Already Added");
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptTest,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addTestForm.value.test,
      encounter: this.visitNotePresent.uuid,
    }).subscribe(response => {
      this.tests.push({ uuid: response.uuid, value: this.addTestForm.value.test });
      this.addTestForm.reset();
    });
  }

  deleteTest(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.tests.splice(index, 1);
    });
  }

  toggleReferral() {
    this.addMoreReferral = !this.addMoreReferral;
    this.addReferralForm.reset();
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

  addReferral() {
    if (this.addReferralForm.invalid) {
      return;
    }
    if (this.referrals.find((o: any) => o.speciality == this.addReferralForm.value.speciality)) {
      this.toastr.warning("Referral already added, please add another referral.", "Already Added");
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptReferral,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: `${this.addReferralForm.value.speciality}:${this.addReferralForm.value.remark}`,
      encounter: this.visitNotePresent.uuid,
    }).subscribe(response => {
      this.referrals.push({ uuid: response.uuid, speciality: this.addReferralForm.value.speciality, remark: this.addReferralForm.value.remark });
      this.addReferralForm.reset();
    });
  }

  deleteReferral(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.referrals.splice(index, 1);
    });
  }

  getHours(returnAll = true, date?: any) {
    const hours = Array.from(
      {
        length: 21,
      },
      (_, hour) =>
        moment({
          hour,
          minutes: 0,
        }).format("LT")
    );
    hours.splice(0, 9);
    if (this.isToday(date) && !returnAll) {
      const hrs = hours.filter((h) => moment(h, "LT").isAfter(moment()));
      return hrs;
    } else {
      return hours;
    }
  }

  isToday(date: any) {
    const start = moment().startOf("day");
    const end = moment().endOf("day");
    return (
      moment().startOf("day").isSame(moment(date)) ||
      moment(date).isBetween(start, end)
    );
  }

  checkIfFollowUpPresent() {
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptFollow).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          let followUpDate = (obs.value.includes('Time:')) ? moment(obs.value.split(', Time: ')[0]).format('YYYY-MM-DD') : moment(obs.value.split(', Remark: ')[0]).format('YYYY-MM-DD');
          let followUpTime = (obs.value.includes('Time:')) ? obs.value.split(', Time: ')[1].split(', Remark: ')[0] : null;
          let followUpReason = (obs.value.split(', Remark: ')[1]) ? obs.value.split(', Remark: ')[1] : null;
          this.followUpForm.patchValue({
            present: true,
            wantFollowUp: 'Yes',
            followUpDate,
            followUpTime,
            followUpReason,
            uuid: obs.uuid
          });
        }
      });
    });
  }

  saveFollowUp() {
    if (this.followUpForm.invalid || !this.isVisitNoteProvider) {
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptFollow,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: (this.followUpForm.value.followUpReason) ? `${moment(this.followUpForm.value.followUpDate).format('YYYY-MM-DD')}, Time: ${this.followUpForm.value.followUpTime}, Remark: ${this.followUpForm.value.followUpReason}` : `${moment(this.followUpForm.value.followUpDate).format('YYYY-MM-DD')}, Time: ${this.followUpForm.value.followUpTime}`,
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: any) => {
      if (res) {
        this.followUpForm.patchValue({ present: true, uuid: res.uuid });
      }
    });
  }

  deleteFollowUp() {
    this.diagnosisService.deleteObs(this.followUpForm.value.uuid).subscribe(() => {
      this.followUpForm.patchValue({ present: false, uuid: null, wantFollowUp: 'No', followUpDate: null, followUpTime: null, followUpReason: null });
    });
  }

  sharePrescription() {
    this.coreService.openSharePrescriptionConfirmModal().subscribe((res: any) => {
      if (res) {
        if (this.isVisitNoteProvider) {
          if (this.provider.attributes.length) {
            if (navigator.onLine) {
              if (!this.visitCompleted) {
                this.encounterService.postEncounter({
                  patient: this.visit.patient.uuid,
                  encounterType: "bd1fbfaa-f5fb-4ebd-b75c-564506fc309e", //visit complete encounter type uuid
                  encounterProviders: [
                    {
                      provider: this.provider.uuid,
                      encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03", // Doctor encounter role
                    },
                  ],
                  visit: this.visit.uuid,
                  encounterDatetime: new Date(Date.now() - 30000),
                  obs: [
                    {
                      concept: "7a9cb7bc-9ab9-4ff0-ae82-7a1bd2cca93e", // Doctor details concept uuid
                      value: JSON.stringify(this.getDoctorDetails()),
                    },
                  ]
                }).subscribe((post) => {
                  this.visitCompleted = true;
                  this.linkSvc.shortUrl(`/i/${this.visit.uuid}`).subscribe({
                    next: (res: any) => {
                      const link = res.data.hash;
                      this.visitService.postAttribute(
                        this.visit.uuid,
                        {
                          attributeType: "1e02db7e-e117-4b16-9a1e-6e583c3994da",/** Visit Attribute Type for Prescription Link */
                          value: `/i/${link}`,
                        }).subscribe();

                      this.coreService.openSharePrescriptionSuccessModal().subscribe((result: any) => {
                        if (result == 'view') {
                          // Open visit summary modal here....
                          this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                        } else if (result == 'dashboard') {
                          this.router.navigate(['/dashboard']);
                        }
                      });
                    },
                    error: (err) => {
                      this.toastr.error(err.message);
                      this.coreService.openSharePrescriptionSuccessModal().subscribe((result: any) => {
                        if (result == 'view') {
                          // Open visit summary modal here....
                          this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                        } else if (result == 'dashboard') {
                          this.router.navigate(['/dashboard']);
                        }
                      });
                    }
                  })
                });
              } else {
                this.coreService.openSharePrescriptionSuccessModal().subscribe((result: any) => {
                  if (result == 'view') {
                    // Open visit summary modal here....
                    this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                  } else if (result == 'dashboard') {
                    this.router.navigate(['/dashboard']);
                  }
                });
              }
            } else {
              this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription due to poor network connection. Please try again or come back later', confirmBtnText: 'Try again' }).subscribe((c: any) => {
                if (c) {

                }
              });
            }

          } else {
            this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription since your profile is not complete.', confirmBtnText: 'Go to profile' }).subscribe((c: any) => {
              if (c) {
                this.router.navigate(['/dashboard/profile']);
              }
            });
          }
        } else {
          this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription since this visit already in progress with another doctor.', confirmBtnText: 'Go to dashboard' }).subscribe((c: any) => {
            if (c) {
              this.router.navigate(['/dashboard']);
            }
          });
        }
      }
    });
  }

  getDoctorDetails() {
    let d: any = {};
    let attrs: string[] = [
      'qualification',
      'fontOfSign',
      'whatsapp',
      'registrationNumber',
      'consultationLanguage',
      'typeOfProfession',
      'address',
      'workExperience',
      'researchExperience',
      'textOfSign',
      'specialization',
      'phoneNumber',
      'countryCode',
      'emailId',
      'workExperienceDetails',
      'signatureType',
      'signature'
    ];
    d.name = this.provider.person.display;
    d.uuid = this.provider.uuid;
    attrs.forEach((attr: any) => {
      this.provider.attributes.forEach((pattr: any) => {
        if (pattr.attributeType.display == attr && !pattr.voided) {
          d[attr] = pattr.value;
          return;
        }
      });
    });
    return d;
  }

  getPastVisitHistory() {
    this.pastVisits = [];
    this.visitService.recentVisits(this.visit.patient.uuid).subscribe((res: any) => {
      let visits = res.results;
      if (visits.length > 1) {
        visits.forEach((visit: any) => {
          if (visit.uuid !== this.visit.uuid) {
            this.visitService.fetchVisitDetails(visit.uuid).subscribe((visitdetail: any) => {
              visitdetail.created_on = visitdetail.startDatetime;
              visitdetail.cheif_complaint = this.getCheifComplaint(visitdetail);
              visitdetail.encounters.forEach((encounter: any) => {
                if (encounter.encounterType.display == 'Visit Complete') {
                  visitdetail.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
                  encounter.obs.forEach((o: any) => {
                    if (o.concept.display == 'Doctor details') {
                      visitdetail.doctor = JSON.parse(o.value);
                    }
                  });
                  encounter.encounterProviders.forEach((p: any) => {
                    visitdetail.doctor.gender = p.provider.person.gender;
                    visitdetail.doctor.person_uuid = p.provider.person.uuid;
                  });
                }
              });
              this.pastVisits.push(visitdetail);
              this.dataSource = new MatTableDataSource(this.pastVisits);
            });
          }
        });
      }
    });
  }

  getCheifComplaint(visit: any) {
    let recent: any = [];
    const encounters = visit.encounters;
    encounters.forEach(encounter => {
      const display = encounter.display;
      if (display.match('ADULTINITIAL') !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.display.match('CURRENT COMPLAINT') !== null) {
            const currentComplaint = currentObs.display.split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match('Associated symptoms')) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

  openVisitSummaryModal(uuid: string) {
    this.coreService.openVisitSummaryModal({ uuid });
  }

  openVisitPrescriptionModal(uuid: string) {
    this.coreService.openVisitPrescriptionModal({ uuid });
  }

  getDDx() {
    if (this.currentComplaint && this.username == 'doctorai') {
      // this.coreService.openConfirmationDialog({ confirmationMsg: "Do you want to proceed?", cancelBtnText: "No", confirmBtnText: "Yes" }).afterClosed().subscribe(response => {
      //   if (response) {
      let vital = '';
      let ckr = '';
      let phyEx = '';
      let medHy = '';

      for (let v = 0; v < this.vitalObs.length; v++) {
        vital += `${this.vitalObs[v].concept.display} : ${this.vitalObs[v].value}\n`;
      }

      for (let c = 0; c < this.checkUpReasonData.length; c++) {
        ckr += `${this.checkUpReasonData[c].title}\n`;
        for (let d = 0; d < this.checkUpReasonData[c].data.length; d++) {
          ckr += `${this.checkUpReasonData[c].data[d].key} : ${this.checkUpReasonData[c].data[d].value ? this.checkUpReasonData[c].data[d].value : ''}\n`
        }
      }

      for (let p = 0; p < this.physicalExaminationData.length; p++) {
        phyEx += `${this.physicalExaminationData[p].title}\n`;
        if (this.physicalExaminationData[p].title != 'Abdomen') {
          for (let d = 0; d < this.physicalExaminationData[p].data.length; d++) {
            phyEx += `${this.physicalExaminationData[p].data[d].key} : ${this.physicalExaminationData[p].data[d].value ? this.physicalExaminationData[p].data[d].value : 'None'}\n`
          }
        }
        if (this.physicalExaminationData[p].title == 'Abdomen') {
          for (let d = 0; d < this.physicalExaminationData[p].data.length; d++) {
            phyEx += `${this.physicalExaminationData[p].data[d].key}\n`
          }
        }
      }

      for (let c = 0; c < this.patientHistoryData.length; c++) {
        medHy += `${this.patientHistoryData[c].title}\n`;
        for (let d = 0; d < this.patientHistoryData[c].data.length; d++) {
          medHy += `${this.patientHistoryData[c].data[d].key} : ${this.patientHistoryData[c].data[d].value ? this.patientHistoryData[c].data[d].value : 'None'}\n`
        }
      }

      this.visitService.chatGPTCompletionDDx(`Gender: ${this.patient?.person.gender == 'M' ? 'Male' : 'Female'}\nAge: ${this.patient?.person.birthdate ? this.getAge(this.patient?.person.birthdate) : this.patient?.person.age}\n\nVitals:\n${vital}\nChief Complaint\n${this.cheifComplaints.toString()}\n\n${ckr}Physical Examination\n${phyEx}Medical History\n\n${medHy}`, this.ddxForm.value.inputtype, this.ddxForm.value.customInput).subscribe((res: any) => {
        this.ddx = {
          maxCols: 1,
          data: [],
          model: null
        };
        let maxCol = 1;
        const rows = res?.data.output.choices[0]?.message.content.split('\n');
        rows.forEach(r => {
          const cols = r.split('|');
          if (cols.length > maxCol) maxCol = cols.length;
          this.ddx.data.push(cols);
        });
        this.ddx.maxCols = maxCol;
        this.ddx.model = res?.data.model;
        console.log(this.ddx);
        this.encounterService.postEncounter({
          patient: this.visit.patient.uuid,
          encounterType: "850cb3e8-9f8e-4c81-a1f9-c72395ae399b", //differential diagnosis encounter type uuid
          encounterProviders: [
            {
              provider: this.provider.uuid,
              encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03", // Doctor encounter role
            },
          ],
          visit: this.visit.uuid,
          encounterDatetime: new Date(Date.now() - 30000),
          obs: [
            {
              concept: "bc48889e-b461-4e5e-98d1-31eb9dd6160e", // ChatGPT DDx concept uuid
              value: res?.data.output.choices[0]?.message.content,
              comment: res?.data.model
            },
          ]
        }).subscribe((post) => {
          console.log('DDx pushed to the observation....');
          this.ddxPresent = true;
        });
      });
      // }
      // });
    }
  }

  getDiagnosisSuggestions() {
    if (this.currentComplaint) {
      let vital = '';
      let ckr = '';
      let phyEx = '';
      let medHy = '';

      for (let v = 0; v < this.vitalObs.length; v++) {
        vital += `${this.vitalObs[v].concept.display} : ${this.vitalObs[v].value}\n`;
      }

      for (let c = 0; c < this.checkUpReasonData.length; c++) {
        ckr += `${this.checkUpReasonData[c].title}\n`;
        for (let d = 0; d < this.checkUpReasonData[c].data.length; d++) {
          ckr += `${this.checkUpReasonData[c].data[d].key} : ${this.checkUpReasonData[c].data[d].value ? this.checkUpReasonData[c].data[d].value : ''}\n`
        }
      }

      for (let p = 0; p < this.physicalExaminationData.length; p++) {
        phyEx += `${this.physicalExaminationData[p].title}\n`;
        if (this.physicalExaminationData[p].title != 'Abdomen') {
          for (let d = 0; d < this.physicalExaminationData[p].data.length; d++) {
            phyEx += `${this.physicalExaminationData[p].data[d].key} : ${this.physicalExaminationData[p].data[d].value ? this.physicalExaminationData[p].data[d].value : 'None'}\n`
          }
        }
        if (this.physicalExaminationData[p].title == 'Abdomen') {
          for (let d = 0; d < this.physicalExaminationData[p].data.length; d++) {
            phyEx += `${this.physicalExaminationData[p].data[d].key}\n`
          }
        }
      }

      for (let c = 0; c < this.patientHistoryData.length; c++) {
        medHy += `${this.patientHistoryData[c].title}\n`;
        for (let d = 0; d < this.patientHistoryData[c].data.length; d++) {
          medHy += `${this.patientHistoryData[c].data[d].key} : ${this.patientHistoryData[c].data[d].value ? this.patientHistoryData[c].data[d].value : 'None'}\n`
        }
      }

      this.visitService.getDiagnosisSuggestions(
        `Patient Gender: ${this.patient?.person.gender == 'M' ? 'Male' : 'Female'}\nPatient Age: ${this.patient?.person.birthdate ? this.getAge(this.patient?.person.birthdate) : this.patient?.person.age}\n\nPatient Vitals:\n${vital}\nPatient Chief Complaint\n${this.cheifComplaints.toString()}\n\n${ckr}Patient Physical Examination\n${phyEx}Patient Medical History\n\n${medHy}`
      ).subscribe((res: any) => {
        try {
          // const result = (res?.data.choices[0]?.message.content.trim()).match(/```json((.|[\n\r])*)```/);
          // if (result) {
            // this.diagnosisSuggestions = JSON.parse(result[0].replace('```json','').replace('``json','').replace('```','').replace('``','').trim()).diagnosis;
            this.diagnosisSuggestions = res?.data.choices[0]?.message.content.split('\n');
            this.encounterService.postEncounter({
              patient: this.visit.patient.uuid,
              encounterType: "0a1863c0-5747-43ff-b125-45dd1e7ab6dd", //AI diagnosis and treatment plan encounter type uuid
              encounterProviders: [
                {
                  provider: this.provider.uuid,
                  encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03", // Doctor encounter role
                },
              ],
              visit: this.visit.uuid,
              encounterDatetime: new Date(Date.now() - 30000),
              obs: [
                {
                  concept: this.conceptAiDiagnosisSuggestions, // AI Diagnosis concept uuid
                  value: JSON.stringify(res),
                  comment: res?.data.model
                },
              ]
            }).subscribe((post) => {
              this.aiDiagnosisPresent = post;
              this.diagnosisSuggestionsObsUuid = post?.obs[0].uuid;
            });
          // } else {
          //   this.getDiagnosisSuggestions();
          // }
        } catch (error: any) {
          this.getDiagnosisSuggestions();          
        }
      }, (err: any) => {
        this.getDiagnosisSuggestions();
      });
    }
  }

  viewDiagnosisDetail(data: any) {
    this.coreService.openDiagnosisDetailModal(data).subscribe(res => {});
  }

  updateAIDiagnosis() {
    if (this.patientInteractionForm.invalid) {
      return;
    }
    if (this.currentComplaint) {
      let vital = '';
      let ckr = '';
      let phyEx = '';
      let medHy = '';

      for (let v = 0; v < this.vitalObs.length; v++) {
        vital += `${this.vitalObs[v].concept.display} : ${this.vitalObs[v].value}\n`;
      }

      for (let c = 0; c < this.checkUpReasonData.length; c++) {
        ckr += `${this.checkUpReasonData[c].title}\n`;
        for (let d = 0; d < this.checkUpReasonData[c].data.length; d++) {
          ckr += `${this.checkUpReasonData[c].data[d].key} : ${this.checkUpReasonData[c].data[d].value ? this.checkUpReasonData[c].data[d].value : ''}\n`
        }
      }

      for (let p = 0; p < this.physicalExaminationData.length; p++) {
        phyEx += `${this.physicalExaminationData[p].title}\n`;
        if (this.physicalExaminationData[p].title != 'Abdomen') {
          for (let d = 0; d < this.physicalExaminationData[p].data.length; d++) {
            phyEx += `${this.physicalExaminationData[p].data[d].key} : ${this.physicalExaminationData[p].data[d].value ? this.physicalExaminationData[p].data[d].value : 'None'}\n`
          }
        }
        if (this.physicalExaminationData[p].title == 'Abdomen') {
          for (let d = 0; d < this.physicalExaminationData[p].data.length; d++) {
            phyEx += `${this.physicalExaminationData[p].data[d].key}\n`
          }
        }
      }

      for (let c = 0; c < this.patientHistoryData.length; c++) {
        medHy += `${this.patientHistoryData[c].title}\n`;
        for (let d = 0; d < this.patientHistoryData[c].data.length; d++) {
          medHy += `${this.patientHistoryData[c].data[d].key} : ${this.patientHistoryData[c].data[d].value ? this.patientHistoryData[c].data[d].value : 'None'}\n`
        }
      }
      this.visitService.getUpdatedDiagnosisSuggestions(
        `Patient Gender: ${this.patient?.person.gender == 'M' ? 'Male' : 'Female'}\nPatient Age: ${this.patient?.person.birthdate ? this.getAge(this.patient?.person.birthdate) : this.patient?.person.age}\n\nPatient Vitals:\n${vital}\nPatient Chief Complaint\n${this.cheifComplaints.toString()}\n\n${ckr}Patient Physical Examination\n${phyEx}Patient Medical History\n\n${medHy}`,
        this.patientInteractionForm.value.chiefComplaintNotes
      ).subscribe((res: any) => {
        try {
          // const result = (res?.data.choices[0]?.message.content.trim()).match(/```json((.|[\n\r])*)```/);
          // if (result) {
            // this.diagnosisSuggestions = JSON.parse(result[0].replace('```json','').replace('``json','').replace('```','').replace('``','').trim()).diagnosis;
            this.diagnosisSuggestions = res?.data.choices[0]?.message.content.split('\n');
            // Update AI DIAGNOSIS SUGGESTIONS observation
            this.encounterService.updateObs({
              value: JSON.stringify(res),
              comment: res.data?.model
            }, this.diagnosisSuggestionsObsUuid).subscribe(response => {});
          // } else {
          //   this.updateAIDiagnosis();
          // }
        } catch (error: any) {
          this.updateAIDiagnosis();
        }
      }, (err: any) => {
        this.updateAIDiagnosis();
      });
    }
  }

  getTreatmentPlan(finalDiagnosis: string) {
    if (this.currentComplaint) {
      let vital = '';
      let ckr = '';
      let phyEx = '';
      let medHy = '';

      for (let v = 0; v < this.vitalObs.length; v++) {
        vital += `${this.vitalObs[v].concept.display} : ${this.vitalObs[v].value}\n`;
      }

      for (let c = 0; c < this.checkUpReasonData.length; c++) {
        ckr += `${this.checkUpReasonData[c].title}\n`;
        for (let d = 0; d < this.checkUpReasonData[c].data.length; d++) {
          ckr += `${this.checkUpReasonData[c].data[d].key} : ${this.checkUpReasonData[c].data[d].value ? this.checkUpReasonData[c].data[d].value : ''}\n`
        }
      }

      for (let p = 0; p < this.physicalExaminationData.length; p++) {
        phyEx += `${this.physicalExaminationData[p].title}\n`;
        if (this.physicalExaminationData[p].title != 'Abdomen') {
          for (let d = 0; d < this.physicalExaminationData[p].data.length; d++) {
            phyEx += `${this.physicalExaminationData[p].data[d].key} : ${this.physicalExaminationData[p].data[d].value ? this.physicalExaminationData[p].data[d].value : 'None'}\n`
          }
        }
        if (this.physicalExaminationData[p].title == 'Abdomen') {
          for (let d = 0; d < this.physicalExaminationData[p].data.length; d++) {
            phyEx += `${this.physicalExaminationData[p].data[d].key}\n`
          }
        }
      }

      for (let c = 0; c < this.patientHistoryData.length; c++) {
        medHy += `${this.patientHistoryData[c].title}\n`;
        for (let d = 0; d < this.patientHistoryData[c].data.length; d++) {
          medHy += `${this.patientHistoryData[c].data[d].key} : ${this.patientHistoryData[c].data[d].value ? this.patientHistoryData[c].data[d].value : 'None'}\n`
        }
      }

      this.visitService.getTreatmentPlan(
        `Patient Gender: ${this.patient?.person.gender == 'M' ? 'Male' : 'Female'}\nPatient Age: ${this.patient?.person.birthdate ? this.getAge(this.patient?.person.birthdate) : this.patient?.person.age}\n\nPatient Vitals:\n${vital}\nPatient Chief Complaint\n${this.cheifComplaints.toString()}\n\n${ckr}Patient Physical Examination\n${phyEx}Patient Medical History\n\n${medHy}`,
        finalDiagnosis
      ).subscribe((res: any) => {
        try {
          // const result = (res?.data.choices[0]?.message.content.trim()).match(/```json((.|[\n\r])*)```/);
          const result = res?.data?.choices[0]?.message?.content?.trim();
          if (result) {
            this.treatmentPlan = JSON.parse(result);
            this.encounterService.postObs({
              concept: this.conceptAiTreatmentPlan,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: JSON.stringify(res),
              comment: res?.data.model,
              encounter: this.aiDiagnosisPresent.uuid
            }).subscribe((obs) => {
              this.getVisit(this.visit.uuid);
            });
          } else {
            console.log('Not a match');
            this.getTreatmentPlan(finalDiagnosis);
          }
        } catch (error: any) {
          console.log('Not a valid json');
          this.getTreatmentPlan(finalDiagnosis);
        }
      }, (err: any) => {
        console.log('Api error');
        this.getTreatmentPlan(finalDiagnosis);
      });
    }
  }

  ngOnDestroy(): void {
    localStorage.removeItem('patientVisitProvider');
  }

}
