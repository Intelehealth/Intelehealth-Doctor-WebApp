import { Component, ElementRef, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppointmentModel } from './model';


@Component({
  selector: 'lib-appointment-table',
  templateUrl: './appointment-table.component.html',
  styleUrls: ['./appointment-table.component.scss']
})
export class AppointmentTableComponent implements OnInit {

  @Output() rescheduleAppointment = new EventEmitter<AppointmentModel>();
  @Output() cancelAppointment = new EventEmitter<AppointmentModel>();
  
  @Input() appointmentVisitsCount: number = 0;
  @Input() patientRegFields: string[] = [];
  @ViewChild('ipSearchInput', { static: true }) public ipSearchElement: ElementRef;

  @ViewChild('tempPaginator') public paginator: MatPaginator;

  displayedColumns: string[] = ['name', 'age', 'starts_in', 'location', 'cheif_complaint', 'telephone', 'actions'];
  tblDataSource: any = new MatTableDataSource<any>([]);

  ngOnInit(): void {
    
  }

  checkPatientRegField(fieldName): boolean {
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tblDataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.firstPage();
  }

  clearFilter() {
    this.tblDataSource.filter = null;
    this.ipSearchElement.nativeElement.value = "";
  }

  reschedule(appointment: AppointmentModel) {
    this.rescheduleAppointment.emit(appointment);
  }

  cancel(appointment: AppointmentModel) {
    this.cancelAppointment.emit(appointment);
  }
}

