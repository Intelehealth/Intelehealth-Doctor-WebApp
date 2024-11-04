import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AyuComponent } from './ayu/ayu.component';
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SupportComponent } from './support/support.component';
import { MomentModule } from 'ngx-moment';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatPaginationIntlService } from '../services/mat-pagination.service';
import { SharedModule } from '../shared.module';
import { AdminActionsComponent } from './admin-actions/admin-actions.component';
import { DoctorSpecialityComponent } from './admin-actions/doctor-speciality/doctor-speciality.component';
import { MobileAppLanguagesComponent } from './admin-actions/mobile-app-languages/mobile-app-languages.component';
import { PatientRegistrationComponent } from './admin-actions/patient-registration/patient-registration.component';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PartnerLabelComponent } from './admin-actions/partner-label/partner-label.component';
import { FileUploadComponent } from '../core/components/file-upload/file-upload.component';
import { NgbNavModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportListComponent } from './reports/report-list/report-list.component';
import { ReportsComponent } from './reports/reports.component';
import { PatientVitalsComponent } from './admin-actions/patient-vitals/patient-vitals.component';
import { WebrtcComponent } from './admin-actions/webrtc/webrtc.component';
import { PatientVisitSummaryComponent } from './admin-actions/patient-visit-summary/patient-visit-summary.component';
import { AbhaComponent } from './admin-actions/abha/abha.component';
import { UserCreationComponent } from './admin-actions/user-creation/user-creation.component';
import { AddUserComponent } from './admin-actions/user-creation/add-user/add-user.component';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientDiagnosticsComponent } from './admin-actions/patient-diagnostics/patient-diagnostics.component';
import { MenuConfigComponent } from './admin-actions/menu-config/menu-config.component';
import { PatientVisitSectionsComponent } from './admin-actions/patient-visit-sections/patient-visit-sections.component';


import {DragDropModule} from '@angular/cdk/drag-drop';


// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

const routes: Routes = [
  {
    path: '',
    redirectTo: "actions",
    pathMatch: "full"
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'support',
        component: SupportComponent
      },
      {
        path: 'actions',
        children:[
          {
            path: 'ayu',
            component: AyuComponent
          },
          {
            path: 'doctor-specialties',
            component: DoctorSpecialityComponent
          },
          {
            path: 'mobile-app-languages',
            component: MobileAppLanguagesComponent
          },
          {
            path: 'patient-registration',
            component: PatientRegistrationComponent
          },
          {
            path: 'partner-label',
            component: PartnerLabelComponent
          },
          {
            path: 'patient-vitals',
            component: PatientVitalsComponent
          },
          {
            path: 'patient-diagnostics',
            component: PatientDiagnosticsComponent
          },
          {
            path: 'webrtc',
            component: WebrtcComponent
          },
          {
            path: 'patient-visit-summary',
            component: PatientVisitSummaryComponent
          },
          {
            path: 'abha',
            component: AbhaComponent
          },
          {
            path: 'menu-config',
            component: MenuConfigComponent
          },
          {
            path: 'user-creation',
            children: [
              {
                path: '',
                component: UserCreationComponent
              },
              {
                path: 'add',
                component: AddUserComponent
              },
              {
                path: 'edit/:uuid',
                component: AddUserComponent
              }
            ]
          },
          {
            path: 'patient-visit-section',
            component: PatientVisitSectionsComponent
          },
          {
            path: '',
            component: AdminActionsComponent
          }
        ]
      },
      {
        path: 'report',
        component: ReportsComponent
      },
    ]
  }
];

@NgModule({
  declarations: [
    AdminComponent,
    AyuComponent,
    SupportComponent,
    AdminActionsComponent,
    DoctorSpecialityComponent,
    MobileAppLanguagesComponent,
    PatientRegistrationComponent,
    PartnerLabelComponent,
    FileUploadComponent,
    ReportsComponent,
    ReportListComponent,
    PatientVitalsComponent,
    WebrtcComponent,
    PatientVisitSummaryComponent,
    AbhaComponent,
    UserCreationComponent,
    AddUserComponent,
    PatientDiagnosticsComponent,
    MenuConfigComponent,
    PatientVisitSectionsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatSidenavModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatMenuModule,
    MatTooltipModule,
    MatTabsModule,
    MatSortModule,
    MatSelectModule,
    MatIconModule,
    MatFormFieldModule,
    Ng2TelInputModule,
    NgxDropzoneModule,
    NgbTypeaheadModule,
    MatProgressBarModule,
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
    MomentModule,
    NgbNavModule,
    SharedModule,
    MatProgressSpinnerModule,
    DragDropModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginationIntlService },
  ]
})
export class AdminModule { }
