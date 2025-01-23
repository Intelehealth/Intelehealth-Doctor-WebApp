import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getCallDuration } from 'src/app/utils/utility-functions';
import * as moment from 'moment';


@Component({
  selector: 'app-call-history',
  templateUrl: './call-history.component.html',
  styleUrls: ['./call-history.component.scss']
})
export class CallHistoryComponent {
  callDurationHistory: any[];
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  public dialogRef: MatDialogRef<CallHistoryComponent>) { 
    this.callDurationHistory = data.reverse();
  }

  getCallDuration(val:number){
    return getCallDuration(val)
  }

  getCallDateTime(timestamp:number){
    return moment(timestamp).format('DD-MM-YYYY hh:mm a')
  }
}
