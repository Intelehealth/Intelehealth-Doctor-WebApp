import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RecentVisitsApiResponseModel } from 'src/app/model/model';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-searched-patients',
  templateUrl: './searched-patients.component.html',
  styleUrls: ['./searched-patients.component.scss']
})
export class SearchedPatientsComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<SearchedPatientsComponent>,
    private router: Router,
    private visitService: VisitService
  ) { }

  close(val: boolean) {
    this.dialogRef.close(val);
  }

  view(uuid: string) {
    this.visitService.recentVisits(uuid).subscribe((response: RecentVisitsApiResponseModel) => {
      this.router.navigate(['/dashboard/visit-summary', response.results[0].uuid]);
      this.close(true);
    });
  }
}
