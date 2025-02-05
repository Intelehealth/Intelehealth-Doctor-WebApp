import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AppointmentService } from '../services/appointment.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';
import { CoreService } from '../services/core/core.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData, checkIfDateOldThanOneDay, deleteCacheData } from '../utils/utility-functions';
import { doctorDetails, languages, visitTypes } from 'src/config/constant';
import { ApiResponseModel, AppointmentModel, CustomEncounterModel, CustomObsModel, CustomVisitModel, PatientVisitSummaryConfigModel, ProviderAttributeModel, RescheduleAppointmentModalResponseModel } from '../model/model';
import { AppConfigService } from '../services/app-config.service';
import { CompletedVisitsComponent } from './completed-visits/completed-visits.component';
import { FollowupVisitsComponent } from './followup-visits/followup-visits.component';
import { MindmapService } from '../services/mindmap.service';
import { NgxRolesService } from 'ngx-permissions';
import { HelpTourService } from '../services/help-tour.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';


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
      return formatDate(date, 'dd MMM yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class DashboardComponent implements OnInit {
  pluginConfigObsAwaiting: any = {
    anchorId: "anchor-awaiting",
    pluginConfigObsFlag: "Awaiting",
    baseURL: "https://dev.intelehealth.org/openmrs/ws/rest/v1",
    mindmapURL: "https://dev.intelehealth.org:3004/api",
    tableHeader: "Awaiting visits",
    tooltipLabel: "General uploaded visits",
    searchPlaceHolder: "Search Awaiting Visits",
    noRecordFound: "No any awaiting visits.",
    tableHeaderIcon: "assets/svgs/green-profile.svg",
    filterObs: {
      filterFlag: true,
      filterLabel: "Filter",
      filterIcon: "assets/svgs/filter.svg",
      filterDateField: "visit_created",
      filterDateMax: new Date()
    },
    tableColumns: [
      {
        label: "Patient",
        key: "patient_name",
        formatHtml: (element)=> { 
          return `
          <img src="assets/svgs/user.svg" alt="" width="32px" height="32px" style="border-radius: 50%;">
          <span class="font-bold ml-2">${element?.patient_name?.given_name} ${element?.patient_name?.middle_name ? element?.patient_name?.middle_name + " " : ""} ${element?.patient_name?.family_name} (${element?.person?.gender})</span>`
        },
      },
      {
        label: "Age",
        key: "age",
        formatHtml: (element)=> { 
          return `<span>${element?.person?.age} ${'y'}</span>`
        },
      },
      {
        label: "Location",
        key: "location",
        formatHtml: (element)=> { 
          return `<span>${element?.location?.name}</span>`
        },
      },
      {
        label: "Chief Complaint",
        key: "cheif_complaint",
      },
      {
        label: "Patient Type",
        key: "patient_type",
        classList: [
          "chip",
          "chip-item-green",
          "green"
        ],
        formatHtml: (element)=> { 
          return `
            <span>${element?.patient_type}</span>
          `
        },
      },
      {
        label: "Visit Uploaded",
        key: "visit_created",
        classList: [
          "red-pill",
        ],
        formatHtml: (element)=> { 
          return `
            <img src="assets/svgs/red-pad.svg" alt="Visit Uploaded" style="margin-right: 8px; vertical-align: middle;">
            <span>${element?.visit_created}</span>
          `
        },
      },
    ],
  }; 

  pluginConfigObsPriority: any = {
    anchorId: "anchor-priority",
    pluginConfigObsFlag: "Priority",
    baseURL: "https://dev.intelehealth.org/openmrs/ws/rest/v1",
    mindmapURL: "https://dev.intelehealth.org:3004/api",
    tableHeader: "Priority visits",
    tooltipLabel: "High priority visit",
    searchPlaceHolder: "Search Priority Visits",
    noRecordFound: "No any priority visits.",
    tableHeaderIcon: "assets/svgs/red-profile.svg",
    filterObs: {
      filterFlag: true,
      filterLabel: "Filter",
      filterIcon: "assets/svgs/filter.svg",
      filterDateField: "visit_created",
      filterDateMax: new Date()
    },
    tableColumns: [
      {
        label: "Patient",
        key: "patient_name",
        formatHtml: (element)=> { 
          return `
          <img src="assets/svgs/user.svg" alt="" width="32px" height="32px" style="border-radius: 50%;">
          <span class="font-bold ml-2">${element?.patient_name?.given_name} ${element?.patient_name?.middle_name ? element?.patient_name?.middle_name + " " : ""} ${element?.patient_name?.family_name} (${element?.person?.gender})</span>`
        },
      },
      {
        label: "Age",
        key: "age",
        formatHtml: (element)=> { 
          return `<span>${element?.person?.age} ${'y'}</span>`
        },
      },
      {
        label: "Location",
        key: "location",
        formatHtml: (element)=> { 
          return `<span>${element?.location?.name}</span>`
        },
      },
      {
        label: "Chief Complaint",
        key: "cheif_complaint",
      },
      {
        label: "Visit Uploaded",
        key: "visit_created",
        classList: [
          "red-pill",
        ],
        formatHtml: (element)=> { 
          return `
            <img src="assets/svgs/red-pad.svg" alt="Visit Uploaded" style="margin-right: 8px; vertical-align: middle;">
            <span>${element?.visit_created}</span>
          `
        },
      }
    ],
  }; 

  pluginConfigObsCompleted: any = {
    anchorId: "anchor-completed",
    pluginConfigObsFlag: "Completed",
    baseURL: "https://dev.intelehealth.org/openmrs/ws/rest/v1",
    mindmapURL: "https://dev.intelehealth.org:3004/api",
    tableHeader: "Completed visits",
    tooltipLabel: "Ended visits after prescription",
    searchPlaceHolder: "Search Completed Visits",
    noRecordFound: "No any completed visits.",
    tableHeaderIcon: "assets/svgs/completed.svg",
    filterObs: {
      filterFlag: true,
      filterLabel: "Filter",
      filterIcon: "assets/svgs/filter.svg",
      filterDateField: "completed",
      filterDateMax: new Date()
    },
    tableColumns: [
      {
        label:"TMH Patient ID",
        key: "TMH_patient_id",
        formatHtml: (element)=> {
          return `<span>${element?.TMH_patient_id?.value ? element?.TMH_patient_id?.value : ''}</span>`
        },
      },
      {
        label: "Patient",
        key: "patient_name",
        formatHtml: (element)=> { 
          return `
          <img src="assets/svgs/user.svg" alt="" width="32px" height="32px" style="border-radius: 50%;">
          <span class="font-bold ml-2">${element?.patient_name?.given_name} ${element?.patient_name?.middle_name ? element?.patient_name?.middle_name + " " : ""} ${element?.patient_name?.family_name} (${element?.person?.gender})</span>`
        },
      },
      {
        label: "Age",
        key: "age",
        formatHtml: (element)=> { 
          return `<span>${element?.person?.age} ${'y'}</span>`
        },
      },
      {
        label: "Location",
        key: "location",
        formatHtml: (element)=> { 
          return `<span>${element?.location?.name}</span>`
        },
      },
      {
        label: "Chief Complaint",
        key: "cheif_complaint",
      },
      {
        label: "Visit Completed",
        key: "visit_completed",
        classList: [
          "red-pill",
        ],
        formatHtml: (element)=> { 
          return `
            <img src="assets/svgs/red-pad.svg" alt="Visit Completed" style="margin-right: 8px; vertical-align: middle;">
            <span>${element?.completed}</span>
          `
        },
      }
    ],
  }; 

  pluginConfigObsFollowUp: any = {
    anchorId: "anchor-follow up",
    pluginConfigObsFlag: "FollowUp",
    baseURL: "https://dev.intelehealth.org/openmrs/ws/rest/v1",
    mindmapURL: "https://dev.intelehealth.org:3004/api",
    tableHeader: "Follow up visits",
    tooltipLabel: "Ended visits after prescription",
    searchPlaceHolder: "Search Follow Up Visits",
    noRecordFound: "No any follow up visits.",
    tableHeaderIcon: "assets/svgs/diagnosis.svg",
    filterObs: {
      filterFlag: true,
      filterLabel: "Filter",
      filterIcon: "assets/svgs/filter.svg",
      filterDateField: "followUp",
      filterDateMax: ''
    },
    tableColumns: [
      {
        label: "Patient",
        key: "patient_name",
        formatHtml: (element)=> { 
          return `
          <img src="assets/svgs/user.svg" alt="" width="32px" height="32px" style="border-radius: 50%;">
          <span class="font-bold ml-2">${element?.patient_name?.given_name} ${element?.patient_name?.middle_name ? element?.patient_name?.middle_name + " " : ""} ${element?.patient_name?.family_name} (${element?.person?.gender})</span>`
        },
      },
      {
        label: "Age",
        key: "age",
        formatHtml: (element)=> { 
          return `<span>${element?.person?.age} ${'y'}</span>`
        },
      },
      {
        label: "Location",
        key: "location",
        formatHtml: (element)=> { 
          return `<span>${element?.location?.name}</span>`
        },
      },
      {
        label: "FollowUp Date",
        key: "followup_date",
        classList: [
          "red-pill",
        ],
        formatHtml: (element)=> { 
          return `
            <img src="assets/svgs/red-pad.svg" alt="FollowUp Date" style="margin-right: 8px; vertical-align: middle;">
            <span>${element?.followUp}</span>
          `
        },
      }
    ],
  }; 

  pluginConfigObsAppointment: any = {
    anchorId: "anchor-appointment",
    pluginConfigObsFlag: "Appointment",
    baseURL: "https://dev.intelehealth.org/openmrs/ws/rest/v1",
    mindmapURL: "https://dev.intelehealth.org:3004/api",
    tableHeader: "Appointments",
    tooltipLabel: "Scheduled appointments",
    searchPlaceHolder: "Search Appointments",
    noRecordFound: "No any appointments scheduled.",
    tableHeaderIcon: "assets/svgs/cam-icon.svg",
    filterObs: {
      filterFlag: true,
      filterLabel: "Filter",
      filterIcon: "assets/svgs/filter.svg",
      filterDateField: "slotJsDate",
      filterDateMax: ''
    },
    tableColumns: [
      {
        label:"TMH Patient ID",
        key: "TMH_patient_id",
        formatHtml: (element)=> {
          return `<span>${element?.TMH_patient_id?.value ? element?.TMH_patient_id?.value : ''}</span>`
        },
      },
      {
        label: "Patient",
        key: "patient_name",
        formatHtml: (element)=> { 
          return `
            <img src="assets/svgs/user.svg" alt="" width="32px" height="32px" style="border-radius: 50%;">
            <span class="font-bold ml-2">${element?.patientName} (${this.translateService.instant(element?.patientGender)})</span>
          `
        },
      },
      {
        label: "Age",
        key: "age",
        formatHtml: (element)=> { 
          return `<span>${element?.patientAge} ${'y'}</span>`
        },
      },
      // {
      //   label: "Starts in",
      //   key: "starts_in",
      //   formatHtml: (element) => {
      //     let  color = '';
      //     if (element.starts_in.includes('Due'))
      //       color = "#FF475D"; // red color
      //     if (element.starts_in.includes('Hour') || element.starts_in.includes('Minute'))
      //       color = "#0FD197"; // green color
      //     return `<strong><span style="color: ${color}">${element?.starts_in}</span></strong>`;
      //   }
      // },
      {
        label: "Starts in",
        key: "starts_in",
        formatHtml: (element) => {
          let  color, bold = '';
          if (element.starts_in.includes('Due')){
            color = "#FF475D"; bold = "bold"; // red color & bold
          }
          if (element.starts_in.includes('Hour') || element.starts_in.includes('Minute')){
            color = "#0FD197"; bold = "bold"; // green color & bold
          }
          return `<span style="color: ${color}; font-weight: ${bold};">${element?.starts_in}</span>`;
        }
      },
      // {
      //   label: "Location",
      //   key: "location",
      //   formatHtml: (element)=> { 
      //     return `<span>${element?.visit?.location?.name}</span>`
      //   },
      // },
      // {
      //   label: "Chief Complaint",
      //   key: "cheif_complaint",
      // },
      // {
      //   label: "Doctor",
      //   key: "drName",
      // },
      {
        label: "Contact",
        key: "telephone",
        formatHtml: () => {
          return ""; // Do not return the telephone number
        }
      },
      {
        label: "Actions",
        key: "actions",
        actionButtons: [
          {
            label: "Reschedule",
            callBack: (element: any) => this.reschedule(element),
            style: {
              color: "#2e1e91",
              backgroundColor: "#efe8ff",
            },
          },
          {
            label: "Cancel",
            callBack: (element: any) => this.cancel(element),
            style: {
              color: "#ff475d",
              backgroundColor: "#ffe8e8",
            },
          },
        ]
      }
    ],
  };

  pluginConfigObsInProgress: any = {
    anchorId: "anchor-inprogress",
    pluginConfigObsFlag: "InProgress",
    baseURL: "https://dev.intelehealth.org/openmrs/ws/rest/v1",
    mindmapURL: "https://dev.intelehealth.org:3004/api",
    tableHeader: "In-progress visits",
    tooltipLabel: "Visits going through the consultation",
    searchPlaceHolder: "Search In-progress Visits",
    noRecordFound: "No any appointments scheduled.",
    tableHeaderIcon: "assets/svgs/pen-board.svg",
    filterObs: {
      filterFlag: true,
      filterLabel: "Filter",
      filterIcon: "assets/svgs/filter.svg",
      filterDateField: "prescription_started",
      filterDateMax: new Date()
    },
    tableColumns: [
      {
        label:"TMH Patient ID",
        key: "TMH_patient_id",
        formatHtml: (element)=> {
          return `<span>${element?.TMH_patient_id?.value ? element?.TMH_patient_id?.value : ''}</span>`
        },
      },
      {
        label: "Patients",
        key: "name",
        formatHtml: (element)=> {
          return `
            <img src="assets/svgs/user.svg" alt="" width="32px" height="32px" style="border-radius: 50%;">
            <span class="font-bold ml-2">${element?.patient_name?.given_name} ${element?.patient_name?.middle_name ? element?.patient_name?.middle_name + " " : ""} ${element?.patient_name?.family_name} (${element?.person?.gender})</span>
          `
        },
      },
      {
        label: "Age",
        key: "age",
        formatHtml: (element)=> {
          return `<span>${element?.person?.age} ${'y'}</span>`
        },
      },
      {
        label: "Prescription Started",
        key: "prescription_started",
        icon:"assets/svgs/red-pad.svg",
        classList: [
          "red-pill",
        ],
        formatHtml: (element)=> {
          return `
              <img src="assets/svgs/red-pad.svg" alt="Prescription Started" style="margin-right: 8px; vertical-align: middle;">
              <span>${element.prescription_started}</span>
            `
        },
      }
    ],
  };
  showAll: boolean = true;
  displayedColumns1: string[] = ['name', 'age', 'starts_in', 'location', 'cheif_complaint', 'drName', 'telephone','actions'];
  displayedColumns2: string[] = ['name', 'age', 'location', 'cheif_complaint', 'visit_created'];
  displayedColumns3: string[] = ['name', 'age', 'location', 'cheif_complaint', 'patient_type', 'visit_created'];
  displayedColumns4: string[] = ['name', 'age', 'location', 'cheif_complaint', 'prescription_started'];

  dataSource1 = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  dataSource3 = new MatTableDataSource<any>();
  dataSource4 = new MatTableDataSource<any>();

  baseUrl: string = environment.baseURL;
  appointments: AppointmentModel[] = [];
  priorityVisits: CustomVisitModel[] = [];
  awaitingVisits: CustomVisitModel[] = [];
  inProgressVisits: CustomVisitModel[] = [];
  completedVisits: CustomVisitModel[] = [];
  followUpVisits: CustomVisitModel[] = [];

  specialization: string = '';
  priorityVisitsCount: number = 0;
  awaitingVisitsCount: number = 0;
  inprogressVisitsCount: number = 0;
  completedVisitsCount: number = 0;
  followUpVisitsCount: number = 0;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('appointmentPaginator') appointmentPaginator: MatPaginator;
  @ViewChild('priorityPaginator') priorityPaginator: MatPaginator;
  @ViewChild('awaitingPaginator') awaitingPaginator: MatPaginator;
  @ViewChild('inprogressPaginator') inprogressPaginator: MatPaginator;

  offset: number = environment.recordsPerPage;
  awatingRecordsFetched: number = 0;
  pageEvent1: PageEvent;
  pageIndex1:number = 0;
  pageSize1:number = 5;

  priorityRecordsFetched: number = 0;
  pageEvent2: PageEvent;
  pageIndex2:number = 0;
  pageSize2:number = 5;

  inprogressRecordsFetched: number = 0;
  pageEvent3: PageEvent;
  pageIndex3:number = 0;
  pageSize3:number = 5;

  appointmentRecordsFetched: number = 0;
  pageEvent4: PageEvent;
  pageIndex4:number = 0;
  pageSize4:number = 5;

  completedRecordsFetched: number = 0;
  pageEvent5: PageEvent;
  pageIndex5:number = 0;
  pageSize5:number = 5;

  patientRegFields: string[] = [];
  pvs: PatientVisitSummaryConfigModel;
  isMCCUser: boolean = false;

  panelExpanded: boolean = true;
  mode: 'date' | 'range' = 'date';
  maxDate: Date = new Date();

  filteredDateAndRangeForm1: FormGroup;
  filteredDateAndRangeForm2: FormGroup;
  filteredDateAndRangeForm3: FormGroup;
  filteredDateAndRangeForm4: FormGroup;

  isFilterApplied1 = false;
  isFilterApplied2 = false;
  isFilterApplied3 = false;
  isFilterApplied4 = false;
  
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  @ViewChild('tempPaginator1') tempPaginator1: MatPaginator;
  @ViewChild('tempPaginator2') tempPaginator2: MatPaginator;
  @ViewChild('tempPaginator3') tempPaginator3: MatPaginator;
  
  @ViewChild('apSearchInput', { static: false }) apSearchElement: ElementRef;
  @ViewChild('prSearchInput', { static: false }) prSearchElement: ElementRef;
  @ViewChild('awSearchInput', { static: false }) awSearchElement: ElementRef;
  @ViewChild('ipSearchInput', { static: false }) ipSearchElement: ElementRef;

  @ViewChild(CompletedVisitsComponent) completedVisitsComponent: CompletedVisitsComponent;
  @ViewChild(FollowupVisitsComponent) followUpVisitsComponent: FollowupVisitsComponent;

  constructor(
    private pageTitleService: PageTitleService,
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private socket: SocketService,
    private router: Router,
    private coreService: CoreService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private mindmapService: MindmapService,
    private appConfigService: AppConfigService,
    public tourSvc: HelpTourService,
    private rolesService: NgxRolesService) {
      this.filteredDateAndRangeForm1 = this.createFilteredDateRangeForm();
      this.filteredDateAndRangeForm2 = this.createFilteredDateRangeForm();
      this.filteredDateAndRangeForm3 = this.createFilteredDateRangeForm();
      this.filteredDateAndRangeForm4 = this.createFilteredDateRangeForm();

      this.isMCCUser = !!this.rolesService.getRole('ORGANIZATIONAL:MCC');
      Object.keys(this.appConfigService.patient_registration).forEach(obj=>{
        this.patientRegFields.push(...this.appConfigService.patient_registration[obj].filter((e: { is_enabled: any; })=>e.is_enabled).map((e: { name: any; })=>e.name));
      });
      this.pvs = { ...this.appConfigService.patient_visit_summary }; 
      this.pvs.appointment_button = this.pvs.appointment_button;
      this.displayedColumns1 = this.displayedColumns1.filter(col=> {
        if(col === 'drName' && !this.isMCCUser) return false;
        if(col === 'age') return this.checkPatientRegField('Age');
        return true;
      });
      this.displayedColumns2 = this.displayedColumns2.filter(col=>(col!=='age' || this.checkPatientRegField('Age')));
      this.displayedColumns3 = this.displayedColumns3.filter(col=>(col!=='age' || this.checkPatientRegField('Age')));
      this.displayedColumns4 = this.displayedColumns4.filter(col=>(col!=='age' || this.checkPatientRegField('Age')));
      
      if(!this.pvs.awaiting_visits_patient_type_demarcation){
        this.displayedColumns3 = this.displayedColumns3.filter(col=>(col!=='patient_type'));
      }
    }

  createFilteredDateRangeForm(): FormGroup {
    return new FormGroup({
      date: new FormControl('', [Validators.required]),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
    });
  }
    
  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Dashboard", imgUrl: "assets/svgs/menu-info-circle.svg" });
    let provider = getCacheData(true, doctorDetails.PROVIDER);
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
      } else {
        this.router.navigate(['/dashboard/get-started']);
      }
      if (this.pvs.appointment_button) {
        this.getAppointments();
      }
      if(this.pvs.awaiting_visit_section){
        this.getAwaitingVisits(1);
      }
      if (this.pvs.priority_visit_section) {
        this.getPriorityVisits(1);
      }
      this.getInProgressVisits(1);

      if (this.pvs?.completed_visit_section)
        this.getCompletedVisits();

      if (this.pvs?.follow_up_visit_section)
        this.getFollowUpVisit();
    }

    this.socket.initSocket(true);
    this.initHelpTour();

    if(environment.brandName === 'KCDO'){
      this.displayedColumns1 = ['TMH_patient_id', 'name', 'age', 'starts_in', 'actions'];
      this.displayedColumns4 = ['TMH_patient_id', 'name', 'age', 'prescription_started'];
    }
  }

  initHelpTour(){
    if(getCacheData(false,doctorDetails.IS_NEW_DOCTOR) === getCacheData(true, doctorDetails.USER)?.uuid && !this.isGettingStarted) {
      const tour = this.tourSvc.initHelpTour();
      if(tour){
        tour.onFinish(() => {
          deleteCacheData(doctorDetails.IS_NEW_DOCTOR);
        });
      }
    }
  }

  get isGettingStarted(){
    return location.hash.includes('dashboard/get-started'); 
  }

  get tempPaginator4() {
    return this.completedVisitsComponent?.paginator;
  };

  get tempPaginator5() {
    return this.followUpVisitsComponent?.paginator;
  };

  get dataSource5(){
    return this.completedVisitsComponent?.tblDataSource;
  }

  get dataSource6(){
    return this.followUpVisitsComponent?.tblDataSource;
  }

  /**
  * Get follow-up visits for a logged-in doctor
  * @return {void}
  */
  getFollowUpVisit(page: number = 1) {
    this.visitService.getFollowUpVisits(this.specialization).subscribe({
      next: (res: ApiResponseModel) => {
        if (res.success) {
          this.followUpVisitsCount = 0;
          this.completedRecordsFetched += this.offset;
          for (let i = 0; i < res.data.length; i++) {
            let visit = res.data[i];
            if (visit?.encounters?.length) {
              this.followUpVisitsCount += 1;
              visit.cheif_complaint = this.getCheifComplaint(visit);
              visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z', '+0530')) : this.getEncounterCreated(visit, visitTypes.COMPLETED_VISIT);
              visit.person.age = this.calculateAge(visit.person.birthdate);
              visit.completed = this.getEncounterCreated(visit, visitTypes.VISIT_COMPLETE);
              visit.followUp = this.getEncounterObs(visit.encounters, visitTypes.VISIT_NOTE, 163345/*Follow-up*/)?.value_text;
              this.followUpVisits.push(visit);
            }
          }
          this.dataSource6.data = [...this.followUpVisits];
          if (page == 1) {
            this.dataSource6.paginator = this.tempPaginator5;
            this.dataSource6.filterPredicate = (data: { patient: { identifier: string; }; patient_name: { given_name: string; middle_name: string; family_name: string; }; }, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
          } else {
            this.tempPaginator5.length = this.followUpVisits.length;
            this.tempPaginator5.nextPage();
          }
        }
      }
    });
    }

  /**
   * Get completed visits count
   * @return {void}
   */
  getCompletedVisits(page: number = 1) {
    this.visitService.getEndedVisits(this.specialization, page).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.completedVisitsCount = res.totalCount;
        this.completedRecordsFetched += this.offset;
        for (let i = 0; i < res.data.length; i++) {
          let visit = res.data[i];
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z', '+0530')) : this.getEncounterCreated(visit, visitTypes.COMPLETED_VISIT);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          visit.completed = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z', '+0530')) : this.getEncounterCreated(visit, visitTypes.VISIT_COMPLETE);
          visit.TMH_patient_id = this.getAttributeData(visit, "TMH Case Number");
          this.completedVisits.push(visit);
        }
        this.dataSource5.data = [...this.completedVisits];
        if (page == 1) {
          this.dataSource5.paginator = this.tempPaginator4;
          this.dataSource5.filterPredicate = (data: { patient: { identifier: string; }; patient_name: { given_name: string; middle_name: string; family_name: string; }; }, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator4.length = this.completedVisits.length;
          this.tempPaginator4.nextPage();
        }
      }
    });
  }

  /**
  * Get awaiting visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getAwaitingVisits(page: number = 1) {
    if(page == 1) {
      this.awaitingVisits = [];
      this.awatingRecordsFetched = 0;
    }
    this.visitService.getAwaitingVisits(this.specialization, page).subscribe((av: ApiResponseModel) => {
      if (av.success) {
        this.awaitingVisitsCount = av.totalCount;
        this.awatingRecordsFetched += this.offset;
        for (let i = 0; i < av.data.length; i++) {
          let visit = av.data[i];
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z','+0530')) : this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          visit.patient_type = this.getDemarcation(visit?.encounters);
          this.awaitingVisits.push(visit);
        }
        this.dataSource3.data = [...this.awaitingVisits];
        if (page == 1) {
          this.dataSource3.paginator = this.tempPaginator2;
          this.dataSource3.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator2.length = this.awaitingVisits.length;
          this.tempPaginator2.nextPage();
        }
      }
    });
  }

  getDemarcation(enc) {
    let isFollowUp = false;
    const adlIntl = enc?.find?.(e => e?.type?.name === visitTypes.ADULTINITIAL);
    if (Array.isArray(adlIntl?.obs)) {
      adlIntl?.obs.forEach(obs => {
        if (!isFollowUp)
          isFollowUp = obs?.value_text?.toLowerCase?.()?.includes?.("follow up");
      });
    }
    return isFollowUp ? visitTypes.FOLLOW_UP : visitTypes.NEW;
  }

  /**
  * Callback for page change event and Get awaiting visit for a selected page index and page size
  * @param {PageEvent} event - onerror event
  * @return {void}
  */
  public getAwaitingData(event?:PageEvent){
    this.pageIndex1 = event.pageIndex;
    this.pageSize1 = event.pageSize;
    if (this.dataSource3.filter) {
      this.awaitingPaginator?.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize1) > this.awatingRecordsFetched) {
      this.getAwaitingVisits((this.awatingRecordsFetched+this.offset)/this.offset);
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator2.nextPage();
      } else {
        this.tempPaginator2.previousPage();
      }
    }
    return event;
  }

  /**
  * Get priority visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getPriorityVisits(page: number = 1) {
    if(page == 1) {
      this.priorityVisits = [];
      this.priorityRecordsFetched = 0;
    }
    this.visitService.getPriorityVisits(this.specialization, page).subscribe((pv: ApiResponseModel) => {
      if (pv.success) {
        this.priorityVisitsCount = pv.totalCount;
        this.priorityRecordsFetched += this.offset;
        for (let i = 0; i < pv.data.length; i++) {
          let visit = pv.data[i];
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z','+0530')) : this.getEncounterCreated(visit, visitTypes.FLAGGED);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          this.priorityVisits.push(visit);
        }
        this.dataSource2.data = [...this.priorityVisits];
        if (page == 1) {
          this.dataSource2.paginator = this.tempPaginator1;
          this.dataSource2.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator1.length = this.priorityVisits.length;
          this.tempPaginator1.nextPage();
        }
      }
    });
  }

  /**
  * Callback for page change event and Get priority visit for a selected page index and page size
  * @param {PageEvent} event - onerror event
  * @return {void}
  */
  public getPriorityData(event?:PageEvent){
    this.pageIndex2 = event.pageIndex;
    this.pageSize2 = event.pageSize;
    if (this.dataSource2.filter) {
      this.priorityPaginator?.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize2) > this.priorityRecordsFetched) {
      this.getPriorityVisits((this.priorityRecordsFetched+this.offset)/this.offset);
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator1.nextPage();
      } else {
        this.tempPaginator1.previousPage();
      }
    }
    return event;
  }

  /**
  * Get inprogress visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getInProgressVisits(page: number = 1) {
    if(page == 1) {
      this.inProgressVisits = [];
      this.inprogressRecordsFetched = 0;
    }
    this.visitService.getInProgressVisits(this.specialization, page).subscribe((iv: ApiResponseModel) => {
      if (iv.success) {
        this.inprogressVisitsCount = iv.totalCount;
        this.inprogressRecordsFetched += this.offset;
        for (let i = 0; i < iv.data.length; i++) {
          let visit = iv.data[i];
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z','+0530')) : this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.prescription_started = this.getEncounterCreated(visit, visitTypes.VISIT_NOTE);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          visit.TMH_patient_id = this.getAttributeData(visit, "TMH Case Number");
          this.inProgressVisits.push(visit);
        }
        this.dataSource4.data = [...this.inProgressVisits];
        if (page == 1) {
          this.dataSource4.paginator = this.tempPaginator3;
          this.dataSource4.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator3.length = this.inProgressVisits.length;
          this.tempPaginator3.nextPage();
        }
      }
    });
  }

  getAttributeData(data: any, attributeName: string): { name: string; value: string } | null {
    if (data?.person_attribute && Array.isArray(data.person_attribute)) {
      const attribute = data.person_attribute.find(
        (attr: any) => attr.person_attribute_type?.name === attributeName
      );
      if (attribute) {
        return {
          name: attribute.person_attribute_type.name,
          value: attribute.value
        };
      }
    }
    return null;
  }
    
  /**
  * Callback for page change event and Get inprogress visit for a selected page index and page size
  * @param {PageEvent} event - onerror event
  * @return {void}
  */
  public getInprogressData(event?:PageEvent){
    this.pageIndex3 = event.pageIndex;
    this.pageSize3 = event.pageSize;
    if (this.dataSource4.filter) {
      this.inprogressPaginator?.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize3) > this.inprogressRecordsFetched) {
      this.getInProgressVisits((this.inprogressRecordsFetched+this.offset)/this.offset);
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator3.nextPage();
      } else {
        this.tempPaginator3.previousPage();
      }
    }
    return event;
  }

  /**
  * Get booked appointments for a logged-in doctor in a current year
  * @return {void}
  */
  getAppointments() {
    this.appointments = [];
    this.appointmentService.getUserSlots(getCacheData(true, doctorDetails.USER).uuid, moment().startOf('year').format('DD/MM/YYYY'), moment().endOf('year').format('DD/MM/YYYY'), this.isMCCUser ? this.specialization : null)
      .subscribe((res: ApiResponseModel) => {
        let appointmentsdata = res.data;
        appointmentsdata.forEach((appointment: AppointmentModel) => {
          if (appointment.status == 'booked' && (appointment.visitStatus == 'Awaiting Consult'||appointment.visitStatus == 'Visit In Progress')) {
            if (appointment.visit) {
              appointment.cheif_complaint = this.getCheifComplaint(appointment.visit);
              appointment.starts_in = checkIfDateOldThanOneDay(appointment.slotJsDate);
              appointment.telephone = this.getTelephoneNumber(appointment?.visit?.person)
              appointment.TMH_patient_id = this.getAttributeData(appointment.visit, "TMH Case Number");
              this.appointments.push(appointment);
            }
          }
        });
        this.dataSource1.data = [...this.appointments];
        this.dataSource1.paginator = this.appointmentPaginator;
        this.dataSource1.filterPredicate = (data, filter: string) => data?.openMrsId.toLowerCase().indexOf(filter) != -1 || data?.patientName.toLowerCase().indexOf(filter) != -1;
      });
  }

  /**
  * Get encounter datetime for a given encounter type
  * @param {CustomVisitModel} visit - Visit
  * @param {string} encounterName - Encounter type
  * @return {string} - Encounter datetime
  */
  getEncounterCreated(visit: CustomVisitModel, encounterName: string) {
    let created_at = '';
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(encounterName) !== null) {
        created_at = this.getCreatedAt(encounter.encounter_datetime.replace('Z','+0530'));
      }
    });
    return created_at;
  }


  /**
  * Get encounter datetime for a given encounter type
  * @param {CustomVisitModel} visit - Visit
  * @param {string} encounterName - Encounter type
  * @return {string} - Encounter datetime
  */
  getEncounterObs(encounters: CustomEncounterModel[], encounterName: string, conceptId: number) {
    let obs: CustomObsModel;
    encounters.forEach((encounter: CustomEncounterModel) => {
      if (encounter.type?.name === encounterName) {
        obs = encounter?.obs?.find((o: CustomObsModel) => o.concept_id == conceptId);
      }
    });
    return obs;
  }

  /**
  * Retreive the chief complaints for the visit
  * @param {CustomVisitModel} visit - Visit
  * @return {string[]} - Chief complaints array
  */
  getCheifComplaint(visit: CustomVisitModel) {
    let recent: string[] = [];
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach((currentObs :CustomObsModel) => {
          if (currentObs.concept_id == 163212) {
            const currentComplaint = this.visitService.getData2(currentObs)?.value_text.replace(new RegExp('►', 'g'), '').split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

  /**
  * Returns the age in years from the birthdate
  * @param {string} birthdate - Date in string format
  * @return {number} - Age
  */
  calculateAge(birthdate: string) {
    return moment().diff(birthdate, 'years');
  }

  /**
  * Returns the created time in words from the date
  * @param {string} data - Date
  * @return {string} - Created time in words from the date
  */
  getCreatedAt(data: string) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if (hours > 24) {
      return moment(data).format('DD MMM, YYYY');
    };
    if (hours < 1) {
      return `${minutes} ${this.translateService.instant("Minutes ago")}`;
    }
    return `${hours} ${this.translateService.instant("Hours ago")}`;
  }

  /**
  * Get doctor speciality
  * @param {ProviderAttributeModel[]} attr - Array of provider attributes
  * @return {string} - Doctor speciality
  */
  getSpecialization(attr: ProviderAttributeModel[]) {
    let specialization = '';
    attr.forEach((a: ProviderAttributeModel) => {
      if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
        specialization = a.value;
      }
    });
    return specialization;
  }

  /**
  * Reschedule appointment
  * @param {AppointmentModel} appointment - Appointment to be rescheduled
  * @return {void}
  */
  reschedule(appointment: AppointmentModel) {
    const len = appointment.visit.encounters.filter((e: CustomEncounterModel) => {
      return (e.type.name == visitTypes.PATIENT_EXIT_SURVEY || e.type.name == visitTypes.VISIT_COMPLETE);
    }).length;
    const isCompleted = Boolean(len);
    if (isCompleted) {
      this.toastr.error("Visit is already completed, it can't be rescheduled.", 'Rescheduling failed');
    } else if(appointment.visitStatus == 'Visit In Progress') {
      this.toastr.error(this.translateService.instant("Visit is in progress, it can't be rescheduled."), this.translateService.instant('Rescheduling failed!'));
    } else {
      this.coreService.openRescheduleAppointmentModal(appointment).subscribe((res: RescheduleAppointmentModalResponseModel) => {
        if (res) {
          let newSlot = res;
          this.coreService.openRescheduleAppointmentConfirmModal({ appointment, newSlot }).subscribe((result: boolean) => {
            if (result) {
              appointment.appointmentId = appointment.id;
              appointment.slotDate = moment(newSlot.date, "YYYY-MM-DD").format('DD/MM/YYYY');
              appointment.slotTime = newSlot.slot;
              this.appointmentService.rescheduleAppointment(appointment).subscribe((res: ApiResponseModel) => {
                const message = res.message;
                if (res.status) {
                  this.mindmapService.notifyHwForRescheduleAppointment(appointment)
                  this.getAppointments();
                  this.toastr.success("The appointment has been rescheduled successfully!", 'Rescheduling successful!');
                } else {
                  this.toastr.success(message, 'Rescheduling failed!');
                }
              });
            }
          })
        }
      });
    }
  }

  /**
  * Cancel appointment
  * @param {AppointmentModel} appointment - Appointment to be rescheduled
  * @return {void}
  */
  cancel(appointment: AppointmentModel) {
    if(appointment.visitStatus == 'Visit In Progress') {
      this.toastr.error(this.translateService.instant("Visit is in progress, it can't be cancelled."), this.translateService.instant('Canceling failed!'));
      return;
    }
    this.coreService.openConfirmCancelAppointmentModal(appointment).subscribe((res: boolean) => {
      if (res) {
        this.toastr.success("The Appointment has been successfully canceled.", 'Canceling successful');
        this.getAppointments();
      }
    });
  }

  /**
  * Play notification sound
  * @return {void}
  */
  playNotify() {
    const audioUrl = "assets/notification.mp3";
    new Audio(audioUrl).play();
  }

  /**
  * Clear filter from a datasource 1
  * @return {void}
  */
  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
    this.isFilterApplied1 = true;
  }

  /**
  * Clear filter from a datasource 2
  * @return {void}
  */
  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    this.tempPaginator1.firstPage();
    this.priorityPaginator?.firstPage();
    this.isFilterApplied2 = true;
  }

  /**
  * Clear filter from a datasource 3
  * @return {void}
  */
  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    this.tempPaginator2?.firstPage();
    this.awaitingPaginator?.firstPage();
    this.isFilterApplied3 = true;
  }

  /**
  * Clear filter from a datasource 4
  * @return {void}
  */
  applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    this.tempPaginator3.firstPage();
    this.inprogressPaginator?.firstPage();
    this.isFilterApplied4 = true;
  }

  /**
  * Clear filter from a given datasource
  * @param {string} dataSource - Datasource name
  * @return {void}
  */
  clearFilter(dataSource: string) {
    switch (dataSource) {
      case 'Appointment':
        this.dataSource1.filter = null;
        this.apSearchElement.nativeElement.value = "";
        this.isFilterApplied1 = false;
        break;
      case 'Priority':
        this.dataSource2.filter = null;
        this.prSearchElement.nativeElement.value = "";
        this.isFilterApplied2 = false;
        break;
      case 'Awaiting':
        this.dataSource3.filter = null;
        this.awSearchElement.nativeElement.value = "";
        this.isFilterApplied3 = false;
        break;
      case 'In-progress':
        this.dataSource4.filter = null;
        this.ipSearchElement.nativeElement.value = "";
        this.isFilterApplied4 = false;
        break;
      default:
        break;
    }
  }

  checkPatientRegField(fieldName: string): boolean{
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  scrollToPanel(panelId: string) {
    const element = document.getElementById(panelId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
  * Get provider uuid from localstorage provider
  * @return {string} - Provider uuid
  */
  get providerId(): string {
    return getCacheData(true, doctorDetails.PROVIDER).uuid;
  } 
  /**
  * Get whatsapp link
  * @return {string} - Whatsapp link
  */
  getWhatsAppLink(telephoneNumber: string): string {
    return this.visitService.getWhatsappLink(telephoneNumber);
  }

  getTelephoneNumber(person: AppointmentModel['visit']['person']): any {
    return person?.person_attribute.find((v: { person_attribute_type_id: number; }) => v.person_attribute_type_id == 8)?.value;
  }

  closeMenu() {
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
  }

  setMode(mode: 'date' | 'range') {
    this.mode = mode;
  }

  formatDate(date: any): string {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  

  convertToDate(relativeTime: string): string {
    const now = new Date();
    const [value, unit] = relativeTime.split(' ');
    const amount = parseInt(value, 10);
  
    if (['hour', 'hours'].includes(unit.toLowerCase())) now.setHours(now.getHours() - amount);
    else if (['minute', 'minutes'].includes(unit.toLowerCase())) now.setMinutes(now.getMinutes() - amount);
    else if (['day', 'days'].includes(unit.toLowerCase())) now.setDate(now.getDate() - amount);
    else throw new Error('Invalid time unit. Only "hours", "minutes", or "days" are supported.');
  
    return now.toISOString().split('T')[0];
  }

  applyDateOrRangeFilter1() {
    const selectedDate = this.filteredDateAndRangeForm1.get('date')?.value;
    const startDate = this.filteredDateAndRangeForm1.get('startDate')?.value;
    const endDate = this.filteredDateAndRangeForm1.get('endDate')?.value;
  
    if (selectedDate) {
      const formattedDate = this.formatDate(selectedDate);

      this.dataSource1.filterPredicate = (data: any, filter: string) => {
        const itemDate = this.formatDate(data.slotJsDate);
        return itemDate === filter;
      };
      this.dataSource1.filter = formattedDate;
    } else if (startDate && endDate) {
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
  
      this.dataSource1.filterPredicate = (data: any, filter: string) => {
        const itemDate = this.formatDate(data.slotJsDate);
        return itemDate >= formattedStartDate && itemDate <= formattedEndDate;
      };
      this.dataSource1.filter = `${formattedStartDate}:${formattedEndDate}`;
    } else {
      this.dataSource1.filter = '';
    }
    this.tempPaginator3.firstPage();
    this.inprogressPaginator?.firstPage();
    this.closeMenu();
  }

  applyDateOrRangeFilter2() {
    const selectedDate = this.filteredDateAndRangeForm2.get('date')?.value;
    const startDate = this.filteredDateAndRangeForm2.get('startDate')?.value;
    const endDate = this.filteredDateAndRangeForm2.get('endDate')?.value;
  
    if (selectedDate) {
      const formattedDate = this.formatDate(selectedDate);
      
      this.dataSource2.filterPredicate = (data: any, filter: string) => {
        const itemDate = data.visit_created.includes(',') ? this.formatDate(data.visit_created) : this.convertToDate(data.visit_created);
        return itemDate === filter;
      };
      this.dataSource2.filter = formattedDate;
    } else if (startDate && endDate) {
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
  
      this.dataSource2.filterPredicate = (data: any, filter: string) => {
        const itemDate = data.visit_created.includes(',') ? this.formatDate(data.visit_created) : this.convertToDate(data.visit_created);
        return itemDate >= formattedStartDate && itemDate <= formattedEndDate;
      };
      this.dataSource2.filter = `${formattedStartDate}:${formattedEndDate}`;
    } else {
      this.dataSource2.filter = '';
    }
    this.tempPaginator3.firstPage();
    this.priorityPaginator?.firstPage();
    this.closeMenu();
  }

  applyDateOrRangeFilter3() {    
    const selectedDate = this.filteredDateAndRangeForm3.get('date')?.value;
    const startDate = this.filteredDateAndRangeForm3.get('startDate')?.value;
    const endDate = this.filteredDateAndRangeForm3.get('endDate')?.value;
  
    if (selectedDate) {
      const formattedDate = this.formatDate(selectedDate);
      
      this.dataSource3.filterPredicate = (data: any, filter: string) => {
        const itemDate = data.visit_created.includes(',') ? this.formatDate(data.visit_created) : this.convertToDate(data.visit_created);
        return itemDate === filter;
      };
      this.dataSource3.filter = formattedDate;
    } else if (startDate && endDate) {
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
  
      this.dataSource3.filterPredicate = (data: any, filter: string) => {
        const itemDate = data.visit_created.includes(',') ? this.formatDate(data.visit_created) : this.convertToDate(data.visit_created);
        return itemDate >= formattedStartDate && itemDate <= formattedEndDate;
      };
      this.dataSource3.filter = `${formattedStartDate}:${formattedEndDate}`;
    } else {
      this.dataSource3.filter = '';
    }
    this.tempPaginator3.firstPage();
    this.awaitingPaginator?.firstPage();
    this.closeMenu();
  }

  applyDateOrRangeFilter4() {
    const selectedDate = this.filteredDateAndRangeForm4.get('date')?.value;
    const startDate = this.filteredDateAndRangeForm4.get('startDate')?.value;
    const endDate = this.filteredDateAndRangeForm4.get('endDate')?.value;
    
    if (selectedDate) {
      const formattedDate = this.formatDate(selectedDate);

      this.dataSource4.filterPredicate = (data: any, filter: string) => {
        const itemDate = data.prescription_started.includes(',') ? this.formatDate(data.prescription_started) : this.convertToDate(data.prescription_started);
        return itemDate === filter;
      };
      this.dataSource4.filter = formattedDate;
    } else if (startDate && endDate) {
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
  
      this.dataSource4.filterPredicate = (data: any, filter: string) => {
        const itemDate = data.prescription_started.includes(',') ? this.formatDate(data.prescription_started) : this.convertToDate(data.prescription_started);
        return itemDate >= formattedStartDate && itemDate <= formattedEndDate;
      };
      this.dataSource4.filter = `${formattedStartDate}:${formattedEndDate}`;
    } else {
      this.dataSource4.filter = '';
    }
    this.tempPaginator3.firstPage();
    this.inprogressPaginator?.firstPage();
    this.closeMenu();
  }
  
  resetDate1(flag:boolean = false) {
    this.filteredDateAndRangeForm1.reset();
    this.dataSource1.filter = '';
    this.dataSource1.filterPredicate = (data: any, filter: string) => true;
    if(!flag){
      this.closeMenu();
    }
  }

  resetDate2(flag:boolean = false) {
    this.filteredDateAndRangeForm2.reset();
    this.dataSource2.filter = '';
    this.dataSource2.filterPredicate = (data: any, filter: string) => true;
    this.tempPaginator1.firstPage();
    this.priorityPaginator?.firstPage();
    if(!flag){
      this.closeMenu();
    }
  }

  resetDate3(flag:boolean = false) {
    this.filteredDateAndRangeForm3.reset();
    this.dataSource3.filter = '';
    this.dataSource3.filterPredicate = (data: any, filter: string) => true;
    this.tempPaginator2.firstPage();
    this.awaitingPaginator?.firstPage();
    if(!flag){
      this.closeMenu();
    }
  }

  resetDate4(flag:boolean = false) {    
    this.filteredDateAndRangeForm4.reset();
    this.dataSource4.filter = '';
    this.dataSource4.filterPredicate = (data: any, filter: string) => true;
    this.tempPaginator3.firstPage();
    this.inprogressPaginator?.firstPage();
    if(!flag){
      this.closeMenu();
    }
  }
}
