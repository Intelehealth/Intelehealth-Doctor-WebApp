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
import { FormsModule } from '@angular/forms';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
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
import { VideoCategoryComponent } from './video-category/video-category.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { VideosComponent } from './videos/videos.component';
import { ReportListComponent } from './reports/report-list/report-list.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: AyuComponent
      },
      {
        path: 'support',
        component: SupportComponent
      },
      {
        path: 'video-library',
        component: VideoCategoryComponent,
      },
      {
        path: 'manage-videos/:categoryId',
        component: VideosComponent
      },
      {
        path: 'reports',
        component: ReportListComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    AdminComponent,
    AyuComponent,
    SupportComponent,
    VideoCategoryComponent,
    VideosComponent,
    ReportListComponent
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
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatMenuModule,
    MatTooltipModule,
    NgbNavModule,
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
    SharedModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginationIntlService },
  ]
})
export class AdminModule { }
