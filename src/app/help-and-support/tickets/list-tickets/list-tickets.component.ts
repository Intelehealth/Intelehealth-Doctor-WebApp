import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { PagerdutyList, PagerdutyModel } from 'src/app/model/model';
import { CoreService } from 'src/app/services/core/core.service';
import { PagerdutyService } from 'src/app/services/pagerduty.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-list-tickets',
  templateUrl: './list-tickets.component.html',
  styleUrls: ['./list-tickets.component.scss']
})
export class ListTicketsComponent {
  displayedColumns : string[] = ['id', 'title', 'createdAt', 'updatedAt', 'priority', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('ticketPaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ticketData: PagerdutyModel[] = [];
  totalData: number;
  pageIndex: number = 0;
  pageSize: number = 5;
  openTicketsCount: number = 0;
  statuses = { 'triggered' : 'To Do', 'resolved': "Done", "acknowledged": "In Progress" };
  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;

  constructor(
    private translateService: TranslateService,
    private pagerdutyService: PagerdutyService,
    private modalService: CoreService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.getAllTickets();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.applyFilter();
  }

  /**
  * Get Tickets
  * @return {void}
  */
  getAllTickets(search:string=""): void{
    this.pagerdutyService.getAllTickets(this.pageIndex+1, this.pageSize, search).subscribe((res:PagerdutyList)=>{
      this.ticketData = res.tickets;
      this.dataSource = new MatTableDataSource(this.ticketData);
      this.pageIndex = res.currentPage - 1;
      this.totalData = res.totalItems;
      this.openTicketsCount = res.openItems ? res.openItems : 0;
      this.dataSource.sort = this.sort;
    })
  }

  getTableData(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAllTickets();
  }

  createTicket(){
    this.modalService.openAddTicketModal().subscribe((result) => {
      if(result){
        this.getAllTickets();
        this.toastr.success('Ticket has been raised successfully!', 'Ticket raised');      
      }
    });
  }

  /**
  * Clear filter from a datasource 1
  * @return {void}
  */
  applyFilter(): void {
    fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      // get value
      map((event: any) => event.target.value)
      // Time in milliseconds between key events
      ,debounceTime(500)        
      // If previous query is diffent from current   
      ,distinctUntilChanged()
      ).subscribe((res:string) => {
        this.getAllTickets(res);
      });
  }

    /**
  * Clear filter from a given datasource
  * @param {string} dataSource - Datasource name
  * @return {void}
  */
  clearFilter(): void {
    this.searchInput.nativeElement.value = "";
    this.getAllTickets();
  }
}


