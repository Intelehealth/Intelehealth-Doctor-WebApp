import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/services/appointment.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { MatAccordion } from '@angular/material/expansion';
import medicines from '../../core/data/medicines';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { LinkService } from 'src/app/services/link.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatBoxComponent } from 'src/app/modal-components/chat-box/chat-box.component';
import { VideoCallComponent } from 'src/app/modal-components/video-call/video-call.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from 'src/app/services/translation.service';
import { deleteCacheData, getCacheData, setCacheData } from 'src/app/utils/utility-functions';
import { doctorDetails, languages, visitTypes, facility, specialization, refer_specialization, refer_prioritie, strength, days, timing, PICK_FORMATS, conceptIds } from 'src/config/constant';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';

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
  baseURL: string = environment.baseURL;
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
  selectedTabIndex = 0;
  facilities = facility.facilities
  specializations = specialization.specializations
  refer_specializations = refer_specialization.refer_specializations
  refer_priorities = refer_prioritie.refer_priorities
  diagnosis: any[] = [];
  strengthList: any[] = strength.strengthList
  daysList: any[] = days.daysList
  timingList: any[] = timing.timingList
  timeList: any = [];
  drugNameList: any = [];
  advicesList: any = [];
  testsList: any = [];

  visitEnded: any = false;
  visitCompleted: any = false;
  visitNotePresent: any = false;
  isVisitNoteProvider = false;
  referSpecialityForm: FormGroup;
  provider: any;
  showAll = true;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  addMoreNote = false;
  addMoreMedicine = false;
  addMoreAdditionalInstruction = false;
  addMoreAdvice = false;
  addMoreTest = false;
  addMoreReferral = false;
  addMoreDiagnosis = false;

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
  ddx: any;
  ddxPresent: any = false;

  additionalNotes = '';

  mainSearch = (text$: Observable<string>, list: any[]) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : list.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  
  search = (text$: Observable<string>) => this.mainSearch(text$, this.advicesList);
  search2 = (text$: Observable<string>) => this.mainSearch(text$, this.testsList);
  search3 = (text$: Observable<string>) => this.mainSearch(text$, this.drugNameList.map((val) => val.name));
  search4 = (text$: Observable<string>) => this.mainSearch(text$, this.strengthList.map((val) => val.name));
  search5 = (text$: Observable<string>) => this.mainSearch(text$, this.daysList.map((val) => val.name));
  search6 = (text$: Observable<string>) => this.mainSearch(text$, this.timingList.map((val) => val.name));

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
    private translateService: TranslateService,
    private translationService: TranslationService,
    private visitSummaryService: VisitSummaryHelperService) {
    this.referSpecialityForm = new FormGroup({
      refer: new FormControl(false, [Validators.required]),
      specialization: new FormControl(null, [Validators.required])
    });

    this.patientInteractionForm = new FormGroup({
      uuid: new FormControl(null),
      present: new FormControl(false, [Validators.required]),
      spoken: new FormControl(null, [Validators.required])
    });

    this.diagnosisForm = new FormGroup({
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
      facility: new FormControl(null, [Validators.required]),
      speciality: new FormControl(null, [Validators.required]),
      priority_refer: new FormControl('Elective', [Validators.required]),
      reason: new FormControl(null)
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
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    this.provider = getCacheData(true, doctorDetails.PROVIDER);
    medicines.forEach(med => {
      this.drugNameList.push({'id': med.id, 'name': this.translateService.instant(med.name)});
    });
    this.getVisit(id);
    this.formControlValueChanges();
    this.dSearchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(searchTextValue => {
      this.searchDiagnosis(searchTextValue);
    });
  }

  formControlValueChanges() {
    this.referSpecialityForm.get('refer').valueChanges.subscribe((val: boolean) => {
      if (val) {
        this.referSpecialityForm.get( doctorDetails.SPECIALIZATION).setValue(null);
      }
    });

    this.followUpForm.get('wantFollowUp').valueChanges.subscribe((val: any) => {
      if (val === 'Yes' || val === 'Да') {
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
        this.timeList = this.visitSummaryService.getHours(false, val);
      } else {
        this.timeList = [];
      }
    });
  }

  getVisit(uuid: string) {
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: any) => {
      if (visit) {
        this.visit = visit;
        if (this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.FLAGGED)) {
          this.visit['visitUploadTime'] = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.FLAGGED)['encounterDatetime'];
        } else if (this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.ADULTINITIAL) || this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.VITALS)) {
          this.visit['visitUploadTime'] = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.ADULTINITIAL)['encounterDatetime'];
        }
        this.checkVisitStatus(visit.encounters);
        this.visitService.patientInfo(visit.patient.uuid).subscribe((patient: any) => {
          if (patient) {
            this.patient = patient;
            this.clinicName = visit.location.display;
            // check if visit note exists for this visit
            this.visitNotePresent = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_NOTE);
            // check if visit complete exists for this visit
            this.visitCompleted = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_COMPLETE);
            // check if visit note provider and logged in provider are same
            this.visitEnded = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.PATIENT_EXIT_SURVEY) || visit.stopDatetime;
            // check if visit note exists for this visit
            this.ddxPresent = this.visitSummaryService.checkIfEncounterExists(visit.encounters, 'Differential Diagnosis');
            // check if visit note provider and logged in provider are same
            this.getPastVisitHistory();
            if (this.visitNotePresent) {
              this.visitNotePresent.encounterProviders.forEach((p: any) => {
                if (p.provider.uuid === this.provider.uuid) {
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
            }
            this.getAdditionalNote(visit.attributes);
            this.getAppointment(visit.uuid);
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
    }, (error: any) => {
      this.router.navigate(['/dashboard']);
    });
  }

  getVisitProvider(encounters: any) {
    encounters.forEach((encounter: any) => {
      if (encounter.display.match(visitTypes.ADULTINITIAL) !== null) {
        this.providerName = encounter.encounterProviders[0].provider.person.display;
        // store visit provider in local-Storage
        setCacheData(visitTypes.PATIENT_VISIT_PROVIDER, JSON.stringify(encounter.encounterProviders[0]));
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
        if (idf.identifierType.display === identifierType) {
          identifier = idf.identifier;
        }
      });
    }
    return identifier;
  }

  getVitalObs(encounters: any) {
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display === visitTypes.VITALS) {
        this.vitalObs = enc.obs;
      }
    });
  }

  getObsValue(obsName: string) {
    let val = null;
    this.vitalObs.forEach((obs: any) => {
      if (obs.concept.display === obsName) {
        val = obs.value;
      }
    });
    return val;
  }

  getCheckUpReason(encounters: any) {
    this.cheifComplaints = [];
    this.checkUpReasonData = [];
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: any) => {
          if (obs.concept.display === visitTypes.CURRENT_COMPLAINT) {
            this.currentComplaint = obs.value;
            const currentComplaint =  this.visitService.getData(obs)?.value.replace(new RegExp('►', 'g'), '').split('<b>');
            for (let i = 0; i < currentComplaint.length; i++) {
              if (currentComplaint[i] && currentComplaint[i].length > 1) {
                const obs1 = currentComplaint[i].split('<');
                if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  this.cheifComplaints.push(obs1[0]);
                }
                const splitByBr = currentComplaint[i].split('<br/>');
                if (splitByBr[0].includes(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  const obj1: any = {};
                  obj1.title = this.translateService.instant(visitTypes.ASSOCIATED_SYMPTOMS);
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

  getPhysicalExamination(encounters: any) {
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

  getMedicalHistory(encounters: any) {
    this.patientHistoryData = [];
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: any) => {
          if (obs.concept.display === visitTypes.MEDICAL_HISTORY) {
            const medicalHistory = this.visitService.getData(obs)?.value.split('<br/>');
            const obj1: any = {};
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
            const obj1: any = {};
            obj1.title = this.translateService.instant('Family history');
            obj1.data = [];
            for (let i = 0; i < familyHistory.length; i++) {
              if (familyHistory[i]) {
                if (familyHistory[i].includes(':')) {
                  const splitByColon = familyHistory[i].split(':');
                  const splitByComma = splitByColon[1].split(',');
                  obj1.data.push({ key: splitByComma[0].trim(), value: splitByComma[1] });
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
    this.diagnosisService.getObs(visit.patient.uuid, conceptIds.conceptPhysicalExamination).subscribe((response) => {
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
    this.diagnosisService.getObs(visit.patient.uuid, conceptIds.conceptAdditionlDocument).subscribe((response) => {
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
    this.selectedTabIndex = event;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  getAge(birthdate: string) {
    const years = moment().diff(birthdate, 'years');
    const months = moment().diff(birthdate, 'months');
    const days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} ${this.translateService.instant('years')}`;
    } else if (months > 1) {
      return `${months} ${this.translateService.instant('months')}`;
    } else {
      return `${days} ${this.translateService.instant('days')}`;
    }
  }

  getPersonAttributeValue(attrType: string) {
    let val = this.translateService.instant('NA');
    if (this.patient) {
      this.patient.person.attributes.forEach((attr: any) => {
        if (attrType === attr.attributeType.display) {
          val = attr.value;
        }
      });
    }
    return val;
  }

  getWhatsAppLink() {
    return this.visitService.getWhatsappLink(this.getPersonAttributeValue(doctorDetails.TELEPHONE_NUMBER), `Hello I'm calling for consultation`);
  }

  replaceWithStar(str: string) {
    const n = str.length;
    return str.replace(str.substring(0, n - 4), '*****');
  }

  checkVisitStatus(encounters: any) {
    if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.PATIENT_EXIT_SURVEY)) {
      this.visitStatus = visitTypes.ENDED_VISIT;
    } else if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.VISIT_COMPLETE)) {
      this.visitStatus = visitTypes.COMPLETED_VISIT;
    } else if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.VISIT_NOTE)) {
      this.visitStatus = visitTypes.IN_PROGRESS_VISIT;
    } else if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.FLAGGED)) {
      this.visit['uploadTime'] = this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.FLAGGED)['encounterDatetime'];
      this.visitStatus = visitTypes.PRIORITY_VISIT;
    } else if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL) || this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.VITALS)) {
      this.visit['uploadTime'] = this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL)['encounterDatetime'];
      this.visitStatus = visitTypes.AWAITING_VISIT;
    }
  }

  referSpecialist() {
    if (this.referSpecialityForm.invalid) {
      this.toastr.warning(this.translateService.instant('Please select specialization'), this.translateService.instant('Invalid!'));
      return;
    }
    if (this.visitNotePresent) {
      this.toastr.warning(this.translateService.instant('Can\'t refer, visit note already exists for this visit!'), this.translateService.instant('Can\'t refer'));
      return;
    }
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Are you sure to re-assign this visit to another doctor?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' })
      .afterClosed().subscribe((res: any) => {
        if (res) {
          const attr = this.visitSummaryService.checkIfAttributeExists(this.visit.attributes);
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
      encounterType: '8d5b27bc-c2cc-11de-8d13-0010c6dffd0f', // ADULTINITIAL encounter
      encounterProviders: [
        {
          provider: providerUuid,
          encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e04', // Doctor encounter role
        },
      ],
      visit: this.visit.uuid,
      encounterDatetime: timestamp,
    };
    this.encounterService.postEncounter(json).subscribe((response) => {
      if (response) {
        this.router.navigate(['/dashboard']);
        this.toastr.success(this.translateService.instant('Visit has been re-assigned to the another speciality doctor successfully.'), this.translateService.instant('Visit Re-assigned!'));
      }
    });
  }

  startChat() {
    if (this.dialogRef1) {
      this.dialogRef1.close();
      return;
    }
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
    }
    this.dialogRef2 = this.coreService.openVideoCallModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      connectToDrId: this.visitSummaryService.userId,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID'),
      initiator: 'dr',
      drPersonUuid: this.provider?.person.uuid
    });

    this.dialogRef2.afterClosed().subscribe((res: any) => {
      this.dialogRef2 = undefined;
    });
  }

  checkIfDateOldThanOneDay(data: any) {
    const hours = moment().diff(moment(data), 'hours');
    const minutes = moment().diff(moment(data), 'minutes');
    if (hours > 24) {
      return moment(data).format('DD MMM, YYYY');
    }
    if (hours < 1) {
      if (minutes < 0) { return `Due : ${moment(data).format('DD MMM, YYYY hh:mm A')}`; }
      return `${minutes} minutes ago`;
    }
    return `${hours} hrs ago`;
  }

  startVisitNote() {
    const json = {
      patient: this.visit.patient.uuid,
      encounterType: 'd7151f82-c1f3-4152-a605-2f9ea7414a79', // Visit Note encounter
      encounterProviders: [
        {
          provider: this.provider.uuid,
          encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03', // Doctor encounter role
        },
      ],
      visit: this.visit.uuid,
      encounterDatetime: new Date(Date.now() - 30000),
    };
    this.encounterService.postEncounter(json).subscribe((response) => {
      if (response) {
        this.getVisit(this.visit.uuid);
      }
    });
  }

  checkIfPatientInteractionPresent(attributes: any) {
    attributes.forEach((attr: any) => {
      if (attr.attributeType.display === visitTypes.PATIENT_INTERACTION) {
        this.patientInteractionForm.patchValue({ present: true, spoken: attr.value, uuid: attr.uuid });
      }
    });
  }

  getAdditionalNote(attributes: any) {
    attributes.forEach((attr: any) => {
      if (attr.attributeType.display === 'AdditionalNote') {
        this.additionalNotes = attr.value;
      }
    });
  }

  savePatientInteraction() {
    if (this.patientInteractionForm.invalid || !this.isVisitNoteProvider) {
      return;
    }
    this.visitService.postAttribute(this.visit.uuid, { attributeType: '6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc', value: this.patientInteractionForm.value.spoken })
      .subscribe((res: any) => {
        if (res) {
          this.patientInteractionForm.patchValue({ present: true, uuid: res.uuid });
        }
      });
  };

  isSharePrescribtionEnabled() {
    return ( 
      this.patientInteractionForm.value.present 
      &&   this.existingDiagnosis.length > 0
      &&  this.followUpForm.value.present
    )
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
    this.existingDiagnosis = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptDiagnosis).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.existingDiagnosis.push({
            diagnosisName: obs.value.split(':')[0].trim(),
            diagnosisType: obs.value.split(':')[1].split('&')[0].trim(),
            diagnosisStatus: obs.value.split(':')[1].split('&')[1].trim(),
            uuid: obs.uuid
          });
        }
      });
    });
  }

  onKeyUp(event: any) {
    this.dSearchSubject.next(event.term);
  }

  searchDiagnosis(val: any) {
    if (val) {
      if (val.length >= 3) {
        this.diagnosisService.getDiagnosisList(val).subscribe(response => {
          if (response && response.length) {
            const data = [];
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
  }

  saveDiagnosis() {
    if (this.diagnosisForm.invalid || !this.isVisitNoteProvider) {
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptDiagnosis,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: `${this.diagnosisForm.value.diagnosisName}:${this.diagnosisForm.value.diagnosisType} & ${this.diagnosisForm.value.diagnosisStatus}`,
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: any) => {
      if (res) {
        this.existingDiagnosis.push({ uuid: res.uuid, ...this.diagnosisForm.value });
        this.diagnosisForm.reset();
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
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptNote).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.notes.push(obs);
        }
      });
    });
  }

  addNote() {
    if (this.addNoteForm.invalid) {
      this.toastr.warning(this.translateService.instant('Please enter note text to add'), this.translateService.instant('Invalid note'));
      return;
    }
    if (this.notes.find((o: any) => o.value === this.addNoteForm.value.note)) {
      this.toastr.warning(this.translateService.instant('Note already added, please add another note.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptNote,
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
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptMed).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if (obs.value.includes(':')) {
            this.medicines.push({
              drug: obs.value?.split(':')[0],
              strength: obs.value?.split(':')[1],
              days: obs.value?.split(':')[2],
              timing: obs.value?.split(':')[3],
              remark: obs.value?.split(':')[4],
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
    if (this.medicines.find((o: any) => o.drug === this.addMedicineForm.value.drug)) {
      this.toastr.warning(this.translateService.instant('Drug already added, please add another drug.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptMed,
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
    if (this.additionalInstructions.find((o: any) => o.value === this.addAdditionalInstructionForm.value.note)) {
      this.toastr.warning(this.translateService.instant('Additional instruction already added, please add another instruction.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptMed,
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
        this.advicesList.push(this.translationService.getDropdownTranslation('advice', ans.display));
      });
    });
  }

  toggleAdvice() {
    this.addMoreAdvice = !this.addMoreAdvice;
    this.addAdviceForm.reset();
  }

  checkIfAdvicePresent() {
    this.advices = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptAdvice)
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
    if (this.advices.find((o: any) => o.value === this.addAdviceForm.value.advice)) {
      this.toastr.warning(this.translateService.instant('Advice already added, please add another advice.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptAdvice,
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
        this.testsList.push(this.translationService.getDropdownTranslation('tests', ans.display));
      });
    });
  }

  toggleTest() {
    this.addMoreTest = !this.addMoreTest;
    this.addTestForm.reset();
  }

  checkIfTestPresent() {
    this.tests = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptTest)
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
    if (this.tests.find((o: any) => o.value === this.addTestForm.value.test)) {
      this.toastr.warning(this.translateService.instant('Test already added, please add another test.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptTest,
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
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptReferral)
      .subscribe((response: any) => {
        response.results.forEach((obs: any) => {
          const obs_values = obs.value.split(':');
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            this.referrals.push({ uuid: obs.uuid, speciality: obs_values[0].trim(), facility: obs_values[1].trim(), priority: obs_values[2].trim(), reason: obs_values[3].trim() });
          }
        });
      });
  }

  addReferral() {
    if (this.addReferralForm.invalid) {
      return;
    }
    if (this.referrals.find((o: any) => o.speciality === this.addReferralForm.value.speciality)) {
      this.toastr.warning(this.translateService.instant('Referral already added, please add another referral.'), this.translateService.instant('Already Added'));
      return;
    }
    const refer_reason = this.addReferralForm.value.reason ? this.addReferralForm.value.reason : '';
    this.encounterService.postObs({
      concept: conceptIds.conceptReferral,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: `${this.addReferralForm.value.speciality}:${this.addReferralForm.value.facility}:${this.addReferralForm.value.priority_refer}:${refer_reason}`,
      encounter: this.visitNotePresent.uuid,
    }).subscribe(response => {
      this.referrals.push({ uuid: response.uuid, speciality: this.addReferralForm.value.speciality, facility: this.addReferralForm.value.facility, priority: this.addReferralForm.value.priority_refer, reason: refer_reason });
      this.addReferralForm.reset();
      this.addReferralForm.controls.priority_refer.setValue('Elective');
    });
  }

  deleteReferral(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.referrals.splice(index, 1);
    });
  }

  checkIfFollowUpPresent() {
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptFollow).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          const followUpDate = (obs.value.includes('Time:')) ? moment(obs.value.split(', Time: ')[0]).format('YYYY-MM-DD') : moment(obs.value.split(', Remark: ')[0]).format('YYYY-MM-DD');
          const followUpTime = (obs.value.includes('Time:')) ? obs.value.split(', Time: ')[1].split(', Remark: ')[0] : null;
          const followUpReason = (obs.value.split(', Remark: ')[1]) ? obs.value.split(', Remark: ')[1] : null;
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
      concept: conceptIds.conceptFollow,
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
                  encounterType: 'bd1fbfaa-f5fb-4ebd-b75c-564506fc309e', // visit complete encounter type uuid
                  encounterProviders: [
                    {
                      provider: this.provider.uuid,
                      encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03', // Doctor encounter role
                    },
                  ],
                  visit: this.visit.uuid,
                  encounterDatetime: new Date(Date.now() - 30000),
                  obs: [
                    {
                      concept: '7a9cb7bc-9ab9-4ff0-ae82-7a1bd2cca93e', // Doctor details concept uuid
                      value: JSON.stringify(this.getDoctorDetails()),
                    },
                  ]
                }).subscribe((post) => {
                  this.visitCompleted = true;
                  this.appointmentService.completeAppointment({visitUuid: this.visit.uuid}).subscribe();
                  this.linkSvc.shortUrl(`/i/${this.visit.uuid}`).subscribe({
                    next: (linkSvcRes: any) => {
                      const link = linkSvcRes.data.hash;
                      this.visitService.postAttribute(
                        this.visit.uuid,
                        {
                          attributeType: '1e02db7e-e117-4b16-9a1e-6e583c3994da', /** Visit Attribute Type for Prescription Link */
                          value: `/i/${link}`,
                        }).subscribe();
                      this.coreService.openSharePrescriptionSuccessModal().subscribe((result: any) => {
                        if (result === 'view') {
                          // Open visit summary modal here....
                          this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                        } else if (result === 'dashboard') {
                          this.router.navigate(['/dashboard']);
                        }
                      });
                    },
                    error: (err) => {
                      this.toastr.error(err.message);
                      this.coreService.openSharePrescriptionSuccessModal().subscribe((result: any) => {
                        if (result === 'view') {
                          // Open visit summary modal here....
                          this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                        } else if (result === 'dashboard') {
                          this.router.navigate(['/dashboard']);
                        }
                      });
                    }
                  });
                });
              } else {
                this.coreService.openSharePrescriptionSuccessModal().subscribe((result: any) => {
                  if (result === 'view') {
                    // Open visit summary modal here....
                    this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                  } else if (result === 'dashboard') {
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
    const d: any = {};
    const attrs: string[] = [
      doctorDetails.QUALIFICATION,
      doctorDetails.FONT_OF_SIGN,
      doctorDetails.WHATS_APP,
      doctorDetails.REGISTRATION_NUMBER,
      doctorDetails.CONSULTATION_LANGUAGE,
      doctorDetails.TYPE_OF_PROFESSION,
      doctorDetails.ADDRESS,
      doctorDetails.WORK_EXPERIENCE,
      doctorDetails.RESEARCH_EXPERIENCE,
      doctorDetails.TEXT_OF_SIGN,
      doctorDetails.SPECIALIZATION,
      doctorDetails.PHONE_NUMBER,
      doctorDetails.COUNTRY_CODE,
      doctorDetails.EMAIL_ID,
      doctorDetails.WORK_EXPERIENCE_DETAILS,
      doctorDetails.SIGNATURE_TYPE,
      doctorDetails.SIGNATURE
    ];
    d.name = this.provider.person.display;
    d.uuid = this.provider.uuid;
    attrs.forEach((attr: any) => {
      this.provider.attributes.forEach((pattr: any) => {
        if (pattr.attributeType.display === attr && !pattr.voided) {
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
      const visits = res.results;
      if (visits.length > 1) {
        visits.forEach((visit: any) => {
          if (visit.uuid !== this.visit.uuid) {
            this.visitService.fetchVisitDetails(visit.uuid).subscribe((visitdetail: any) => {
              visitdetail.created_on = visitdetail.startDatetime;
              visitdetail.cheif_complaint = this.visitSummaryService.getCheifComplaint(visitdetail);
              visitdetail.encounters.forEach((encounter: any) => {
                if (encounter.encounterType.display === visitTypes.VISIT_COMPLETE) {
                  visitdetail.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
                  encounter.obs.forEach((o: any) => {
                    if (o.concept.display === 'Doctor details') {
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

  openVisitSummaryModal(uuid: string) {
    this.coreService.openVisitSummaryModal({ uuid });
  }

  openVisitPrescriptionModal(uuid: string) {
    this.coreService.openVisitPrescriptionModal({ uuid });
  }

  ngOnDestroy(): void {
    deleteCacheData(visitTypes.PATIENT_VISIT_PROVIDER);
  }

}
