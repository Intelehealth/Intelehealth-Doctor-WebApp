import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-doctor-log',
  templateUrl: './doctor-log.component.html',
  styleUrls: ['./doctor-log.component.scss']
})
export class DoctorLogComponent {
  @Input() data: any = [];
  @Output() exportDoctorData = new EventEmitter();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();
  drColumns: any = [
    { label: "Name of Doctor", key: "name" },
    { label: "Last Sync", key: "lastSyncTimestamp" },
    { label: "Consultation Device", key: "device" },
    { label: "Average Time Spent(In a day)", key: "avgTimeSpentInADay" },
    { label: "Total Time", key: "totalTime" },
    { label: "No. of Days", key: "days", class: 'n-day' },
    { label: "Current Status", key: "status" },
  ];

  constructor(private translateService: TranslateService) {
    this.displayedColumns = this.drColumns.map((c) => c.key);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = [...this.data];
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  export() {
    this.exportDoctorData.emit('doctor');
  }
}
