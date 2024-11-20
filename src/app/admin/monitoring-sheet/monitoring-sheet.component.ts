import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-monitoring-sheet',
  templateUrl: './monitoring-sheet.component.html',
  styleUrls: ['./monitoring-sheet.component.scss']
})
export class MonitoringSheetComponent implements OnInit {
  active: number = 1;
  sevikaData: any = [];
  doctorData: any = [];
  allData: any = [];
  filteredData: any = [];
  drDisplayedColumns: string[] = [];
  hwDisplayedColumns: string[] = [];
  csvExporter;
  drColumns: any = [
    { label: "Name of Doctor", key: "name" },
    { label: "Last Sync", key: "lastSyncTimestamp" },
    { label: "Consultation Device", key: "device" },
    { label: "Average Time Spent(In a day)", key: "avgTimeSpentInADay" },
    { label: "Total Time", key: "totalTime" },
    { label: "No. of Days", key: "days", class: 'n-day' },
    { label: "Current Status", key: "status" },
  ];
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

  constructor(private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private monitorService: MonitoringService) {
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: 'Monitoring Sheet', imgUrl: 'assets/svgs/file-logo.svg' });
    this.getStatuses();
    setTimeout(() => {
      this.getStatuses();
    }, 2000);
  }

  getStatuses() {
    this.monitorService.getAllStatuses().subscribe({
      next: (res: any) => {
        this.allData = res?.data || this.allData;
        setTimeout(() => {
          this.sevikaData = this.filterData('Health Worker');
          this.doctorData = this.filterData('Doctor');
        }, 0);
      },
    });
  }

  filterData(userType: string) {
    let data = this.allData.filter((d) => d.userType === userType);
    this.filteredData = data.map(item => {
      return this.setTableData(item);
    });
    this.filteredData.sort((a, b) => new Date(b.lastSyncTimestamp).getTime() - new Date(a.lastSyncTimestamp).getTime());
    const arry = this.filteredData.filter((obj, index) => this.filteredData.findIndex((item) => item.name === obj.name) === index);
    return arry;
  }

  setTableData(item) {
    switch (item.userType) {
      case 'Doctor': {
        let tableCol: any = {}
        this.drColumns.forEach(col => {
          tableCol[col.key] = this.showValue(item, col.key);
          tableCol.userType = item.userType;
        });
        return tableCol;
      }
        break;
      case 'Health Worker': {
        let tableCol: any = {}
        this.hwColumns.forEach(col => {
          tableCol[col.key] = this.showValue(item, col.key);
          tableCol.userType = item.userType;
        });
        return tableCol;
      }
        break;
    }
  }

  getDays(date) {
    const createdAt = moment(date)
    const duration = moment.duration(moment().diff(createdAt));
    const days = isFinite(this.trunc(duration.asDays())) ? this.trunc(duration.asDays()) : 1;
    return days;
  }

  showValue(obj, key) {
    if (key === 'status') {
      if (obj.status === 'Active' || obj.status === 'active' || obj.status === 'Online') {
        return obj[key] = 'Online';
      } else {
        return obj[key] = 'Offline';
      }
    }

    if (key === 'days') {
      return this.getDays(obj.createdAt);
    }
    if (key === 'avgTimeSpentInADay') {
      const totalTime = moment(obj.totalTime, 'h[h] m[m]');
      const totalDurationInMins = ((totalTime.hours() || 0) * 60) + (totalTime.minutes() || 0)
      let days = this.getDays(obj.createdAt);
      if (days === 0) days = 1
      const avgTimeSpentInADayInMins = totalDurationInMins / days;
      const hours = this.trunc(avgTimeSpentInADayInMins / 60);
      const mins = this.trunc(avgTimeSpentInADayInMins - (hours * 60));
      return `${!isNaN(hours) && isFinite(hours) ? hours : 0}h ${!isNaN(mins) && isFinite(hours) ? mins : 0}m`;
    }
    if (["lastSyncTimestamp", "lastLogin"].includes(key)) {
      return moment(obj[key]).format("DD MMM, YYYY h:mm a");
    } else {
      return obj[key] === null ? 'NA' : obj[key];
    }
  }

  trunc(value) {
    return Math.trunc(value);
  }

  exportData(type: string) {
    const data = (type === 'sevika') ? this.sevikaData.map(({ userType, ...rest }) => rest) :
      this.doctorData.map(({ userType, ...rest }) => rest);

    const header = Object.keys(data[0]);
    const csv = data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName]))
        .join(',')
    );
    let headers = [];
    if (type === 'sevika') {
      this.hwColumns.forEach(col => {
        return header.includes(col.key) ? headers.push(col.label) : null;
      });
    } else {
      this.drColumns.forEach(col => {
        return header.includes(col.key) ? headers.push(col.label) : null;
      });
    }

    csv.unshift(headers.join(','));
    const csvArray = csv.join('\r\n');

    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = (type === 'sevika') ? 'Sevika Log.csv' : 'Doctor Log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
