import { Component, ElementRef, OnInit, ViewChild, Input, SimpleChanges,EventEmitter ,Output} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiResponseModel, AppointmentModel, CustomEncounterModel, CustomObsModel, CustomVisitModel, ProviderAttributeModel, RescheduleAppointmentModalResponseModel } from '../../model/model';
import { AppointmentService } from '../../services/appointment.service';
import { VisitService } from '../../services/visit.service';
// import * as moment from 'moment';
import moment from 'moment';
import { CoreService } from '../../services/core.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData, checkIfDateOldThanOneDay } from '../../utils/utility-functions';
import { doctorDetails, languages, visitTypes } from '../../config/constant';
// import { AppConfigService } from '../services/app-config.service';
import { MindmapService } from '../../services/mindmap.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { formatDate } from '@angular/common';

@Component({
  selector: 'lib-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  
  @Input() pluginConfigObs: any;
  displayedAppointmentColumns: any = [];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();
  patientRegFields: string[] = [];
  isMCCUser = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('searchInput', { static: true }) searchElement: ElementRef;
  filteredDateAndRangeForm1: FormGroup;
  @ViewChild('tempPaginator') tempPaginator: MatPaginator;
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  panelExpanded: boolean = true;
  mode: 'date' | 'range' = 'date';
  maxDate: Date = new Date();

  appointments: AppointmentModel[] = [];
  priorityVisits: CustomVisitModel[] = [];
  awaitingVisits: CustomVisitModel[] = [];
  inProgressVisits: CustomVisitModel[] = [];
  completedVisits: CustomVisitModel[] = [];
  followUpVisits: CustomVisitModel[] = [];

  specialization: string = '';
  visitsLengthCount: number = 0;
  isFilterApplied = false;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private coreService: CoreService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private mindmapService: MindmapService,
    private sanitizer: DomSanitizer
    // private appConfigService: AppConfigService
  ) { 
      // Object.keys(this.appConfigService.patient_registration).forEach(obj=>{
      //   this.patientRegFields.push(...this.appConfigService.patient_registration[obj].filter(e=>e.is_enabled).map(e=>e.name));
      // }); 
      this.filteredDateAndRangeForm1 = this.createFilteredDateRangeForm();
      this.displayedColumns = this.displayedColumns.filter(col=>(col!=='age' || this.checkPatientRegField('Age')));
  }

  createFilteredDateRangeForm(): FormGroup {
    return new FormGroup({
      date: new FormControl('', [Validators.required]),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
    });
  }

  ngOnInit(): void {
    console.log("this.pluginConfig",this.pluginConfigObs)
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    let provider = getCacheData(true, doctorDetails.PROVIDER);
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "Appointment"){
        this.getAppointments();
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "Awaitings"){
        this.getAwaitingVisits(1);
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "Priority"){
        this.getPriorityVisits(1);
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "InProgress"){
        this.getInProgressVisits(1);
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "Completed"){
        this.getCompletedVisits();
      }if(this.pluginConfigObs?.pluginConfigObsFlag === "FollowUp"){
        this.getFollowUpVisit();
      }
    }
  }

  /**
   * Dynmaic label Display
   * @param changes pluginConfigObs 
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["pluginConfigObs"] && changes["pluginConfigObs"].currentValue) {
      this.displayedAppointmentColumns = this.pluginConfigObs.tableColumns || [];
      this.displayedColumns = this.displayedAppointmentColumns.map(
        (column) => column.key
      );
    }
  }

  /**
   * Get the patient type style
   * @param type 
   */

  getPatientTypeStyle(type: string): { color: string; backgroundColor: string } {
    const typeConfig = this.pluginConfigObs.patientType.find((t: any) => t.key === type);
    return typeConfig
      ? typeConfig.style
      : { color: "#000", backgroundColor: "#ccc" }; // Default fallback styling
  }

  /**
   * Get the patient type either new or old 
   * @param type 
   */
  getPatientTypeLabel(type: string): string {
    const typeConfig = this.pluginConfigObs.patientType.find((t: any) => t.key === type);
    return typeConfig ? typeConfig.label : "Unknown"; // Default fallback label
  }

  getVisitTypeStyle(type: string): { color: string; backgroundColor: string } {
    const visitType = this.pluginConfigObs.visitType.find((v: any) => v.type === type);
    return visitType?.[type]?.style || { color: "#000", backgroundColor: "#ccc" }; // Default style
  }

  getVisitTypeLabel(type: string): string {
    const visitType = this.pluginConfigObs.visitType.find((v: any) => v.type === type);
    return visitType?.[type]?.label || "Unknown"; // Default label
  }

  getVisitTypeIcon(type: string): string {
    const visitType = this.pluginConfigObs.visitType.find((v: any) => v.type === type);
    return visitType?.[type]?.style?.icon || ""; // Default empty icon
  }

  formatVisitDate(date: string): string {
    return date ? formatDate(date, 'dd MMM, yyyy', 'en-US') : '';
  }


 

  /**
  * Retreive the chief complaints for the visit
  * @param {CustomVisitModel} visit - Visit
  * @return {string[]} - Chief complaints array
  */
  getCheifComplaint(visit: CustomVisitModel): string[] {
    let recent: string[] = [];
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach((currentObs: CustomObsModel) => {
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
  * Check how old the date is from now
  * @param {string} data - Date in string format
  * @return {string} - Returns how old the date is from now
  */
  checkIfDateOldThanOneDay(data: string) {
    let hours = moment(data).diff(moment(), 'hours');
    let minutes = moment(data).diff(moment(), 'minutes');
    if(hours > 24) {
      return moment(data).format('DD MMM, YYYY hh:mm A');
    };
    if (hours < 1) {
      if(minutes < 0) return `Due : ${moment(data).format('DD MMM, YYYY hh:mm A')}`;
      return `${minutes} minutes`;
    }
    return `${hours} hrs`;
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
      this.toastr.error(this.translateService.instant("Visit is already completed, it can't be rescheduled."), this.translateService.instant('Rescheduling failed!'));
    } else if(appointment.visitStatus == 'Visit In Progress') {
      this.toastr.error(this.translateService.instant("Visit is in progress, it can't be rescheduled."), this.translateService.instant('Rescheduling failed!'));
    } else {
      this.coreService.openRescheduleAppointmentModal(this.pluginConfigObs.mindmapURL, appointment).subscribe((res: RescheduleAppointmentModalResponseModel) => {
        if (res) {
          let newSlot = res;
          this.coreService.openRescheduleAppointmentConfirmModal({ appointment, newSlot }).subscribe((result: boolean) => {
            if (result) {
              appointment.appointmentId = appointment.id;
              appointment.slotDate = moment(newSlot.date, "YYYY-MM-DD").format('DD/MM/YYYY');
              appointment.slotTime = newSlot.slot;
              this.appointmentService.rescheduleAppointment(this.pluginConfigObs.mindmapURL, appointment).subscribe((res: ApiResponseModel) => {
                const message = res.message;
                if (res.status) {
                  this.mindmapService.notifyHwForRescheduleAppointment(this.pluginConfigObs.mindmapURL, appointment)
                  this.getAppointments();
                  this.toastr.success(this.translateService.instant("The appointment has been rescheduled successfully!"), this.translateService.instant('Rescheduling successful!'));
                } else {
                  this.toastr.success(message, this.translateService.instant('Rescheduling failed!'));
                }
              });
            }
          });
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
    this.coreService.openConfirmCancelAppointmentModal(this.pluginConfigObs?.mindmapURL, appointment).subscribe((res: boolean) => {
      if (res) {
        this.toastr.success(this.translateService.instant('The Appointment has been successfully canceled.'),this.translateService.instant('Canceling successful'));
        this.getAppointments();
      }
    });
  }

  /**
  * Get user uuid from localstorage user
  * @return {string} - User uuid
  */
  get userId(): string {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  /**
  * Apply filter on a datasource
  * @param {Event} event - Input's change event
  * @return {void}
  */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.isFilterApplied = true;
  }

  /**
  * Clear filter from a datasource
  * @return {void}
  */
  clearFilter() {
    this.dataSource.filter = null;
    this.searchElement.nativeElement.value = "";
    this.isFilterApplied = false;
  }

  checkPatientRegField(fieldName): boolean{
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  /**
  * Get whatsapp link
  * @return {string} - Whatsapp link
  */
  getWhatsAppLink(telephoneNumber: string): string {
    return this.visitService.getWhatsappLink(telephoneNumber);
  }
  
  getTelephoneNumber(person: AppointmentModel['visit']['person']) {
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

  applyDateOrRangeFilter() {
    const selectedDate = this.filteredDateAndRangeForm1.get('date')?.value;
    const startDate = this.filteredDateAndRangeForm1.get('startDate')?.value;
    const endDate = this.filteredDateAndRangeForm1.get('endDate')?.value;
  
    if (selectedDate) {
      const formattedDate = this.formatDate(selectedDate);

      this.dataSource.filterPredicate = (data: any, filter: string) => {
        const itemDate = this.formatDate(data.slotJsDate);
        return itemDate === filter;
      };
      this.dataSource.filter = formattedDate;
    } else if (startDate && endDate) {
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
  
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        const itemDate = this.formatDate(data.slotJsDate);
        return itemDate >= formattedStartDate && itemDate <= formattedEndDate;
      };
      this.dataSource.filter = `${formattedStartDate}:${formattedEndDate}`;
    } else {
      this.dataSource.filter = '';
    }
    this.tempPaginator.firstPage();
    this.closeMenu();
  }

  resetDate(flag:boolean = false) {
    this.filteredDateAndRangeForm1.reset();
    this.dataSource.filter = '';
    this.dataSource.filterPredicate = (data: any, filter: string) => true;
    if(!flag){
      this.closeMenu();
    }
  }

  getAttributeData(data: any, attributeName: string): { name: string; value: string } | null {
    console.log("data",data)
    if (data?.TMH_patient_id && Array.isArray(data.person_attribute)) {
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
  * Get booked appointments for a logged-in doctor in a current year
  * @return {void}
  */
  getAppointments() {
    this.appointments = [];
    this.appointmentService.getUserSlots(this.pluginConfigObs?.mindmapURL, getCacheData(true, doctorDetails.USER).uuid, moment().startOf('year').format('DD/MM/YYYY'), moment().endOf('year').format('DD/MM/YYYY'))
      .subscribe((res: ApiResponseModel) => {        
        this.visitsLengthCount = res.data?.length
        let appointmentsdata = res.data;
        appointmentsdata.forEach((appointment: AppointmentModel) => {
          if (appointment.status == 'booked' && (appointment.visitStatus == 'Awaiting Consult'||appointment.visitStatus == 'Visit In Progress')) {
            if (appointment.visit) {
              appointment.cheif_complaint = this.getCheifComplaint(appointment.visit);
              appointment.starts_in = checkIfDateOldThanOneDay(appointment.slotJsDate);
              appointment.telephone = this.getTelephoneNumber(appointment?.visit?.person);
              appointment.patient_type = "new-patient"
              appointment.visit_type = [
              {
                "visit_type": "completed",
                "visit_date": "2025-01-07T00:00:00Z"
              },
              {
                "visit_type": "priority"
              },
              {
                "visit_type": "awaiting"
              },
              {
                "visit_type": "inProgress"
              }
            ]
              
              this.appointments.push(appointment);
            }
          }
        });
        this.dataSource.data = [...this.appointments];
        console.log("dataSource",this.dataSource.data)
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = (data, filter: string) => data?.openMrsId.toLowerCase().indexOf(filter) != -1 || data?.patientName.toLowerCase().indexOf(filter) != -1;
      });
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
    console.log(specialization, "From specialization function return");
    
    return specialization;
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
  * Get awaiting visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getAwaitingVisits(page: number = 1) {
    if(page == 1) {
      this.awaitingVisits = [];
      // this.awatingRecordsFetched = 0;
    }    
    this.visitService.getAwaitingVisits(this.pluginConfigObs?.mindmapURL, this.specialization, page).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.visitsLengthCount = res.totalCount
        // this.awatingRecordsFetched += this.offset;
        for (let i = 0; i < res.data.length; i++) {
          let visit = res.data[i];
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z','+0530')) : this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          visit.patient_type = this.getDemarcation(visit?.encounters);
          this.awaitingVisits.push(visit);
        }
        this.dataSource.data = [...this.awaitingVisits];
        console.log(this.dataSource.data, );
        
        if (page == 1) {
          this.dataSource.paginator = this.tempPaginator;
          this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator.length = this.awaitingVisits.length;
          this.tempPaginator.nextPage();
        }
      }
    });
  }

  /**
  * Get inprogress visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getInProgressVisits(page: number = 1) {
    console.log("In progress visit")
    if(page == 1) {
      this.inProgressVisits = [];
      // this.inprogressRecordsFetched = 0;
    }
    this.visitService.getInProgressVisits(this.pluginConfigObs?.mindmapURL, this.specialization, page).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.visitsLengthCount = res.totalCount;
        // this.inprogressVisitsCount = iv.totalCount;
        // this.inprogressRecordsFetched += this.offset;
        for (let i = 0; i < res.data.length; i++) {
          let visit = res.data[i];
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z','+0530')) : this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.prescription_started = this.getEncounterCreated(visit, visitTypes.VISIT_NOTE);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          visit.patientName = visit?.person?.age
          visit.patientAge = visit?.person?.age
          visit.TMH_patient_id = this.getAttributeData(visit, "TMH Case Number");
          console.log("visit",visit)
          console.log("visit 1",visit?.TMH_patient_id?.value)
          this.inProgressVisits.push(visit);
        }
        this.dataSource.data = [...this.inProgressVisits];
        console.log("data Source",this.dataSource.data)
        if (page == 1) {
          this.dataSource.paginator = this.tempPaginator;
          this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator.length = this.inProgressVisits.length;
          this.tempPaginator.nextPage();
        }
      }
    });
  }

  /**
  * Get priority visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getPriorityVisits(page: number = 1) {
    if(page == 1) {
      this.priorityVisits = [];
      // this.priorityRecordsFetched = 0;
    }
    this.visitService.getPriorityVisits(this.pluginConfigObs?.mindmapURL, this.specialization, page).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.visitsLengthCount = res.totalCount;
        // this.priorityVisitsCount = res.totalCount;
        // this.priorityRecordsFetched += this.offset;
        for (let i = 0; i < res.data.length; i++) {
          let visit = res.data[i];
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z','+0530')) : this.getEncounterCreated(visit, visitTypes.FLAGGED);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          this.priorityVisits.push(visit);
        }
        this.dataSource.data = [...this.priorityVisits];
        if (page == 1) {
          this.dataSource.paginator = this.tempPaginator;
          this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator.length = this.priorityVisits.length;
          this.tempPaginator.nextPage();
        }
      }
    });
  }

    /**
   * Get completed visits count
   * @return {void}
   */
  getCompletedVisits(page: number = 1) {
    this.visitService.getEndedVisits(this.pluginConfigObs?.mindmapURL, this.specialization, page).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.visitsLengthCount = res.totalCount;
        // this.completedVisitsCount = res.totalCount;
        // this.completedRecordsFetched += this.offset;
        for (let i = 0; i < res.data.length; i++) {
          let visit = res.data[i];
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z', '+0530')) : this.getEncounterCreated(visit, visitTypes.COMPLETED_VISIT);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          visit.completed = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z', '+0530')) : this.getEncounterCreated(visit, visitTypes.VISIT_COMPLETE);
          visit.TMH_patient_id = this.getAttributeData(visit, "TMH Case Number");
          this.completedVisits.push(visit);
        }
        this.dataSource.data = [...this.completedVisits];
        if (page == 1) {
          this.dataSource.paginator = this.tempPaginator;
          this.dataSource.filterPredicate = (data: { patient: { identifier: string; }; patient_name: { given_name: string; middle_name: string; family_name: string; }; }, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator.length = this.completedVisits.length;
          this.tempPaginator.nextPage();
        }
      }
    });
  }

    /**
  * Get follow-up visits for a logged-in doctor
  * @return {void}
  */
  getFollowUpVisit(page: number = 1) {
    this.visitService.getFollowUpVisits(this.pluginConfigObs?.mindmapURL, this.specialization).subscribe({
      next: (res: ApiResponseModel) => {
        if (res.success) {
          // this.followUpVisitsCount = 0;
          // this.completedRecordsFetched += this.offset;
          for (let i = 0; i < res.data.length; i++) {
            let visit = res.data[i];
            if (visit?.encounters?.length) {
              // this.followUpVisitsCount += 1;
              this.visitsLengthCount += 1;
              visit.cheif_complaint = this.getCheifComplaint(visit);
              visit.visit_created = visit?.date_created ? this.getCreatedAt(visit.date_created.replace('Z', '+0530')) : this.getEncounterCreated(visit, visitTypes.COMPLETED_VISIT);
              visit.person.age = this.calculateAge(visit.person.birthdate);
              visit.completed = this.getEncounterCreated(visit, visitTypes.VISIT_COMPLETE);
              visit.followUp = this.getEncounterObs(visit.encounters, visitTypes.VISIT_NOTE, 163345/*Follow-up*/)?.value_text;
              this.followUpVisits.push(visit);
            }
          }
          this.dataSource.data = [...this.followUpVisits];
          if (page == 1) {
            this.dataSource.paginator = this.tempPaginator;
            this.dataSource.filterPredicate = (data: { patient: { identifier: string; }; patient_name: { given_name: string; middle_name: string; family_name: string; }; }, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name && this.checkPatientRegField('Middle Name') ? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
          } else {
            this.tempPaginator.length = this.followUpVisits.length;
            this.tempPaginator.nextPage();
          }
        }
      }
    });
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
  
  renderHtmlContent(column:any, element:any): string {
    return typeof column.formatHtml === 'function' ? this.sanitizer.bypassSecurityTrustHtml(column.formatHtml(element)) : element[column.key];
  }

  getClasses(column:any){
    return column.classList ? column.classList.join(" ") : "";
  }

}

