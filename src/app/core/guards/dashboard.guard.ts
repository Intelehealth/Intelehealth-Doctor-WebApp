import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppointmentService } from 'src/app/services/appointment.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuard implements CanActivate {

  constructor(
    private router: Router,
    private apService: AppointmentService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      const provider = JSON.parse(localStorage.getItem('provider'));
      if (provider.attributes.length) {
        return true;
      } else {
        this.router.navigate(['/dashboard/get-started'], { queryParams: { pc: (provider.attributes.length) ? true : false } });
        return true;
      }
  }
}
