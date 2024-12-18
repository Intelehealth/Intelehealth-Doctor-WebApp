import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { FeatureModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss']
})
export class PatientDetailsComponent {

  displayedColumns: string[] = ['id', 'name', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  data: FeatureModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getPatientDetailsSections();
  }

  /**
  * Get patient details sections.
  * @return {void}
  */
  getPatientDetailsSections(): void {
    this.configService.getPatientDetailsSections().subscribe(res => {
      this.data = res.patient_details_sections;
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Update patient details status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(res => {
      this.toastr.success("Patient details have been successfully updated", "Update successful!");
      this.getPatientDetailsSections();
    }, err => {
      this.getPatientDetailsSections();
    });
  }

  /**
  * Publish patient details changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("Patient details changes published successfully!", "Changes published!");
    });
  }

}
