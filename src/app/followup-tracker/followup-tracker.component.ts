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
 displayedColumns: string[] = ['name', 'age', 'doctor_name', 'cheif_complaint', 'followUp_date', 'patient_verdict'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  @Input() doctorFollowUpVisits: CustomVisitModel[] = [];
  @Input() doctorFollowpCount: number = 0;
  @ViewChild('completedPaginator') paginator: MatPaginator;
  offset: number = environment.recordsPerPage;
  recordsFetched: number = environment.recordsPerPage;
  pageEvent: PageEvent;
  pageIndex:number = 0;
  pageSize:number = 5;
  visitsCount: number = 0;
  specialization : string = '';
  @Output() fetchPageEvent = new EventEmitter<number>();
  @ViewChild('tempPaginator') tempPaginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  showDate: boolean = true;
  showRange: boolean = false;
  today = new Date().toISOString().slice(0, 10);
  fromDate: string;
  toDate: string;
  
  constructor(private pageTitleService: PageTitleService, private visitService:VisitService) { }
  
  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Follow Up Tracker", imgUrl: "assets/svgs/follow-up-tracker.svg" });
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
   if(page == 1) this.doctorFollowUpVisits = [];
       this.visitService.getEndedVisits(this.specialization, page).subscribe((ps: ApiResponseModel) => {
         if (ps.success) {
          console.log(ps.data);
            let record = [];
           for (let i = 0; i < ps.data.length; i++) {
             let visit = ps.data[i];
             let followUp_date = this.visitService.getFollowupDate(visit, visitTypes.VISIT_NOTE);
             if(followUp_date) {
            //  visit.cheif_complaint = this.visitService.getCheifComplaint1(visit);
              visit.person.age = this.visitService.calculateAge(visit.person.birthdate);
              visit.followUp_date = followUp_date;
               record.push(visit);
             }
            
            //  if(vcenc?.encounter_provider?.provider.uuid === uuid) {
            //    record.push(visit);
            //  }
           }
           this.doctorFollowpCount = record.length;
           this.doctorFollowUpVisits = this.doctorFollowUpVisits.concat(record);
           this.dataSource = new MatTableDataSource(this.doctorFollowUpVisits);
           this.dataSource.paginator = this.tempPaginator;
           this.visitsCount = this.doctorFollowpCount;
           this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
           this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
         }
       });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.tempPaginator;
    this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
    this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (!changes.doctorCompletedVisits.firstChange) {
    //   this.recordsFetched += this.offset;
    //   this.dataSource.data = [...this.doctorCompletedVisits];
    //   this.tempPaginator.length = this.doctorCompletedVisits.length;
    //   this.tempPaginator.nextPage();
    //   this.visitsCount = this.doctorFollowpCount;
    //   }
  }

  /**
  * Callback for page change event and Get visit for a selected page index and page size
  * @param {PageEvent} event - onerror event
  * @return {void}
  */
  public getData(event?:PageEvent){
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.dataSource.filter) {
      this.paginator.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize) > this.recordsFetched) {
      this.fetchPageEvent.emit((this.recordsFetched+this.offset)/this.offset)
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

  applyDateFilter() {
    let filteredVisits :CustomVisitModel[] = [];
    // this.visitsCount = 0;
    // if(this.fromDate && this.toDate) {
    //   filteredVisits = this.doctorCompletedVisits.filter((visit) => {
    //     return (new Date(visit.date_created).toISOString().slice(0, 10) >= this.fromDate &&
    //      new Date(visit.date_created).toISOString().slice(0, 10) <= this.toDate);
    //   });
    // } else {
    //   filteredVisits = this.doctorCompletedVisits.filter((visit) => {
    //     return new Date(visit.date_created).toISOString().slice(0, 10) == this.fromDate;
    //   });
    // }
    // this.dataSource.data = [...filteredVisits];
    // this.tempPaginator.length = this.doctorCompletedVisits.length;
    // this.tempPaginator.nextPage();
    // this.visitsCount = filteredVisits.length;
    // this.trigger.closeMenu();
  }

  resetFilter() {
    // this.dataSource.data = [...this.doctorCompletedVisits];
    // this.tempPaginator.length = this.doctorCompletedVisits.length;
    // this.tempPaginator.nextPage();
    // this.visitsCount = this.doctorCompletedVisits.length;
    // this.trigger.closeMenu();
    // this.fromDate = null;
    // this.toDate = null;
  }
}
