import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { PatientVisitSummaryModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-patient-visit-summary',
  templateUrl: './patient-visit-summary.component.html',
  styleUrls: ['./patient-visit-summary.component.scss']
})
export class PatientVisitSummaryComponent implements OnInit {
  displayedColumns : string[] = ['id', 'name', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  data : PatientVisitSummaryModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getPatientVisitSummarySections();
  }

  /**
  * Get patient visit summary sections.
  * @return {void}
  */
  getPatientVisitSummarySections(): void {
    this.configService.getPatientVisitSummarySections().subscribe(res=>{
      this.data = res.patient_visit_summary;
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Update speciality status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updatePatientVisitSummaryStatus(id, status).subscribe(res => {
      this.toastr.success("Patient visit summary has been successfully updated", "Update successful!");
      this.getPatientVisitSummarySections();
    }, err => {
      this.getPatientVisitSummarySections();
    });
  }

  /**
  * Publish patient visit summary changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("Patient visit summary changes published successfully!", "Changes published!");
    });
  }
}
