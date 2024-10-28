import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { DashboardGuard } from '../core/guards/dashboard.guard';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DashboardComponent } from './dashboard.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { ProfileComponent } from './profile/profile.component';
import { VisitSummaryComponent } from './visit-summary/visit-summary.component';
import { HwProfileComponent } from './hw-profile/hw-profile.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { OpenChatComponent } from './open-chat/open-chat.component';

export function redirectToFunc(rejectedPermissionName: string, activateRouteSnapshot: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot) {
  if (rejectedPermissionName == 'ORGANIZATIONAL: SYSTEM ADMINISTRATOR') {
    return 'admin';
  } else {
    return 'dashboard/hw-profile'
  }
}

const routes: Routes = [
  {
    path: '',
    canActivate: [DashboardGuard, NgxPermissionsGuard],
    component: DashboardComponent,
    data: {
      permissions: {
        except: ['ORGANIZATIONAL: SYSTEM ADMINISTRATOR', 'ORGANIZATIONAL: NURSE'],
        redirectTo: redirectToFunc
      }
    },
  },
  {
    path: 'profile',
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Profile',
      permissions: {
        except: ['ORGANIZATIONAL: NURSE'],
        redirectTo: '/dashboard/hw-profile'
      }
    },
    component: ProfileComponent
  },
  {
    path: 'get-started',
    data: {
      breadcrumb: 'Get-Started'
    },
    component: GetStartedComponent
  },
  {
    path: 'visit-summary/:id',
    data: {
      breadcrumb: 'Visit Summary'
    },
    component: VisitSummaryComponent
  },
  {
    path: 'open-chat/:id',
    data: {
      breadcrumb: 'Open Chat'
    },
    component: OpenChatComponent
  },
  {
    path: 'change-password',
    data: {
      breadcrumb: 'Change Password'
    },
    component: ChangePasswordComponent
  },
  {
    path: 'hw-profile',
    data: {
      breadcrumb: 'Profile'
    },
    component: HwProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
