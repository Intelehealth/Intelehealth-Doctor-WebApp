import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiResponseModel } from 'src/app/model/model';
import { AuthService } from 'src/app/services/auth.service';


export class ProviderAttributeValidator {
  static createValidator(authService: AuthService, type: string, uuid: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      return timer(1000).pipe(
        switchMap(() => authService.validateProviderAttribute(type, control.value, uuid)),
        map((res: ApiResponseModel) =>
          res.data ? null : { alreadyExists: true }
        )
      );
    };
  }

  static usernameValidator(authService: AuthService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      return timer(1000).pipe(
        switchMap(() => authService.validateUser(control.value)),
        map((res: any) =>
          res.userExist ? { alreadyExists: true } : null
        )
      );
    };
  }
}
