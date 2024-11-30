import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { VisitEncounterPatientOrderService } from 'src/app/services/visit-encounter-patient-order.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { FacilityModuleConfigurationService } from "../../../services/facility-module-configuration.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-add-facility-dialog',
  templateUrl: './add-facility-dialog.component.html',
  styleUrls: ['./add-facility-dialog.component.scss']
})
export class AddFacilityDialogComponent {
  facilityModuleForm: FormGroup;
  submitted: boolean = false;
  today: string;
  referralFacilityList = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // `data` will contain the facility information if editing
    private dialogRef: MatDialogRef<AddFacilityDialogComponent>,
    private visitEncounterService: VisitEncounterPatientOrderService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private facilityModuleConfigurationService: FacilityModuleConfigurationService
  ) {
    this.facilityModuleForm = new FormGroup({
      prescriptionApi: new FormControl('', [Validators.required]),
      appointmentApi: new FormControl('', [Validators.required]),
      status: new FormControl(true, [Validators.required]),
      facilityUuid: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.getReferralList();

    if (this.data) {
      this.prefillForm(this.data);
    }
  }

  getReferralList() {
    this.visitEncounterService.getReferralFacilityLocation().subscribe((response) => {
      this.referralFacilityList = response.results;
    });
  }

  prefillForm(data: any): void {
    this.facilityModuleForm.patchValue({
      prescriptionApi: data.prescriptionApi,
      referralApi: data.referralApi,
      appointmentApi: data.appointmentApi,
      status: data.status,
      facilityUuid: data.facilityUuid
    });
  }

  get f() {
    return this.facilityModuleForm.controls;
  }

  close() {
    this.dialogRef.close(false);
  }

  addFacilityModule() {
    this.submitted = true;

    if (this.facilityModuleForm.invalid) {
      console.warn('Form is invalid. Please check the input fields.');
      return;
    }

    const facilityData = this.facilityModuleForm.value;
    facilityData.facilityName = this.referralFacilityList.find((el) => el.uuid === facilityData.facilityUuid)?.display;

    if (this.data) {
      this.facilityModuleConfigurationService.postFacilities({...facilityData,id: this.data.id}).subscribe({
        next: (res) => {
          console.log('Facility updated successfully:', res);
          this.toastr.success(this.translateService.instant('Facility updated successfully'));
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error updating facility:', err);
          this.toastr.error(this.translateService.instant('Failed to update facility'));
        }
      });
    } else {
      this.facilityModuleConfigurationService.postFacilities(facilityData).subscribe({
        next: (res) => {
          console.log('Facility added successfully:', res);
          this.toastr.success(this.translateService.instant('Facility added successfully'));
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error adding facility:', err);
          this.toastr.error(this.translateService.instant('Failed to add facility'));
        }
      });
    }
  }
}
