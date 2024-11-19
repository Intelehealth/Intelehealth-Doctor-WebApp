import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CustomVisitModel } from 'src/app/model/model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-doctor-completed',
  templateUrl: './doctor-completed.component.html',
  styleUrls: ['./doctor-completed.component.scss']
})
export class DoctorCompleted implements OnInit, AfterViewInit, OnChanges {

  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  @Input() doctorCompletedVisits: CustomVisitModel[] = [];
  @Input() doctorCompletedVisitsCount: number = 0;
  @ViewChild('completedPaginator') paginator: MatPaginator;
  offset: number = environment.recordsPerPage;
  recordsFetched: number = environment.recordsPerPage;
  pageEvent: PageEvent;
  pageIndex:number = 0;
  pageSize:number = 5;
  @Output() fetchPageEvent = new EventEmitter<number>();
  @ViewChild('tempPaginator') tempPaginator: MatPaginator;
  @ViewChild('compSearchInput', { static: true }) searchElement: ElementRef;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.doctorCompletedVisits);
    this.dataSource.paginator = this.tempPaginator;
    this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
    this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.tempPaginator;
    this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
    this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.doctorCompletedVisits.firstChange) {
      this.recordsFetched += this.offset;
      this.dataSource.data = [...this.doctorCompletedVisits];
      this.tempPaginator.length = this.doctorCompletedVisits.length;
      this.tempPaginator.nextPage();
    }
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
    this.searchElement.nativeElement.value = "";
  }

}
