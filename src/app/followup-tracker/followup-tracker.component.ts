import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { ApiResponseModel, CustomVisitModel, ProviderAttributeModel } from '../model/model';
import { PageTitleService } from '../core/page-title/page-title.service';
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { VisitService } from '../services/visit.service';

@Component({
  selector: 'app-followup-tracker',
  templateUrl: './followup-tracker.component.html',
  styleUrls: ['./followup-tracker.component.scss']
})
export class FollowupTrackerComponent {
  displayedColumns: string[] = ['name', 'age', 'cheif_complaint', 'doctor_name', 'followUp_date', 'patient_verdict'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  doctorFollowUpVisits: CustomVisitModel[] = [];
  filteredFollowUpVisits: CustomVisitModel[] = [];
  doctorFollowpCount: number = 0;
  @ViewChild('completedPaginator') paginator: MatPaginator;
  offset: number = environment.recordsPerPage;
  recordsFetched: number = environment.recordsPerPage;
  pageEvent: PageEvent;
  pageIndex: number = 0;
  pageSize: number = 5;
  visitsCount: number = 0;
  specialization: string = '';
  @Output() fetchPageEvent = new EventEmitter<number>();
  @ViewChild('tempPaginator') tempPaginator: MatPaginator;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  showDate: boolean = true;
  showRange: boolean = false;
  selectAll: boolean = false;
  showAllVisits: boolean = false;
  today = new Date().toISOString().slice(0, 10);
  fromDate: string;
  toDate: string;

  constructor(private pageTitleService: PageTitleService, private visitService: VisitService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Follow-up Log", imgUrl: "assets/svgs/follow-up-tracker.svg" });
    let provider = getCacheData(true, doctorDetails.PROVIDER);
    if (provider) {
      if (provider.attributes.length) {
        provider.attributes.forEach((a: ProviderAttributeModel) => {
          if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
            this.specialization = a.value;
          }
        });
      }
    }
    this.getFollowupVisits();
  }

  getFollowupVisits(page: number = 1) {
    let provider = getCacheData(true, doctorDetails.PROVIDER);
    if (page == 1) this.doctorFollowUpVisits = [], this.filteredFollowUpVisits = [];
    this.visitService.getEndedVisits(this.specialization, page).subscribe((ps: ApiResponseModel) => {
      if (ps.success) {
        for (let i = 0; i < ps.data.length; i++) {
          let visit = ps.data[i];
          let followUp_date = this.visitService.getFollowupDate(visit, visitTypes.VISIT_NOTE);
          if (followUp_date) {
            this.visitService.recentVisits(visit.person.uuid).subscribe((res) => {
              visit.cheif_complaint = this.visitService.getCheifComplaint1(visit);
              let enco = visit?.encounters.filter(e => e.type.name == visitTypes.PATIENT_EXIT_SURVEY || e.type.name == visitTypes.VISIT_COMPLETE)[0];
              visit.encounter_provider = JSON.parse(enco.obs[0].value_text).name;
              visit.encounter_provider_uuid = JSON.parse(enco.obs[0].value_text).uuid;
              visit.person.age = this.visitService.calculateAge(visit.person.birthdate);
              visit.followup_date = followUp_date;
              const visits = res.results;
              let recentVisit = visits.filter(v => v.uuid !== visit.uuid &&
                v.attributes.filter(a => a.attributeType.display === 'Visit Speciality')[0].value === 'General Physician'
              );
              if (recentVisit.length > 0) {
                 let fvisits = recentVisit.filter(v => ((this.visitService.getCheifComplaint1(v)).includes("Follow up visit") ||
                   (this.visitService.getCheifComplaint1(v)).includes("Follow Up") ||
                    (this.visitService.getCheifComplaint1(v)).includes("Follow-Up")));
                  if(fvisits.length > 0) {
                    let nearestVisit = fvisits[0];
                   let minDiff = Math.abs(new Date(visit.date_stopped).getTime() - new Date(nearestVisit.startDatetime).getTime());
               
                   for (const v of fvisits) {
                     const diff = Math.abs(new Date(visit.date_stopped).getTime() - new Date(v.startDatetime).getTime());
                     if (diff < minDiff) {
                       minDiff = diff;
                       nearestVisit = v;
                     }
                   }
                   visit.patient_verdict =  new Date(visit.date_stopped).getTime() < new Date(nearestVisit.startDatetime).getTime() ?
                    this.visitService.getPatientVerdict(nearestVisit) : null;
                  }
              } else {
                visit.patient_verdict = null;
              }
              this.doctorFollowUpVisits.push(visit);
              this.filteredFollowUpVisits = this.doctorFollowUpVisits.filter((visit) => {
                return visit.encounter_provider_uuid == provider.uuid;
              });
              this.filteredFollowUpVisits.sort((a, b) => new Date(b.followup_date) < new Date(a.followup_date) ? -1 : 1);
              this.doctorFollowpCount = this.filteredFollowUpVisits.length;
              this.dataSource.data = [...this.filteredFollowUpVisits];
              this.dataSource.paginator = this.tempPaginator;
            });
          }
        }
      }
    });
  }

