import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sent',
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.scss']
})
export class SentComponent implements OnInit, AfterViewInit, OnChanges {

  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  @Input() prescriptionsSent: any = [];
  @Input() prescriptionsSentCount: number = 0;
  @ViewChild('sentPaginator') paginator: MatPaginator;
  offset: number = 1000;
  recordsFetched: number = 1000;
  pageEvent: PageEvent;
  pageIndex:number = 0;
  pageSize:number = 5;
  @Output() fetchPageEvent = new EventEmitter<number>();
  @ViewChild('tempPaginator') tempPaginator: MatPaginator;

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
    this.translateService.use(localStorage.getItem('selectedLanguage'));
    this.dataSource = new MatTableDataSource(this.prescriptionsSent);
    this.dataSource.filterPredicate = (data: any, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
    this.dataSource.paginator = this.tempPaginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.prescriptionsSent.firstChange) {
      this.recordsFetched += this.offset;
      this.dataSource = new MatTableDataSource(this.prescriptionsSent);
      this.tempPaginator.nextPage();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.tempPaginator;
    this.dataSource.filterPredicate = (data: any, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  public getData(event?:PageEvent){
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.dataSource.filter) {
      this.paginator.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize) > this.recordsFetched) {
      this.fetchPageEvent.emit((this.recordsFetched+this.offset)/this.offset)
    } else {
      // this.dataSource = new MatTableDataSource(this.prescriptionsSent.slice(event.pageIndex*this.pageSize, (event.pageIndex+1)*this.pageSize));
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator.nextPage();
      } else {
        this.tempPaginator.previousPage();
      }
    }
    return event;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.tempPaginator.firstPage();
    this.paginator.firstPage();
  }

}
