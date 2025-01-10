import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reschedule-appointment-confirm',
  templateUrl: './reschedule-appointment-confirm.component.html',
  styleUrls: ['./reschedule-appointment-confirm.component.scss']
})
export class RescheduleAppointmentConfirmComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<RescheduleAppointmentConfirmComponent>) { }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
