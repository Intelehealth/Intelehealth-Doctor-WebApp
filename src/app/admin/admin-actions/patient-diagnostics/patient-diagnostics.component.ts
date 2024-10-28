import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { PatientDiagnosticModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-patient-diagnostics',
  templateUrl: './patient-diagnostics.component.html',
  styleUrls: ['./patient-diagnostics.component.scss']
})
export class PatientDiagnosticsComponent {
  displayedColumns : string[] = ['id', 'name', 'updatedAt', 'is_mandatory', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  diagnosticsData : PatientDiagnosticModel[];
  bmiEnabled : boolean = false;
  whrEnabled : boolean = false; 
  sectionEnabled : boolean;
  sectionData: {id:number, is_enabled:boolean};

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
  }

  /**
  * Get patient diagnostics.
  * @return {void}
  */
  getPatientDiagnostics(): void {
    this.configService.getDiagnostics().subscribe((res: any)=>{
      console.log('res: ', res);
      this.diagnosticsData = res.patient_diagnostics;
      this.sectionData = res?.patient_diagnostics_section;
      this.sectionEnabled = this.sectionData?.is_enabled;
      this.bmiEnabled = this.diagnosticsData.find((e:PatientDiagnosticModel) => e.name == 'BMI')?.is_enabled;
      this.whrEnabled = this.diagnosticsData.find((e:PatientDiagnosticModel) => e.name == 'Waist to Hip Ratio (WHR)')?.is_enabled;
      this.dataSource = new MatTableDataSource(this.diagnosticsData);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.getPatientDiagnostics();
  }

  /**
  * Update diagnostic enabled status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateDiagnosticEnabledStatus(id, status).subscribe(res => {
      this.toastr.success("Patient diagnostics has been successfully updated", "Update successful");
      this.getPatientDiagnostics();
    }, err => {
      this.getPatientDiagnostics();
    });
  }

  /**
  * Update diagnostic mandatory status.
  * @return {void}
  */
  updateMandatoryStatus(id: number, status: boolean): void {
    this.configService.updateDiagnosticMandatoryStatus(id, status).subscribe(res => {
      this.toastr.success("Patient diagnostics has been successfully updated", "Update successful");
      this.getPatientDiagnostics();
    }, err => {
      this.getPatientDiagnostics();
    });
  }

  /**
  * Publish patient diagnostic changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("Patient diagnostics changes published successfully!", "Changes published!");
    });
  }

  /**
  * Update Webrtc status.
  * @return {void}
  */
  updateFeatureStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(res => {
      this.toastr.success("Patient Diagnostics has been successfully updated", "Update successful!");
      this.getPatientDiagnostics();
    }, err => {
      this.getPatientDiagnostics();
    });
  }
}
