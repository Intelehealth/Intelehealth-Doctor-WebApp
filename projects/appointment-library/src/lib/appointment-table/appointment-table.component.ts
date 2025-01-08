import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ChangeDetectorRef,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { AppointmentModel } from "./model";

@Component({
  selector: "lib-appointment-table",
  templateUrl: "./appointment-table.component.html",
  styleUrls: ["./appointment-table.component.scss"],
})
export class AppointmentTableComponent implements OnInit {
  @Output() rescheduleAppointment = new EventEmitter<AppointmentModel>();
  @Output() cancelAppointment = new EventEmitter<AppointmentModel>();

  @Input() appointmentVisitsCount: number = 0;
  @Input() tableHeaders: string;
  @Input() patientRegFields: string[] = [];

  @ViewChild("ipSearchInput", { static: true })
  public ipSearchElement: ElementRef;

  @ViewChild("tempPaginator") public paginator: MatPaginator;

  // @Input() appointmentsColumns: any = [];
  @Input() pluginConfig: any;
  displayedColumns: string[] = [];
  appointmentsColumns: any = [];

  // displayedColumns: string[] = [
  //   "name",
  //   "age",
  //   "starts_in",
  //   "location",
  //   "cheif_complaint",
  //   "telephone",
  //   "actions",
  // ];
  // Extract the keys for use in the template

  tblDataSource: any = new MatTableDataSource<any>([]);

  ngOnInit(): void {
    console.log("pluginConfig", this.pluginConfig);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["pluginConfig"] && changes["pluginConfig"].currentValue) {
      this.appointmentsColumns = this.pluginConfig.tableColumns || [];
      this.displayedColumns = this.appointmentsColumns.map(
        (column) => column.key
      );
      console.log("Updated appointmentsColumns:", this.appointmentsColumns);
      console.log("Updated displayedColumns:", this.displayedColumns);
    }
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
