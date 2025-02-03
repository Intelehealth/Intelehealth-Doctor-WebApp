import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-patient-reg-validations',
  templateUrl: './patient-reg-validations.component.html',
  styleUrls: ['./patient-reg-validations.component.scss']
})
export class PatientRegValidationsComponent {
  patientRegValidationForm: FormGroup;
  submitted: boolean = false;
  id: number;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<PatientRegValidationsComponent>,
  private configService: ConfigService,
  private toastr: ToastrService) { 
    this.patientRegValidationForm = new FormGroup({
      maxLength: new FormControl('', [Validators.required, Validators.min(6), Validators.max(15), Validators.maxLength(2)]),
      minLength: new FormControl('', [Validators.required, Validators.min(6), Validators.max(15), Validators.maxLength(2)])
    });
    this.id = data.id;
    if(data.validations){
      this.patientRegValidationForm.patchValue(data.validations)
    }
  }

  get f1() { return this.patientRegValidationForm.controls; }

  updateValidations(): any{
    this.submitted = true;
    if(this.id && this.patientRegValidationForm.valid && this.patientRegValidationForm.get('minLength').value <= this.patientRegValidationForm.get('maxLength').value){
      this.configService.updatePatientRegValidations(this.id,this.patientRegValidationForm.value).subscribe(res=>{
        this.close(true);
      });
    }
  }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean): void {
    this.dialogRef.close(val);
  }
}
