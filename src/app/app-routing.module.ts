import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { RouteAuthGuard } from './core/guards/route-auth.guard';
import { MainContainerComponent } from './main-container/main-container.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'session',
    loadChildren: () => import('./session/session.module').then(m => m.SessionModule)
  },
  {
    path: 'i/:hash',
    loadChildren: () => import('./prescription-download/prescription-download.module').then(m => m.PrescriptionDownloadModule),
  },
  {
    path: '',
    component: MainContainerComponent,
    canActivate: [RouteAuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        data: {
          breadcrumb: 'Dashboard'
        },
      },
      {
        path: 'messages',
        data: {
          breadcrumb: 'Messages'
        },
        loadChildren: () => import('./messages/messages.module').then(m => m.MessagesModule)
      },
      {
        path: 'calendar',
        data: {
          breadcrumb: 'Calendar'
        },
        loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule)
      },
      {
        path: 'appointments',
        data: {
          breadcrumb: 'Appointments'
        },
        loadChildren: () => import('./appointments/appointments.module').then(m => m.AppointmentsModule)
      },
      {
        path: 'prescription',
        data: {
          breadcrumb: 'Prescription'
        },
        loadChildren: () => import('./prescription/prescription.module').then(m => m.PrescriptionModule)
      },
      {
        path: 'help',
        data: {
          breadcrumb: 'Help & Support'
        },
        loadChildren: () => import('./help-and-support/help-and-support.module').then(m => m.HelpAndSupportModule)
      },
      {
        path: 'sync-module-configuration',
        loadChildren: () => import('./admin/sync-module-configuration/sync-module-configuration.module').then(m => m.SyncModuleConfigurationModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Sync module configuration', permissions: {
            only: ['ORGANIZATIONAL: SYSTEM ADMINISTRATOR'],
            redirectTo: '/dashboard'
          }
        }
      },
      {
        path: 'import-patient',
        loadChildren: () => import('./admin/import-patient/import-patient.module').then(m => m.ImportPatientModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Import Patient', permissions: {
            only: ['ORGANIZATIONAL: SYSTEM ADMINISTRATOR'],
            redirectTo: '/dashboard'
          }
        }
      },
      {
        path: 'facility-module-configuration',
        data: {
          breadcrumb: 'Facility module configuration'
        },
        loadChildren: () => import('./admin/facility-configuration/facility-configuration.module').then(m => m.FacilityConfigurationModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Admin',
          permissions: {
            only: ['ORGANIZATIONAL: SYSTEM ADMINISTRATOR'],
            redirectTo: '/dashboard'
          }
        }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'session/page-not-found'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
