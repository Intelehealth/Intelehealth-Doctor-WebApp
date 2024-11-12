import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reports-error',
  templateUrl: './reports-error.component.html',
})
export class ReportErrorComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<ReportErrorComponent>) { }

  ngOnInit(): void {
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}