import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reports-success',
  templateUrl: './reports-success.component.html',
})
export class ReportsSuccessComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<ReportsSuccessComponent>) { }

  ngOnInit(): void {
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}