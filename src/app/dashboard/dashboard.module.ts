import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SignaturePadModule } from 'angular2-signaturepad';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MatPaginationIntlService } from '../services/mat-pagination.service';
import { SharedModule } from '../shared.module';
import { AttachmentViewerComponent } from './attachment-viewer/attachment-viewer.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DiagnosticReportsComponent } from './diagnostic-reports/diagnostic-reports.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { HwProfileComponent } from './hw-profile/hw-profile.component';
import { OpenChatComponent } from './open-chat/open-chat.component';
import { ProfileComponent } from './profile/profile.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { VisitSummaryComponent } from './visit-summary/visit-summary.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    DashboardComponent,
    ProfileComponent,
    GetStartedComponent,
    VisitSummaryComponent,
    ChangePasswordComponent,
    HwProfileComponent,
    OpenChatComponent,
    DiagnosticReportsComponent,
    AttachmentViewerComponent,
    SafeUrlPipe
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    DashboardRoutingModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatStepperModule,
    MatTabsModule,
    SignaturePadModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2TelInputModule,
    NgxDropzoneModule,
    NgbTypeaheadModule,
    MatDatepickerModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: false,
      rolesIsolate: false,
      configurationIsolate: false
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MatProgressSpinnerModule,
    SharedModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginationIntlService },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class DashboardModule { }