  /**
  * Callback for page change event and Get visit for a selected page index and page size
  * @param {PageEvent} event - onerror event
  * @return {void}
  */
  public getData(event?: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.dataSource.filter) {
      this.paginator.firstPage();
    }
    if (((event.pageIndex + 1) * this.pageSize) > this.recordsFetched) {
      this.fetchPageEvent.emit((this.recordsFetched + this.offset) / this.offset)
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator.nextPage();
      } else {
        this.tempPaginator.previousPage();
      }
    }
    return event;
  }

  /**
  * Apply filter on a datasource
  * @param {Event} event - Input's change event
  * @return {void}
  */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.tempPaginator.firstPage();
    this.paginator.firstPage();
  }

  /**
  * Clear filter from a datasource
  * @return {void}
  */
  clearFilter() {
    this.dataSource.filter = null;
  }

  applyDateFilter(showAllVisits: boolean) {
    let filteredVisits: CustomVisitModel[] = [];
    let visits = this.filteredFollowUpVisits;
    this.doctorFollowpCount = 0;
    if (this.fromDate && this.toDate) {
      filteredVisits = visits.filter((visit) => {
        return (new Date(visit.followup_date).toISOString().slice(0, 10) >= this.fromDate &&
          new Date(visit.followup_date).toISOString().slice(0, 10) <= this.toDate);
      });
    } else if (this.fromDate) {
      filteredVisits = visits.filter((visit) => {
        return new Date(visit.followup_date).toISOString().slice(0, 10) == this.fromDate;
      });
    } else if (showAllVisits) {
      filteredVisits = this.doctorFollowUpVisits;
    }
    filteredVisits.sort((a, b) => new Date(b.followup_date) < new Date(a.followup_date) ? -1 : 1);
    this.dataSource.data = [...filteredVisits];
    this.tempPaginator.length = filteredVisits.length;
    this.tempPaginator.firstPage();
    this.paginator.firstPage();
    this.doctorFollowpCount = filteredVisits.length;
    this.trigger.closeMenu();
  }

  resetFilter() {
    this.dataSource.data = [...this.filteredFollowUpVisits];
    this.tempPaginator.length = this.filteredFollowUpVisits.length;
    this.tempPaginator.firstPage();
    this.paginator.firstPage();
    this.doctorFollowpCount = this.filteredFollowUpVisits.length;
    this.selectAll = false;
    this.trigger.closeMenu();
    this.fromDate = null;
    this.toDate = null;
  }

  /**
   * Get the selected date from the date picker
   *  @return {void}
   * */
  get isDatesValid() {
    return this.fromDate && this.toDate ? new Date(this.fromDate).getTime() > new Date(this.toDate).getTime() : false;
  }

}
