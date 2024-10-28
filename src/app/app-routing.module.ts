import { inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, Routes } from '@angular/router';
import { MainContainerComponent } from './main-container/main-container.component';
import { RouteAuthGuard } from './core/guards/route-auth.guard';
import { NgxPermissionsGuard, NgxRolesService } from 'ngx-permissions';
import { AppConfigService } from './services/app-config.service';

const canActivateMenu = (menu: string | number) => {
  const sidebar_menus = inject(AppConfigService).sidebar_menus;
  const router = inject(Router);
  const roleService = inject(NgxRolesService);
  const isAdmin = !!roleService.getRole('ORGANIZATIONAL:SYSTEM ADMINISTRATOR');
  if(!sidebar_menus || isAdmin) return true;

  if(sidebar_menus && !sidebar_menus[menu]) {
    router?.navigateByUrl('/dashboard');
    return false
  }
  
  return true;
  
}

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
        canActivate:[() => canActivateMenu('messages')],
        loadChildren: () => import('./messages/messages.module').then(m => m.MessagesModule)
      },
      {
        path: 'calendar',
        data: {
          breadcrumb: 'Calendar'
        },
        canActivate:[() => canActivateMenu('calendar')],
        loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule)
      },
      {
        path: 'appointments',
        data: {
          breadcrumb: 'Appointments'
        },
        canActivate:[() => canActivateMenu('appointment')],
        loadChildren: () => import('./appointments/appointments.module').then(m => m.AppointmentsModule)
      },
      {
        path: 'prescription',
        data: {
          breadcrumb: 'Prescription'
        },
        canActivate:[() => canActivateMenu('prescription')],
        loadChildren: () => import('./prescription/prescription.module').then(m => m.PrescriptionModule)
      },
      {
        path: 'help',
        data: {
          breadcrumb: 'Help & Support'
        },
        canActivate:[() => canActivateMenu('help_support')],
        loadChildren: () => import('./help-and-support/help-and-support.module').then(m => m.HelpAndSupportModule)
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
