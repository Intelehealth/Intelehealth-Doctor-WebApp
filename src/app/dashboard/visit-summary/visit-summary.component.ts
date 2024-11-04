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
import { MindmapService } from 'src/app/services/mindmap.service';
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
import { calculateBMI, deleteCacheData, getCacheData, getFieldValueByLanguage, setCacheData } from 'src/app/utils/utility-functions';
import { doctorDetails, languages, visitTypes, facility, refer_specialization, refer_prioritie, strength, days, timing, PICK_FORMATS, conceptIds } from 'src/config/constant';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';
import { ApiResponseModel, DataItemModel, DiagnosisModel, DocImagesModel, EncounterModel, EncounterProviderModel, MedicineModel, ObsApiResponseModel, ObsModel, PatientHistoryModel, PatientIdentifierModel, PatientModel, PatientVisitSection, PatientVisitSummaryConfigModel, PersonAttributeModel, ProviderAttributeModel, ProviderModel, RecentVisitsApiResponseModel, ReferralModel, SpecializationModel, TestModel, VisitAttributeModel, VisitModel, VitalModel } from 'src/app/model/model';
import { AppConfigService } from 'src/app/services/app-config.service';
import { checkIsEnabled, VISIT_SECTIONS } from 'src/app/utils/visit-sections';
import { NgSelectComponent } from '@ng-select/ng-select';

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

  visit: VisitModel;
  patient: PatientModel;
  baseURL: string = environment.baseURL;
  visitAppointment: string;
  visitStatus: string;
  providerName: string;
  hwPhoneNo: string;
  clinicName: string;
  vitalObs: ObsModel[] = [];
  cheifComplaints: string[] = [];
  checkUpReasonData: PatientHistoryModel[] = [];
  physicalExaminationData: PatientHistoryModel[] = [];
  patientHistoryData: PatientHistoryModel[] = [];

  additionalDocs: DocImagesModel[] = [];
  eyeImages: DocImagesModel[] = [];
  notes: ObsModel[] = [];
  medicines: MedicineModel[] = [];
  existingDiagnosis: DiagnosisModel[] = [];
  advices: ObsModel[] = [];
  additionalInstructions: ObsModel[] = [];
  tests: TestModel[] = [];
  referrals: ReferralModel[] = [];
  pastVisits: VisitModel[] = [];
  minDate = new Date();
  selectedTabIndex = 0;
  facilities: DataItemModel[] = facility.facilities
  specializations: SpecializationModel[] = [];
  refer_specializations: DataItemModel[] = refer_specialization.refer_specializations
  refer_priorities: DataItemModel[] = refer_prioritie.refer_priorities;
  strengthList: DataItemModel[] = strength.strengthList
  daysList: DataItemModel[] = days.daysList
  timingList: DataItemModel[] = timing.timingList
  timeList: string[] = [];
  drugNameList: DataItemModel[] = [];
  advicesList: string[] = [];
  testsList: string[] = [];

  visitEnded: EncounterModel | string;
  visitCompleted: EncounterModel | boolean;
  visitNotePresent: EncounterModel;
  isVisitNoteProvider = false;
  referSpecialityForm: FormGroup;
  provider: ProviderModel;
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
  followUpDatetime: string;

  displayedColumns: string[] = ['action', 'created_on', 'consulted_by', 'cheif_complaint', 'summary', 'prescription', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();

  diagnosisSubject: BehaviorSubject<any>;
  diagnosis$: Observable<any>;
  private dSearchSubject: Subject<string> = new Subject();

  dialogRef1: MatDialogRef<ChatBoxComponent>;
  dialogRef2: MatDialogRef<VideoCallComponent>;
  currentComplaint: string;

  additionalNotes = '';
  isCalling: boolean = false;

  openChatFlag: boolean = false;


  patientRegFields: string[] = [];
  vitals: VitalModel[] = [];
  patientVisitSummary: PatientVisitSummaryConfigModel;
  pvsConfigs: PatientVisitSection[] = [];
  pvsConstant = VISIT_SECTIONS;

  hasChatEnabled: boolean = false;
  hasVideoEnabled: boolean = false;
  hasWebRTCEnabled: boolean = false;
  hasVitalsEnabled: boolean = false;
  hasPatientAddressEnabled: boolean = false;
  hasPatientOtherEnabled: boolean = false;

  collapsed: boolean = true;

  reasons = {
    'Completed': [
      { name: 'Call closed. No further action from TMH team' },
      { name: 'To Repeat after Radiology/Pathology review (chargeable)' },
      { name: 'To Send Protocol Letter (chargeable)' }
    ],
    'Reschedule/Repeat Internally': [
      { name: 'Could not connect or Poor Network' },
      { name: 'Other discipline doctor could not be available' },
      { name: 'Patient to share Reports/ Scan Images/Video of Investigations' },
      { name: 'Repeat call with another DMG/Discipline (Non Chargeable)' }
    ],
    'Close Call without Completion': [
      { name: 'Could not connect for attempts on 2 or more different days' },
      { name: 'Patient Not willing' },
      { name: 'Not found suitable for Tele-consult' },
      { name: 'Patient already visited the hospital' }
    ]
  };

  @ViewChild(NgSelectComponent) ngSelectComponent: NgSelectComponent;
  reasonsList: { name: string }[] = [];
  patientInteraction: PatientVisitSection[] = [];

  mainSearch = (text$: Observable<string>, list: string[]) =>
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
    private visitSummaryService: VisitSummaryHelperService,
    private mindmapService: MindmapService,
    public appConfigService: AppConfigService) {

    Object.keys(this.appConfigService.patient_registration).forEach(obj => {
      this.patientRegFields.push(...this.appConfigService.patient_registration[obj].filter((e: { is_enabled: any; }) => e.is_enabled).map((e: { name: any; }) => e.name));
    });

    this.vitals = [...this.appConfigService.patient_vitals];
    this.specializations = [...this.appConfigService.specialization];
    this.patientVisitSummary = { ...this.appConfigService.patient_visit_summary };
    this.openChatFlag = this.router.getCurrentNavigation()?.extras?.state?.openChat;

    this.referSpecialityForm = new FormGroup({
      refer: new FormControl(false, [Validators.required]),
      specialization: new FormControl(null, [Validators.required])
    });

    this.patientInteractionForm = new FormGroup({
      uuid: new FormControl(null),
      present: new FormControl(false, [Validators.required]),
      spoken: new FormControl(null, [Validators.required]),
      reason: new FormControl(null, [Validators.required]),
      callStatus: new FormControl(null, [Validators.required]),
    });

    if(this.appConfigService.patient_visit_summary.hw_interaction){
      this.patientInteractionForm.addControl('hwIntUuid', new FormControl(""));
      this.patientInteractionForm.addControl('hwPresent', new FormControl(false, [Validators.required]));
      this.patientInteractionForm.addControl('hwSpoken', new FormControl("", [Validators.required]));
      this.patientInteractionForm.addControl('comment', new FormControl("", [Validators.required]));
      this.patientInteractionForm.addControl('callStatus', new FormControl("", [Validators.required]));
      this.patientInteractionForm.addControl('reason', new FormControl("", [Validators.required]));
    }

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
      wantFollowUp: new FormControl([Validators.required]),
      followUpDate: new FormControl(null),
      followUpTime: new FormControl(null),
      followUpReason: new FormControl(null),
      uuid: new FormControl(null)
    });

    this.diagnosisSubject = new BehaviorSubject<any[]>([]);
    this.diagnosis$ = this.diagnosisSubject.asObservable();

    this.hasWebRTCEnabled = this.appConfigService?.webrtc_section;
    this.hasChatEnabled = this.appConfigService?.webrtc?.chat;
    this.hasVideoEnabled = this.appConfigService?.webrtc?.video_call;
    this.hasVitalsEnabled = this.appConfigService?.patient_vitals_section;
    this.hasPatientAddressEnabled = this.appConfigService?.patient_reg_address;
    this.hasPatientOtherEnabled = this.appConfigService?.patient_reg_other;

    this.pvsConfigs = this.appConfigService.patient_visit_sections;
    this.patientInteraction = this.appConfigService.patient_visit_sections;

  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    this.provider = getCacheData(true, doctorDetails.PROVIDER);
    medicines.forEach(med => {
      this.drugNameList.push({ 'id': med.id, 'name': this.translateService.instant(med.name) });
    });
    this.getVisit(id);
    this.formControlValueChanges();
    this.dSearchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(searchTextValue => {
      this.searchDiagnosis(searchTextValue);
    });
  }

  checkOpenChatBoxFlag() {
    if (this.openChatFlag && this.hasWebRTCEnabled && this.hasChatEnabled) {
      setTimeout(() => {
        this.startChat();
      }, 1000);
    }
  }

  /**
  * Subscribe to the form control value changes observables
  * @return {void}
  */
  formControlValueChanges(): void {
    this.referSpecialityForm.get('refer').valueChanges.subscribe((val: boolean) => {
      if (val) {
        this.referSpecialityForm.get(doctorDetails.SPECIALIZATION).setValue(null);
      }
    });

    this.followUpForm.get('wantFollowUp').valueChanges.subscribe((val: string) => {
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
    this.followUpForm.get('followUpDate').valueChanges.subscribe((val: string) => {
      if (val) {
        this.timeList = this.visitSummaryService.getHours(false, val);
      } else {
        this.timeList = [];
      }
    });
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @return {void}
  */
  getVisit(uuid: string): void {
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: VisitModel) => {
      if (visit) {
        this.visit = visit;
        if (this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.FLAGGED)) {
          this.visit['visitUploadTime'] = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.FLAGGED)['encounterDatetime'];
        } else if (this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.ADULTINITIAL) || this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.VITALS)) {
          this.visit['visitUploadTime'] = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.ADULTINITIAL)['encounterDatetime'];
        }
        this.checkVisitStatus(visit.encounters);
        this.visitService.patientInfo(visit.patient.uuid).subscribe((patient: PatientModel) => {
          if (patient) {
            this.patient = patient;
            this.clinicName = visit.location.display;

            if (this.appConfigService.abha_section) {
              // check if abha number / abha address exists for this patient
              this.getAbhaDetails(patient)
            }
            // check if visit note exists for this visit
            this.visitNotePresent = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_NOTE);
            // check if visit complete exists for this visit
            this.visitCompleted = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_COMPLETE);
            // check if Patient Exit Survey exists for this visit
            this.visitEnded = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.PATIENT_EXIT_SURVEY) || visit.stopDatetime;
            this.getPastVisitHistory();
            if (this.visitNotePresent) {
              this.visitNotePresent.encounterProviders.forEach((p: EncounterProviderModel) => {
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
            if (this.patientVisitSummary.notes_section) {
              this.getAdditionalNote(visit.attributes);
            }
            this.getAppointment(visit.uuid);
            this.getVisitProvider(visit.encounters);
            this.getVitalObs(visit.encounters);
            this.getCheckUpReason(visit.encounters);
            this.getPhysicalExamination(visit.encounters);
            this.getEyeImages(visit);
            this.getMedicalHistory(visit.encounters);
            if (this.patientVisitSummary.attachment_section) {
              this.getVisitAdditionalDocs(visit);
            }
          }
          this.checkOpenChatBoxFlag();
        });
      }
    }, (error) => {
      this.router.navigate(['/dashboard']);
    });
  }

  /**
  * Get visit provider details
  * @param {EncounterModel[]} encounters - Array of visit encounters
  * @return {void}
  */
  getVisitProvider(encounters: EncounterModel[]): void {
    encounters.forEach((encounter: EncounterModel) => {
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

  /**
  * Get appointment for the given visit
  * @param {string} visitId - Visit uuid
  * @return {void}
  */
  getAppointment(visitId: string): void {
    this.appointmentService.getAppointment(visitId).subscribe((res: ApiResponseModel) => {
      if (res) {
        this.visitAppointment = res?.data?.slotJsDate;
      }
    });
  }

  /**
  * Get patient identifier for given identifier type
  * @param {string} identifierType - Identifier type
  * @return {void}
  */
  getPatientIdentifier(identifierType: string): string {
    let identifier: string = '';
    if (this.patient) {
      this.patient.identifiers.forEach((idf: PatientIdentifierModel) => {
        if (idf.identifierType.display === identifierType) {
          identifier = idf.identifier;
        }
      });
    }
    return identifier;
  }

  /**
  * Get vital observations from the vital encounter
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getVitalObs(encounters: EncounterModel[]): void {
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display === visitTypes.VITALS) {
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
  getCheckUpReason(encounters: EncounterModel[]): void {
    this.cheifComplaints = [];
    this.checkUpReasonData = [];
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: ObsModel) => {
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
                  const obj1: PatientHistoryModel = {};
                  obj1.title = this.translateService.instant(visitTypes.ASSOCIATED_SYMPTOMS);
                  obj1.data = [];
                  for (let j = 1; j < splitByBr.length; j = j + 2) {
                    if (splitByBr[j].trim() && splitByBr[j].trim().length > 1) {
                      obj1.data.push({ key: splitByBr[j].replace('• ', '').replace(' -', ''), value: splitByBr[j + 1] });
                    }
                  }
                  this.checkUpReasonData.push(obj1);
                } else {
                  const obj1: PatientHistoryModel = {};
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
  getPhysicalExamination(encounters: EncounterModel[]): void {
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
  getMedicalHistory(encounters: EncounterModel[]): void {
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
                  splitByDot.forEach((element: string) => {
                    if (element.trim()) {
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
  getEyeImages(visit: VisitModel): void {
    this.eyeImages = [];
    this.diagnosisService.getObs(visit.patient.uuid, conceptIds.conceptPhysicalExamination).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value`, section: obs.comment };
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
  previewEyeImages(index: number, section: string): void {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.getImagesBySection(section) }).subscribe((res) => { });
  }

  /**
  * Get additional docs
  * @param {VisitModel} visit - Visit
  * @return {void}
  */
  getVisitAdditionalDocs(visit: VisitModel): void {
    this.additionalDocs = [];
    this.diagnosisService.getObs(visit.patient.uuid, conceptIds.conceptAdditionlDocument).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value`, section: obs.comment };
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
  previewDocImages(index: number): void {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.additionalDocs }).subscribe((res) => { });
  }

  /**
  * Callback for tab changed event
  * @param {number} event - Array of encounters
  * @return {void}
  */
  onTabChange(event: number): void {
    this.selectedTabIndex = event;
  }

  /**
  * Get age of patient from birthdate
  * @param {string} birthdate - Birthdate
  * @return {string} - Age
  */
  getAge(birthdate: string): string {
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

  /**
  * Get person attribute value for a given attribute type
  * @param {str'} attrType - Person attribute type
  * @return {any} - Value for a given attribute type
  */
  getPersonAttributeValue(attrType: string): any {
    let val = 'NA';
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
  * Get whatsapp link
  * @return {string} - Whatsapp link
  */
  getWhatsAppLink(): string {
    return this.visitService.getWhatsappLink(this.getPersonAttributeValue(doctorDetails.TELEPHONE_NUMBER), `Hello I'm calling for consultation`);
  }

  /**
  * Replcae the string charaters with *
  * @param {string} str - Original string
  * @return {string} - Modified string
  */
  replaceWithStar(str: string): string {
    const n = str.length;
    return str.replace(str.substring(0, n - 4), '*****');
  }

  /**
  * Check visit status
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  checkVisitStatus(encounters: EncounterModel[]): void {
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

  /**
  * Refer to specialist
  * @return {void}
  */
  referSpecialist(): void {
    if (this.referSpecialityForm.invalid) {
      this.toastr.warning(this.translateService.instant('Please select specialization'), this.translateService.instant('Invalid!'));
      return;
    }
    if (this.visitNotePresent) {
      this.toastr.warning(this.translateService.instant('Can\'t refer, visit note already exists for this visit!'), this.translateService.instant('Can\'t refer'));
      return;
    }
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Are you sure to re-assign this visit to another doctor?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' })
      .afterClosed().subscribe((res: boolean) => {
        if (res) {
          const attr = this.visitSummaryService.checkIfAttributeExists(this.visit.attributes);
          if (attr) {
            this.visitService.updateAttribute(this.visit.uuid, attr.uuid, { attributeType: attr.attributeType.uuid, value: this.referSpecialityForm.value.specialization }).subscribe((result: VisitAttributeModel) => {
              if (result) {
                this.updateEncounterForRefer();
              }
            });
          } else {
            this.visitService.postAttribute(this.visit.uuid, { attributeType: attr.attributeType.uuid, value: this.referSpecialityForm.value.specialization }).subscribe((result: VisitAttributeModel) => {
              if (result) {
                this.updateEncounterForRefer();
              }
            });
          }
        }
      });
  }

  /**
  * Refer visit to another speciality
  * @return {void}
  */
  updateEncounterForRefer(): void {
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

  /**
  * Start chat with HW/patient
  * @return {void}
  */
  startChat(): void {
    if (this.dialogRef1) {
      this.dialogRef1.close();
      this.isCalling = false;
      return;
    }
    this.isCalling = true;
    this.dialogRef1 = this.coreService.openChatBoxModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID')
    });

    this.dialogRef1.afterClosed().subscribe((res) => {
      this.dialogRef1 = undefined;
      this.isCalling = false;
    });
  }

  /**
  * Start video call with HW/patient
  * @return {void}
  */
  startCall(): void {
    if (this.dialogRef2) {
      this.dialogRef2.close();
      this.isCalling = false;
      return;
    }
    this.isCalling = true;
    this.dialogRef2 = this.coreService.openVideoCallModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      connectToDrId: this.visitSummaryService.userId,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID'),
      initiator: 'dr',
      drPersonUuid: this.provider?.person.uuid,
      patientAge: this.patient.person.age,
      patientGender: this.patient.person.gender
    });

    this.dialogRef2.afterClosed().subscribe((res) => {
      this.dialogRef2 = undefined;
      this.isCalling = false;
    });
  }

  /**
  * Check how old the date is from now
  * @param {string} data - Date in string format
  * @return {string} - Returns how old the date is from now
  */
  checkIfDateOldThanOneDay(data: string): string {
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

  /**
  * Start visit note
  * @return {void}
  */
  startVisitNote(): void {
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

  /**
  * Check if patient interaction visit attrubute present or not
  * @param {VisitAttributeModel[]} attributes - Array of visit attributes
  * @returns {void}
  */
  checkIfPatientInteractionPresent(attributes: VisitAttributeModel[]): void {
    attributes.forEach((attr: VisitAttributeModel) => {
      if (attr.attributeType.display === visitTypes.PATIENT_INTERACTION) {
        this.patientInteractionForm.patchValue({ present: true, spoken: attr.value, uuid: attr.uuid });
      }
      if (attr.attributeType.display === visitTypes.HW_INTERACTION) {
        this.patientInteractionForm.patchValue({ hwPresent: true, hwSpoken: attr.value, hwIntUuid: attr.uuid });
      }
    });
  }

  /**
  * Get additional notes from visit attributes
  * @param {VisitAttributeModel[]} attributes - Array of visit attributes
  * @returns {void}
  */
  getAdditionalNote(attributes: VisitAttributeModel[]): void {
    attributes.forEach((attr: VisitAttributeModel) => {
      if (attr.attributeType.display === 'AdditionalNote') {
        this.additionalNotes = attr.value;
      }
    });
  }

  /**
  * Save patient interaction visit attribute
  * @returns {void}
  */
  savePatientInteraction(): void {
    if (!this.isVisitNoteProvider) {
      return;
    }
    if(!this.patientInteractionForm.value.present && this.isSubSectionEnabled('patient_interaction','Patient')){
      const payload = {
        attributeType: "6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc",
        value: this.patientInteractionForm.value.callStatus?.trim().length > 0 ? `${this.patientInteractionForm.value.spoken}, ${this.translateService.instant("Call status")}: ${this.patientInteractionForm.value.callStatus}, ${this.translateService.instant("Reason")}: ${this.patientInteractionForm.value.reason}` :  this.patientInteractionForm.value.spoken,
      };

      this.visitService.postAttribute(this.visit.uuid, payload)
      .subscribe((res: VisitAttributeModel) => {
        if (res) {
          this.patientInteractionForm.patchValue({ present: true, uuid: res.uuid, spoken: res.value });
        }
      });
    }

    if(this.appConfigService?.patient_visit_summary?.hw_interaction){
      if(!this.patientInteractionForm.value.hwPresent && this.isSubSectionEnabled('patient_interaction','HW')){
        const payload = {
          attributeType: "c3e885bf-6c97-4d27-9171-a7e0c25450e9",
          value: this.patientInteractionForm.value.comment?.trim().length > 0 ? `${this.patientInteractionForm.value.hwSpoken}, ${this.translateService.instant("Comment")}: ${this.patientInteractionForm.value.comment}` : this.patientInteractionForm.value.hwSpoken,
        };
        this.visitService.postAttribute(this.visit.uuid, payload)
        .subscribe((res: VisitAttributeModel) => {
          if (res) {
            this.patientInteractionForm.patchValue({ hwPresent: true, hwIntUuid: res.uuid, hwSpoken: res.value });
          }
        });
      }
    }
  };

  /**
  * Delete patient interaction visit attribute
  * @returns {void}
  */
  deletePatientInteraction(): void {
    this.visitService.deleteAttribute(this.visit.uuid, this.patientInteractionForm.value.uuid).subscribe(() => {
      this.patientInteractionForm.patchValue({ present:false, spoken: null, uuid: null, callStatus: null, reason: null });
    });
  }

  /**
  * Delete HW interaction visit attribute
  * @returns {void}
  */
  deleteHWInteraction(): void {
    this.visitService.deleteAttribute(this.visit.uuid, this.patientInteractionForm.value.hwIntUuid).subscribe(() => {
      this.patientInteractionForm.patchValue({ hwPresent:false, hwSpoken: null, hwIntUuid: null, comment: "" });
    });
  }

  /**
  * Toggle diagnosis add form, show/hide add more diagnosis button
  * @returns {void}
  */
  toggleDiagnosis(): void {
    this.addMoreDiagnosis = !this.addMoreDiagnosis;
    this.diagnosisForm.reset();
  }

  /**
  * Get diagnosis for the visit
  * @returns {void}
  */
  checkIfDiagnosisPresent(): void {
    this.existingDiagnosis = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptDiagnosis).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
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

  /**
  * Callback for key up event diagnosis input
  * @returns {void}
  */
  onKeyUp(event: { term: string; }): void {
    this.dSearchSubject.next(event.term);
  }

  /**
  * Search disgnosis for a given value
  * @param {string} val - search value
  * @returns {void}
  */
  searchDiagnosis(val: string): void {
    if (val && val.length >= 3) {
      this.diagnosisService.getDiagnosisList(val).subscribe(response => {
        if (response.results && response.results.length) {
          const data = [];
          response.results.forEach((element: { display: any; }) => {
            if (element) {
              data.push({ name: element.display });
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

  /**
  * Save disgnosis for a given value
  * @returns {void}
  */
  saveDiagnosis(): void {
    if (this.diagnosisForm.invalid || !this.isVisitNoteProvider) {
      return;
    }
    if (this.existingDiagnosis.find(o => o.diagnosisName.toLocaleLowerCase() === this.diagnosisForm.value.diagnosisName.toLocaleLowerCase())) {
      this.toastr.warning(this.translateService.instant('Diagnosis Already Exist'), this.translateService.instant('Duplicate Diagnosis'));
      return;
    }
    const diagnosisName = this.diagnosisForm.value.diagnosisName?.replace(/:/g, ' ');
    this.encounterService.postObs({
      concept: conceptIds.conceptDiagnosis,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: `${diagnosisName}:${this.diagnosisForm.value.diagnosisType} & ${this.diagnosisForm.value.diagnosisStatus}`,
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: ObsModel) => {
      if (res) {
        this.existingDiagnosis.push({ uuid: res.uuid, ...this.diagnosisForm.value, diagnosisName: diagnosisName });
        this.diagnosisForm.reset();
      }
    });
  }

  /**
  * Delete disgnosis for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Diagnosis obs uuid
  * @returns {void}
  */
  deleteDiagnosis(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.existingDiagnosis.splice(index, 1);
    });
  }

  /**
  * Toggle notes add form, show/hide add more notes button
  * @returns {void}
  */
  toggleNote(): void {
    this.addMoreNote = !this.addMoreNote;
    this.addNoteForm.reset();
  }

  /**
  * Get notes for the visit
  * @returns {void}
  */
  checkIfNotePresent(): void {
    this.notes = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptNote).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.notes.push(obs);
        }
      });
    });
  }

  /**
  * Save note
  * @returns {void}
  */
  addNote(): void {
    if (this.addNoteForm.invalid) {
      this.toastr.warning(this.translateService.instant('Please enter note text to add'), this.translateService.instant('Invalid note'));
      return;
    }
    if (this.notes.find((o: ObsModel) => o.value === this.addNoteForm.value.note)) {
      this.toastr.warning(this.translateService.instant('Note already added, please add another note.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptNote,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addNoteForm.value.note,
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: ObsModel) => {
      this.notes.push({ uuid: res.uuid, value: this.addNoteForm.value.note });
      this.addNoteForm.reset();
    });
  }

  /**
  * Delete note for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Note obs uuid
  * @returns {void}
  */
  deleteNote(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.notes.splice(index, 1);
    });
  }

  /**
  * Toggle medicine add form, show/hide add more medicine button
  * @returns {void}
  */
  toggleMedicine(): void {
    this.addMoreMedicine = !this.addMoreMedicine;
    this.addMedicineForm.reset();
  }

  /**
  * Toggle additional instruction add form, show/hide add more additional instruction button
  * @returns {void}
  */
  toggleAdditionalInstruction(): void {
    this.addMoreAdditionalInstruction = !this.addMoreAdditionalInstruction;
    this.addAdditionalInstructionForm.reset();
  }

  /**
  * Get medicines for the visit
  * @returns {void}
  */
  checkIfMedicationPresent(): void {
    this.medicines = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptMed).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
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

  /**
  * Save medicine
  * @returns {void}
  */
  addMedicine(): void {
    if (this.addMedicineForm.invalid) {
      return;
    }
    if (this.medicines.find((o: MedicineModel) => o.drug === this.addMedicineForm.value.drug)) {
      this.toastr.warning(this.translateService.instant('Drug already added, please add another drug.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptMed,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: `${this.addMedicineForm.value.drug}:${this.addMedicineForm.value.strength}:${this.addMedicineForm.value.days}:${this.addMedicineForm.value.timing}:${this.addMedicineForm.value.remark}`,
      encounter: this.visitNotePresent.uuid
    }).subscribe((response: ObsModel) => {
      this.medicines.push({ ...this.addMedicineForm.value, uuid: response.uuid });
      this.addMedicineForm.reset();
    });
  }

  /**
  * Save additional instruction
  * @returns {void}
  */
  addAdditionalInstruction(): void {
    if (this.addAdditionalInstructionForm.invalid) {
      return;
    }
    if (this.additionalInstructions.find((o: ObsModel) => o.value === this.addAdditionalInstructionForm.value.note)) {
      this.toastr.warning(this.translateService.instant('Additional instruction already added, please add another instruction.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptMed,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addAdditionalInstructionForm.value.note,
      encounter: this.visitNotePresent.uuid
    }).subscribe((response: ObsModel) => {
      this.additionalInstructions.push({ uuid: response.uuid, value: this.addAdditionalInstructionForm.value.note });
      this.addAdditionalInstructionForm.reset();
    });
  }

  /**
  * Delete medicine for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Medicine obs uuid
  * @returns {void}
  */
  deleteMedicine(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.medicines.splice(index, 1);
    });
  }

  /**
  * Delete additional instruction for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Additional instruction obs uuid
  * @returns {void}
  */
  deleteAdditionalInstruction(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe((res) => {
      this.additionalInstructions.splice(index, 1);
    });
  }

  /**
  * Get advices list
  * @returns {void}
  */
  getAdvicesList(): void {
    const adviceUuid = '0308000d-77a2-46e0-a6fa-a8c1dcbc3141';
    this.diagnosisService.concept(adviceUuid).subscribe(res => {
      const result = res.answers;
      result.forEach((ans: { display: string; }) => {
        this.advicesList.push(this.translationService.getDropdownTranslation('advice', ans.display));
      });
    });
  }

  /**
  * Toggle advice add form, show/hide add more advice button
  * @returns {void}
  */
  toggleAdvice(): void {
    this.addMoreAdvice = !this.addMoreAdvice;
    this.addAdviceForm.reset();
  }

  /**
  * Get advices for the visit
  * @returns {void}
  */
  checkIfAdvicePresent(): void {
    this.advices = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptAdvice)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            if (!obs.value.includes('</a>')) {
              this.advices.push(obs);
            }
          }
        });
      });
  }

  /**
  * Save advice
  * @returns {void}
  */
  addAdvice(): void {
    if (this.addAdviceForm.invalid) {
      return;
    }
    if (this.advices.find((o: ObsModel) => o.value === this.addAdviceForm.value.advice)) {
      this.toastr.warning(this.translateService.instant('Advice already added, please add another advice.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptAdvice,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addAdviceForm.value.advice,
      encounter: this.visitNotePresent.uuid,
    }).subscribe((response: ObsModel) => {
      this.advices.push({ uuid: response.uuid, value: this.addAdviceForm.value.advice });
      this.addAdviceForm.reset();
    });
  }

  /**
  * Delete advice for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Advice obs uuid
  * @returns {void}
  */
  deleteAdvice(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.advices.splice(index, 1);
    });
  }

  /**
  * Get tests list
  * @returns {void}
  */
  getTestsList(): void {
    const testUuid = '98c5881f-b214-4597-83d4-509666e9a7c9';
    this.diagnosisService.concept(testUuid).subscribe(res => {
      const result = res.answers;
      result.forEach((ans: { display: string; }) => {
        this.testsList.push(this.translationService.getDropdownTranslation('tests', ans.display));
      });
    });
  }

  /**
  * Toggle test add form, show/hide add more test button
  * @returns {void}
  */
  toggleTest(): void {
    this.addMoreTest = !this.addMoreTest;
    this.addTestForm.reset();
  }

  /**
  * Get tests for the visit
  * @returns {void}
  */
  checkIfTestPresent(): void {
    this.tests = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptTest)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            this.tests.push(obs);
          }
        });
      });
  }

  /**
  * Save test
  * @returns {void}
  */
  addTest(): void {
    if (this.addTestForm.invalid) {
      return;
    }
    if (this.tests.find((o: TestModel) => o.value === this.addTestForm.value.test)) {
      this.toastr.warning(this.translateService.instant('Test already added, please add another test.'), this.translateService.instant('Already Added'));
      return;
    }
    this.encounterService.postObs({
      concept: conceptIds.conceptTest,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addTestForm.value.test,
      encounter: this.visitNotePresent.uuid,
    }).subscribe((response: ObsModel) => {
      this.tests.push({ uuid: response.uuid, value: this.addTestForm.value.test });
      this.addTestForm.reset();
    });
  }

  /**
  * Delete test for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Test obs uuid
  * @returns {void}
  */
  deleteTest(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.tests.splice(index, 1);
    });
  }

  /**
  * Toggle referral add form, show/hide add more referral button
  * @returns {void}
  */
  toggleReferral(): void {
    this.addMoreReferral = !this.addMoreReferral;
    this.addReferralForm.reset();
  }

  /**
  * Get referrals for the visit
  * @returns {void}
  */
  checkIfReferralPresent(): void {
    this.referrals = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptReferral)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          const obs_values = obs.value.split(':');
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            this.referrals.push({ uuid: obs.uuid, speciality: obs_values[0].trim(), facility: obs_values[1].trim(), priority: obs_values[2].trim(), reason: obs_values[3].trim() ? obs_values[3].trim() : '-' });
          }
        });
      });
  }

  /**
  * Save referral
  * @returns {void}
  */
  addReferral(): void {
    if (this.addReferralForm.invalid) {
      return;
    }
    if (this.referrals.find((o: ReferralModel) => o.speciality === this.addReferralForm.value.speciality)) {
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
    }).subscribe((response: ObsModel) => {
      this.referrals.push({ uuid: response.uuid, speciality: this.addReferralForm.value.speciality, facility: this.addReferralForm.value.facility, priority: this.addReferralForm.value.priority_refer, reason: refer_reason });
      this.addReferralForm.reset();
      this.addReferralForm.controls.priority_refer.setValue('Elective');
    });
  }

  /**
  * Delete referral for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Referral obs uuid
  * @returns {void}
  */
  deleteReferral(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.referrals.splice(index, 1);
    });
  }

  /**
  * Get followup for the visit
  * @returns {void}
  */
  checkIfFollowUpPresent(): void {
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptFollow).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          let followUpDate: string, followUpTime: any, followUpReason: any, wantFollowUp: string;
          if (obs.value.includes('Time:')) {
            followUpDate = (obs.value.includes('Time:')) ? moment(obs.value.split(', Time: ')[0]).format('YYYY-MM-DD') : moment(obs.value.split(', Remark: ')[0]).format('YYYY-MM-DD');
            followUpTime = (obs.value.includes('Time:')) ? obs.value.split(', Time: ')[1].split(', Remark: ')[0] : null;
            followUpReason = (obs.value.split(', Remark: ')[1]) ? obs.value.split(', Remark: ')[1] : null;
            wantFollowUp = 'Yes';
          } else {
            wantFollowUp = 'No';
          }
          this.followUpDatetime = obs.value;
          this.followUpForm.patchValue({
            present: true,
            wantFollowUp,
            followUpDate,
            followUpTime,
            followUpReason,
            uuid: obs.uuid
          });
        }
      });
    });
  }

  /**
  * Save followup
  * @returns {void}
  */
  saveFollowUp(): void {
    let body = {
      concept: conceptIds.conceptFollow,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: '',
      encounter: this.visitNotePresent.uuid
    }
    if (this.followUpForm.value.wantFollowUp === 'No') {
      body.value = 'No';
    } else {
      if (this.followUpForm.invalid || !this.isVisitNoteProvider) {
        return;
      }
      body.value = (this.followUpForm.value.followUpReason) ?
        `${moment(this.followUpForm.value.followUpDate).format('YYYY-MM-DD')}, Time: ${this.followUpForm.value.followUpTime}, Remark: ${this.followUpForm.value.followUpReason}` : `${moment(this.followUpForm.value.followUpDate).format('YYYY-MM-DD')}, Time: ${this.followUpForm.value.followUpTime}`;
    }
    this.encounterService.postObs(body).subscribe((res: ObsModel) => {
      if (res) {
        this.followUpForm.patchValue({ present: true, uuid: res.uuid });
        this.followUpDatetime = res.value;
        if(this.visitCompleted)
          this.notifyHwForAvailablePrescription(`Folloup date time added for ${this.visit?.patient?.person?.display || 'Patient'}`, 'followup')
      }
    });
  }

  /**
  * Delete followup
  * @returns {void}
  */
  deleteFollowUp(): void {
    this.diagnosisService.deleteObs(this.followUpForm.value.uuid).subscribe(() => {
      this.followUpForm.patchValue({ present: false, uuid: null, wantFollowUp: '', followUpDate: null, followUpTime: null, followUpReason: null });
      this.followUpDatetime = null;
    });
  }

  /**
  * Share prescription
  * @returns {boolean}
  */
  sharePrescription(): boolean {
    if (this.existingDiagnosis.length === 0) {
      this.toastr.warning(this.translateService.instant('Diagnosis not added'), this.translateService.instant('Diagnosis Required'));
      return false;
    }
    if (!this.followUpForm.value.present) {
      this.toastr.warning(this.translateService.instant('Follow-up not added'), this.translateService.instant('Follow-up Required'));
      return false;
    }
    this.coreService.openSharePrescriptionConfirmModal().subscribe((res: boolean) => {
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
                  this.notifyHwForAvailablePrescription();
                  this.appointmentService.completeAppointment({ visitUuid: this.visit.uuid }).subscribe();

                  if (this.appConfigService.abha_section) {
                    this.updateAbhaDetails(post.uuid);
                  }

                  this.linkSvc.shortUrl(`/i/${this.visit.uuid}`).subscribe({
                    next: (linkSvcRes: ApiResponseModel) => {
                      const link = linkSvcRes.data.hash;
                      this.visitService.postAttribute(
                        this.visit.uuid,
                        {
                          attributeType: '1e02db7e-e117-4b16-9a1e-6e583c3994da', /** Visit Attribute Type for Prescription Link */
                          value: `/i/${link}`,
                        }).subscribe();
                      this.coreService.openSharePrescriptionSuccessModal().subscribe((result: string | boolean) => {
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
                      this.coreService.openSharePrescriptionSuccessModal().subscribe((result: string | boolean) => {
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
                this.coreService.openSharePrescriptionSuccessModal().subscribe((result: string | boolean) => {
                  if (result === 'view') {
                    // Open visit summary modal here....
                    this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                  } else if (result === 'dashboard') {
                    this.router.navigate(['/dashboard']);
                  }
                });
              }
            } else {
              this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription due to poor network connection. Please try again or come back later', confirmBtnText: 'Try again' }).subscribe((c: boolean) => {
                if (c) {
                  // Do nothing
                }
              });
            }
          } else {
            this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription since your profile is not complete.', confirmBtnText: 'Go to profile' }).subscribe((c: boolean) => {
              if (c) {
                this.router.navigate(['/dashboard/profile']);
              }
            });
          }
        } else {
          this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription since this visit already in progress with another doctor.', confirmBtnText: 'Go to dashboard' }).subscribe((c: boolean) => {
            if (c) {
              this.router.navigate(['/dashboard']);
            }
          });
        }
      }
    });
  }

  /**
  * Get doctor details for the visit complete/encounter share prescription
  * @returns {any} - Doctor details completing the visit
  */
  getDoctorDetails(): any {
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
    attrs.forEach((attr: string) => {
      this.provider.attributes.forEach((pattr: ProviderAttributeModel) => {
        if (pattr.attributeType.display === attr && !pattr.voided) {
          d[attr] = pattr.value;
        }
      });
    });
    return d;
  }

  /**
  * Get all past visits for the patient
  * @returns {void}
  */
  getPastVisitHistory(): void {
    this.pastVisits = [];
    this.visitService.recentVisits(this.visit.patient.uuid).subscribe((res: RecentVisitsApiResponseModel) => {
      const visits = res.results;
      if (visits.length > 1) {
        visits.forEach((visit: VisitModel) => {
          if (visit.uuid !== this.visit.uuid) {
            this.visitService.fetchVisitDetails(visit.uuid).subscribe((visitdetail: VisitModel) => {
              visitdetail.created_on = visitdetail.startDatetime;
              visitdetail.cheif_complaint = this.visitSummaryService.getCheifComplaint(visitdetail);
              visitdetail.encounters.forEach((encounter: EncounterModel) => {
                if (encounter.encounterType.display === visitTypes.VISIT_COMPLETE) {
                  visitdetail.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
                  encounter.obs.forEach((o: ObsModel) => {
                    if (o.concept.display === 'Doctor details') {
                      visitdetail.doctor = JSON.parse(o.value);
                    }
                  });
                  encounter.encounterProviders.forEach((p: EncounterProviderModel) => {
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

  /**
  * Open view visit summary modal
  * @returns {void}
  */
  openVisitSummaryModal(uuid: string): void {
    this.coreService.openVisitSummaryModal({ uuid });
  }

  /**
  * Open view visit prescription modal
  * @returns {void}
  */
  openVisitPrescriptionModal(uuid: string): void {
    this.coreService.openVisitPrescriptionModal({ uuid });
  }

  ngOnDestroy(): void {
    deleteCacheData(visitTypes.PATIENT_VISIT_PROVIDER);
    if (this.dialogRef1) this.dialogRef1.close();
  }

  /**
  * Getting Images by section
  * @param {string} section - Section Title
  * @returns {Array}
  */
  getImagesBySection(section: string): Array<DocImagesModel> {
    return this.eyeImages.filter(o => o.section?.toLowerCase() === section?.toLowerCase());
  }

  /**
  * Send notification to health worker for available prescription
  * @returns {void}
  */
  notifyHwForAvailablePrescription(title = null, type = null): void {
    const hwUuid = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.provider?.uuid;
    const openMRSID = this.getPatientIdentifier("OpenMRS ID");
    const payload = {
      title: title || `Prescription available for ${this.visit?.patient?.person?.display || 'Patient'}`,
      body: "Click notification to see!",
      type: type,
      data: {
        patientFirstName: this.patient.person.preferredName.givenName ?? '',
        patientMiddleName: this.patient.person.preferredName.middleName ?? '',
        patientLastName: this.patient.person.preferredName.familyName ?? '',
        patientUuid: this.patient.uuid,
        patientOpenMrsId: openMRSID,
        visitUuid: this.visit.uuid,
        followupDatetime: this.followUpDatetime
      }
    }
    this.mindmapService.notifyApp(hwUuid, payload).subscribe();
  }

  /**
   * Get Abha numner / Abha address from patient
   */
  getAbhaDetails(_patient: PatientModel): void {
    this.patient.person.abhaNumber = _patient.identifiers.find((v) => v.identifierType?.display?.toLowerCase() === 'abha number')?.identifier
    this.patient.person.abhaAddress = _patient.identifiers.find((v) => v.identifierType?.display?.toLowerCase() === 'abha address')?.identifier
  }

  updateAbhaDetails(encounterUUID: string): void {
    let mobileNumber = this.getPersonAttributeValue('Telephone Number');
    mobileNumber = mobileNumber != 'NA' ? mobileNumber : undefined
    const abhaNumber = this.patient?.person?.abhaNumber?.replace(/-/g, '');
    const abhaAddress = this.patient?.person?.abhaAddress ?? (abhaNumber ? `${abhaNumber}@sbx` : undefined);
    if (abhaNumber || abhaAddress || mobileNumber) {
      // Added call to generate linking token and add isABDMLink attribute 
      this.visitService.postAttribute(this.visit.uuid,
        {
          attributeType: '8ac6b1c7-c781-494a-b4ef-fb7d7632874f', /** Visit Attribute Type for isABDMLinked */
          value: false,
        }).subscribe(() => {
          const abhaNumber = this.patient?.person?.abhaNumber?.replace(/-/g, '');
          const openMRSID = this.getPatientIdentifier("OpenMRS ID")
          this.visitService.postVisitToABDM({
            openMRSID: openMRSID,
            mobileNumber: mobileNumber,
            visitUUID: this.visit.uuid,
            name: this.patient?.person?.display,
            gender: this.patient?.person?.gender,
            abhaNumber: abhaNumber,
            abhaAddress: abhaAddress,
            yearOfBirth: this?.patient?.person?.birthdate ? Number(this?.patient?.person?.birthdate?.substring(0, 4)) : null,
            startDateTime: this.visit.startDatetime,
            encounterUUID: encounterUUID,
            personDisplay: this.patient?.person?.display
          }).subscribe();
        });
    }
  }

  checkPatientRegField(fieldName: string): boolean {
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  collapsedButton() {
    this.collapsed = !this.collapsed
  }

  getUrl(): string {
    return `assets/svgs/Vector${this.collapsed ? '-top' : '-bottom'}.svg`;
  }

  checkIsVisibleSection(pvsConfig: { key: string; is_enabled: boolean; }) {
    return checkIsEnabled(pvsConfig.key, 
      pvsConfig.is_enabled, {
      visitCompleted: this.visitCompleted,
      visitEnded: this.visitEnded,
      visitNotePresent: this.visitNotePresent,
      hasVitalsEnabled: this.hasVitalsEnabled,
      notes_section: this.patientVisitSummary.notes_section,
      attachment_section: this.patientVisitSummary.attachment_section
    })
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

  /**
   * Handles changes to the call status and updates the reasons list accordingly.
   * @param {Event} event - The change event from the call status input.
   * @return {void}
   */
  onCallStatusChange(event: Event): void {
    const status = (event.target as HTMLInputElement).getAttribute('data-value');
  
    this.reasonsList = this.reasons[status] || [];
    this.patientInteractionForm.patchValue({ reason: null });
  
    setTimeout(() => this.ngSelectComponent?.open(), 0);
  }

  /**
   * @param {string} sectionKey - The key of the section.
   * @param {string} [subSectionName] - The name of the subsection (optional).
   * @returns {boolean} - True if the subsection is enabled, false otherwise.
   */
  isSubSectionEnabled(sectionKey: string, subSectionName?: string): boolean {
    const section = this.patientInteraction.find(sec => sec.key === sectionKey);
    
    if (!section || !section.is_enabled) return false;
    if (!subSectionName) return true;
    
    const subSection = section.sub_sections?.find(sub => sub.name === subSectionName);
    return subSection ? subSection.is_enabled : false;
  }

  /**
   * @returns {boolean} - True if the form can be saved, false otherwise.
   */
  canSavePatientInteractionForm(): boolean {
    const form = this.patientInteractionForm;
    const bothTrue = this.isSubSectionEnabled('patient_interaction', 'HW') && this.isSubSectionEnabled('patient_interaction', 'Patient') && !form.value.present && this.appConfigService?.patient_visit_summary?.hw_interaction;
    const patientInteractionValid = !form.value.present && form.get('spoken')?.valid && form.get('callStatus')?.valid && form.get('reason')?.valid && !bothTrue;
    const hwInteractionValid = this.appConfigService?.patient_visit_summary?.hw_interaction && form.get('hwSpoken')?.valid && form.get('comment')?.valid && !bothTrue;
  
    return bothTrue ? (form.value.spoken && form.value.callStatus && form.value.reason && form.value.hwSpoken && form.value.comment) : patientInteractionValid || hwInteractionValid;
  }

  /**
   * @returns {boolean} - True if the save button should be shown, false otherwise.
   */
  canShowSaveButton(): boolean {
    const hwEnabled = this.isSubSectionEnabled('patient_interaction', 'HW');
    const patientEnabled = this.isSubSectionEnabled('patient_interaction', 'Patient');
  
    return (hwEnabled && !patientEnabled && !this.patientInteractionForm.value.hwPresent && this.appConfigService?.patient_visit_summary?.hw_interaction) || (patientEnabled && !hwEnabled && !this.patientInteractionForm.value.present) || (hwEnabled && patientEnabled);
  }
}
