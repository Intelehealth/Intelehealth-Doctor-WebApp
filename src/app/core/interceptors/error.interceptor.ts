import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private toastr: ToastrService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if ([401, 403].indexOf(err.status) != -1) {
        this.authService.logOut();
      }

      if ([404].indexOf(err.status) != -1) {
        this.toastr.error('Not found', '404 Not Found');
        return throwError(err.error.message || err.error.error.message || err.statusText  || err.error.error);
      }

      const error = err.error.message || err.error.error.message  || err.error.error || err.statusText;
      if (request.method == 'DELETE' && request.url.includes('session')) {
        return throwError(error); 
      }
      if (error == 'OK' || err?.url.includes('/abha/')) {
        return throwError(error);
      }
      this.toastr.error(error);
      return throwError(error);
    }))
  }
}
