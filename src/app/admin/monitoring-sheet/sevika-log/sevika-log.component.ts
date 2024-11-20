import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-sevika-log',
  templateUrl: './sevika-log.component.html',
  styleUrls: ['./sevika-log.component.scss']
})
export class SevikaLogComponent implements OnInit, OnChanges {
  @Input() data: any = [];
  @Output() exportSevikaData = new EventEmitter();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();
  hwColumns: any = [
    { label: "Name of Sevika", key: "name" },
    { label: "Primary Village", key: "village" },
    { label: "Secondary Village", key: "secondaryVillage" },
    { label: "Sanch", key: "sanch" },
    { label: "Last Sync", key: "lastSyncTimestamp" },
    { label: "Consultation Device", key: "device" },
    { label: "Android Version", key: "androidVersion" },
    { label: "App Version", key: "version" },
    { label: "Average Time Spent(In a day)", key: "avgTimeSpentInADay" },
    { label: "Total Time", key: "totalTime" },
    { label: "Last Activity", key: "lastActivity" },
    { label: "No. of Days", key: "days", class: 'n-day' },
    { label: "Current Status", key: "status" }
  ];

  constructor(private translateService: TranslateService) {
    this.displayedColumns = this.hwColumns.map((c) => c.key);
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
    this.exportSevikaData.emit('sevika');
  }
}
