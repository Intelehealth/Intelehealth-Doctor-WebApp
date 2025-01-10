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
  appointments: AppointmentModel[] = [];
  patientRegFields: string[] = [];
  isMCCUser = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('searchInput', { static: true }) searchElement: ElementRef;
  filteredDateAndRangeForm1: FormGroup;
  @ViewChild('tempPaginator') tempPaginator: MatPaginator;
  @ViewChild('appointmentPaginator') appointmentPaginator: MatPaginator;
  @ViewChild('inprogressPaginator') inprogressPaginator: MatPaginator;
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  panelExpanded: boolean = true;
  mode: 'date' | 'range' = 'date';
  maxDate: Date = new Date();
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
    console.log("this.pluginConfig",this.pluginConfig)
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.getAppointments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["pluginConfigObs"] && changes["pluginConfigObs"].currentValue) {
      this.displayedAppointmentColumns = this.pluginConfigObs.tableColumns || [];
      this.displayedColumns = this.displayedAppointmentColumns.map(
        (column) => column.key
      );
    }
  }

 

  /**
  * Get booked appointments for a logged-in doctor in a current year
  * @return {void}
  */
  getAppointments() {
    this.appointments = [];
    this.appointmentService.getUserSlots(this.pluginConfigObs?.mindmapURL, getCacheData(true, doctorDetails.USER).uuid, moment().startOf('year').format('DD/MM/YYYY'), moment().endOf('year').format('DD/MM/YYYY'))
      .subscribe((res: ApiResponseModel) => {
        let appointmentsdata = res.data;
        appointmentsdata.forEach((appointment: AppointmentModel) => {
          if (appointment.status == 'booked' && (appointment.visitStatus == 'Awaiting Consult'||appointment.visitStatus == 'Visit In Progress')) {
            if (appointment.visit) {
              appointment.cheif_complaint = this.getCheifComplaint(appointment.visit);
              appointment.starts_in = checkIfDateOldThanOneDay(appointment.slotJsDate);
              appointment.telephone = this.getTelephoneNumber(appointment?.visit?.person)
              this.appointments.push(appointment);
            }
          }
        });
        this.dataSource.data = [...this.appointments];
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = (data, filter: string) => data?.openMrsId.toLowerCase().indexOf(filter) != -1 || data?.patientName.toLowerCase().indexOf(filter) != -1;
      });
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
  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
  * Clear filter from a datasource
  * @return {void}
  */
  clearFilter() {
    this.dataSource.filter = null;
    this.searchElement.nativeElement.value = "";
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
    this.appointmentPaginator?.firstPage();
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
}

