import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { SetupCalendarComponent } from './setup-calendar/setup-calendar.component';
import { NgxPermissionsGuard } from 'ngx-permissions';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/calendar/setup-calendar',
    pathMatch: 'full'
  },
  {
    path: 'view-calendar',
    component: CalendarComponent,
    data: {
      breadcrumb: 'View Calendar'
    }
  },
  {
    path: 'setup-calendar',
    component: SetupCalendarComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Setup Calendar',
      permissions: {
        only: ['ORGANIZATIONAL: SYSTEM ADMINISTRATOR', 'ORGANIZATIONAL: DOCTOR'],
        redirectTo: '/dashboard'
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarRoutingModule { }
