import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent {
  passwordResetForm: FormGroup;
  submitted: boolean = false;
  uuid: string = "";
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<PasswordResetComponent>,
  private authService: AuthService,
  private toastr: ToastrService) { 
    this.passwordResetForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/), Validators.minLength(8), Validators.maxLength(20)]),
      confirmNewPassword: new FormControl('', [Validators.required])
    });
    this.uuid = data.uuid;
  }

  get f1() { return this.passwordResetForm.controls; }

  resetPassword(): any{
    this.submitted = true;
    if(this.uuid && this.passwordResetForm.valid && this.passwordResetForm.get('newPassword').value === this.passwordResetForm.get('confirmNewPassword').value){
      this.authService.resetUserPassword(this.uuid,this.passwordResetForm.value).subscribe(res=>{
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
