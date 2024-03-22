import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import * as moment from "moment";
import { HelperService } from "src/app/services/helper.service";
import { VisitService } from "src/app/services/visit.service";

@Component({
  selector: "app-tables",
  templateUrl: "./tables.component.html",
  styleUrls: ["./tables.component.css"],
})
export class TablesComponent implements OnInit {
  displayColumns: string[] = [
    "tag",
    "id",
    "name",
    "telephone",
    "gender",
    "age",
    "location",
    "status",
    "provider",
    "lastSeen",
  ];
  dataSource;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() data;
  @Input() tableFor;
  @Input() visitCounts;
  @Output() tableEmitter = new EventEmitter();
  @Output() emptyRow = new EventEmitter();
  @Input() set allVisitsLoaded(val) {
    this.dataLoaded = val;
    if (this.dataLoaded) {
      this.refresh();
    }
  }
  dataLoaded = false;
  loadedDataLength: Number = 0;

  constructor(private service: VisitService, private helper: HelperService) {}

  ngOnInit() {
    this.loadedDataLength = Number(`${this.data.length}`);
    this.data.length = this.visitCounts;
    this.dataSource = new MatTableDataSource([...this.data]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.helper.refreshTable.subscribe(() => {
      this.refresh();
    });
  }

  viewDate(date1) {
   return moment(date1).locale(this.getLang()).format("YYYY-MM-DD HH:mm:ss");
  }
  /**
   * Apply filter with the filter string
   * @param filterValue String
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  refresh() {
    setTimeout(() => {
      const newData = this.service[this.tableFor];
      let data = [];
      newData.forEach((item) => {
        data = this.helper.getUpdatedValue(data, item, "id");
      });
      this.loadedDataLength = Number(`${data.length}`);
      data.length = this.visitCounts;
      if (data && Array.isArray(data)) {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.table.renderRows();
      }
    }, 1000);
  }

  hasEmptyRow() {
    if (!this.dataLoaded) {
      this.emptyRow.emit();
    }
  }

  changePage({ length, pageIndex, pageSize }) {
    const data: any = {
      loadMore: this.loadedDataLength === length ? false : true,
      // loadMore: (pageIndex + 1) * pageSize >= length,
      refresh: this.refresh.bind(this),
    };
    this.tableEmitter.emit(data);
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }
}
