import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-completed-visits',
  templateUrl: './completed-visits.component.html',
  styleUrls: ['./completed-visits.component.scss']
})
export class CompletedVisitsComponent {
  @Input() completedVisitsCount: number = 0;
  @Input() patientRegFields: string[] = [];
  @ViewChild('ipSearchInput', { static: true }) public ipSearchElement: ElementRef;

  @ViewChild('tempPaginator') public paginator: MatPaginator;

  baseUrl: string = environment.baseURL;
  displayedColumns: string[] = ['name', 'age', 'location', 'cheif_complaint', 'visit_completed'];
  tblDataSource: any = new MatTableDataSource<any>([]);

  checkPatientRegField(fieldName): boolean {
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  /**
  * Clear filter from a datasource
  * @return {void}
  */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tblDataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.firstPage();
  }

  /**
  * Clear filter from a given datasource
  * @return {void}
  */
  clearFilter() {
    this.tblDataSource.filter = null;
    this.ipSearchElement.nativeElement.value = "";
  }
}
