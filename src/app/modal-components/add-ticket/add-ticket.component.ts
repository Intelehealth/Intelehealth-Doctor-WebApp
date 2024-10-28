import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PagerdutyService } from 'src/app/services/pagerduty.service';

@Component({
  selector: 'app-add-ticket',
  templateUrl: './add-ticket.component.html',
  styleUrls: ['./add-ticket.component.scss']
})
export class AddTicketComponent {
  addTicketForm: FormGroup;
  submitted: boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<AddTicketComponent>,
  private pagerdutyService: PagerdutyService) { 
    this.addTicketForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      priority: new FormControl('low', [Validators.required])
    });
  }

  get f1() { return this.addTicketForm.controls; }

  createTicket(){
    this.submitted = true;
    if(this.addTicketForm.valid){
      this.pagerdutyService.createTicket(this.addTicketForm.value).subscribe(res=>{
        this.close(true);
      })
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
