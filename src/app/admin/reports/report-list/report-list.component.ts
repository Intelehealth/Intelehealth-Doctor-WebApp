import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { CoreService } from 'src/app/services/core/core.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  reports = [
    {
      id: 1,
      name: 'List of Visits between two dates',
      buttonName: "Create Report"
    },
    {
      id: 2,
      name: 'Visit Details with Textual Clinical Note and Data Segregation',
      buttonName: "Create Report"
    },
    {
      id: 3,
      name: 'Individual Client Report Part 1',
      buttonName: "Create Report"
    },
    {
      id: 4,
      name: 'Village Level Report',
      buttonName: "Create Report"
    },
    {
      id: 5,
      name: 'Location Level Report',
      buttonName: "Create Report"
    }
  ];

  displayedColumns: string[] = ['name', 'buttonName'];
  constructor( private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private modalService: CoreService) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: 'Reports', imgUrl: 'assets/svgs/report-logo.svg' })
  }

  createReport(element) {
    let data = {
      reportId: element.id,
      title: element.name,
      field1: 'Start date',
      field2: 'End date',
      field3: 'State',
      field4: 'District',
      field5: 'Sanch',
      field6: 'Village',
      cancelBtnText: 'Cancel',
      confirmBtnText: 'Generate Report'
    };

    if (element.id === 5) {
      let body = {
        reportId: element.id,
        selectedData: ''
      }
      this.fileDownloadDialog(body);
    } else {
      this.modalService.openGenerateReportDialog(data).subscribe((res: any) => {
        if (res) {
          let body = {
            reportId: element.id,
            selectedData: res
          }
          this.fileDownloadDialog(body);
        }
      });
    }
  }
  
  fileDownloadDialog(body: { reportId: any; selectedData: any; }) {
    this.modalService.openFileDownloadDialog(body).subscribe((res: any) => {
      if (res) {
        this.reportSuccess();
      } else {
        this.reportError();
      }
    });
  }

  reportSuccess() {
    this.modalService.openReportSuccessDialog().subscribe(() => {
    });
  }

  reportError() {
    this.modalService.openReportErrorDialog().subscribe(() => {
    });
  }
}
