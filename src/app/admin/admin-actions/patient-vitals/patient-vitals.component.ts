import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { PatientVitalModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData, getFieldValueByLanguage } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-patient-vitals',
  templateUrl: './patient-vitals.component.html',
  styleUrls: ['./patient-vitals.component.scss']
})
export class PatientVitalsComponent implements OnInit {
  displayedColumns : string[] = ['id', 'name', 'updatedAt', 'is_mandatory', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  vitalsData : PatientVitalModel[];
  bmiEnabled : boolean = false;
  whrEnabled : boolean = false; 
  sectionEnabled : boolean;
  sectionData: {id:number, is_enabled:boolean};

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService,
    private coreService: CoreService,
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
  }

  /**
  * Get patient vitals.
  * @return {void}
  */
  getPatientVitals(): void {
    this.configService.getPatientVitals().subscribe((res: any)=>{
      this.vitalsData = res.patient_vitals;
      this.sectionData = res?.patient_vitals_section;
      this.sectionEnabled = this.sectionData?.is_enabled;
      this.bmiEnabled = this.vitalsData.find((e:PatientVitalModel) => e.name == 'BMI')?.is_enabled;
      this.whrEnabled = this.vitalsData.find((e:PatientVitalModel) => e.name == 'Waist to Hip Ratio (WHR)')?.is_enabled;
      this.dataSource = new MatTableDataSource(this.vitalsData);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.getPatientVitals();
  }

  /**
  * Update vital enabled status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateVitalEnabledStatus(id, status).subscribe(res => {
      this.toastr.success("Patient vitals has been successfully updated", "Update successful");
      this.getPatientVitals();
    }, err => {
      this.getPatientVitals();
    });
  }

  /**
  * Update vital enabled status.
  * @return {void}
  */
  updateMandatoryStatus(id: number, status: boolean): void {
    this.configService.updateVitalMandatoryStatus(id, status).subscribe(res => {
      this.toastr.success("Patient vitals has been successfully updated", "Update successful");
      this.getPatientVitals();
    }, err => {
      this.getPatientVitals();
    });
  }

  /**
  * Publish patient vital changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("Patient vitals changes published successfully!", "Changes published!");
    });
  }

  /**
  * Update Webrtc status.
  * @return {void}
  */
  updateFeatureStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(res => {
      this.toastr.success("Patient Vitals has been successfully updated", "Update successful!");
      this.getPatientVitals();
    }, err => {
      this.getPatientVitals();
    });
  }

    /**
  * Open language field modal
  * @return {Observable<any>} - Dialog result
  */
    openDialog(element: { id: any; lang: any; }): void  {
      const id = element?.id;
      const data = { 
        fieldName: 'name', // Example data to pass
        fieldValue:  element?.lang
      };
      const dialogRef = this.coreService.openLanguageFieldModal({ data });
  
      // Capture the data from the output event emitter
      dialogRef.componentInstance.onSubmit.subscribe((result: string) => {
        this.configService.updateVitalName(id, result).subscribe(res => {
          dialogRef.close();
          this.toastr.success("Patient visit sections name updated successfully!");
          this.getPatientVitals();
        }, (error) => {
          dialogRef.close();
          this.toastr.error(error?.message);
        })
      });
    }
  
  /**
    * Retrieve the appropriate language value from an element.
    * @param {any} element - An object containing `lang` and `name`.
    * @return {string} - The value in the selected language or the first available one.
    * Defaults to `element.name` if no language value is found.
    */
    getLanguageValue(element: any) {
      return getFieldValueByLanguage(element)
    }
}
