import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiResponseModel } from '../../model/model';
import { AppointmentService } from '../../services/appointment.service';
import { getCacheData } from '../../utils/utility-functions';
import { doctorDetails } from '../../config/constant';

@Component({
  selector: 'app-cancel-appointment-confirm',
  templateUrl: './cancel-appointment-confirm.component.html',
})
export class CancelAppointmentConfirmComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<CancelAppointmentConfirmComponent>,
    private appointmentService: AppointmentService,
    private toastr: ToastrService, 
    private translateService: TranslateService
  ) { }

  /**
  * Cancel appointment
  * @return {void}
  */
  cancel() {
    const payload = {
      id: this.data.id,
      visitUuid: this.data.visitUuid,
      hwUUID: this.userId,
    };
    this.appointmentService.cancelAppointment(this.data?.mindmapURL, payload).subscribe((res: ApiResponseModel) => {
        if (res) {
          if (res.status) {
            this.close(true);
          } else {
            this.toastr.error(this.translateService.instant('You can\'t cancel the past appointment'), this.translateService.instant('Can\'t Cancel'));
            this.close(false);
          }
        }
    });
  }

  /**
  * Get user uuid from localstorage user
  * @return {string} - User uuid
  */
  get userId() {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
