import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoValuePipe } from './core/pipes/no-value.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { DefaultImageDirective } from './core/directives/default-image.directive';
import { MatTableResponsiveDirective } from './core/directives/mat-table-responsive.directive';
import { FollowUpDatePipe } from './core/pipes/follow-up-date.pipe';
import { PasswordStrengthMeterComponent } from './core/components/password-strength-meter/password-strength-meter.component';

@NgModule({
  declarations: [NoValuePipe, DefaultImageDirective, MatTableResponsiveDirective,FollowUpDatePipe, PasswordStrengthMeterComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [NoValuePipe, TranslateModule, DefaultImageDirective, MatTableResponsiveDirective,FollowUpDatePipe, PasswordStrengthMeterComponent]
})
export class SharedModule { }
