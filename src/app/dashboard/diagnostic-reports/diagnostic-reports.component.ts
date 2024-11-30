import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs'; // Import 'of' for returning an observable in case of error
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AttachmentViewerComponent } from '../attachment-viewer/attachment-viewer.component';

@Component({
  selector: 'app-diagnostic-reports',
  templateUrl: './diagnostic-reports.component.html',
  styleUrls: ['./diagnostic-reports.component.scss']
})
export class DiagnosticReportsComponent implements OnChanges, OnInit {
  @Input() patientId: string | undefined;  // Declare the input property
  private baseURL = environment.baseURL;

  reports: any[] | null = null;
  displayedColumns: string[] = ['title', 'contentType', 'action'];
  errorMessage: string | null = null; // To store error messages

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    // Initial API call if patientId is provided at initialization
    if (this.patientId) {
      this.fetchReports();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if the patientId has changed
    if (changes['patientId'] && !changes['patientId'].isFirstChange()) {
      this.fetchReports();
    }
  }

  private fetchReports(): void {
    if (this.patientId) {
      this.http
        .get(`${this.baseURL}/diagnostic-report/search?patient=${this.patientId}`)
        .pipe(
          catchError((error) => {
            // Handle the error and log it or display a user-friendly message
            this.errorMessage = 'An error occurred while fetching the reports. Please try again later.';
            console.error('Error fetching diagnostic reports:', error);
            return of([]); // Return an empty array in case of error
          })
        )
        .subscribe((data: any) => {
          this.reports = data;
          this.errorMessage = null; // Clear error message if the API call succeeds
        });
    } else {
      this.errorMessage = 'Patient ID is required.';
      this.reports = null; // Clear the reports if patientId is invalid
    }
  }

  viewAttachment(report: any): void {
    this.dialog.open(AttachmentViewerComponent, {
      data: report,
    });
  }
}
