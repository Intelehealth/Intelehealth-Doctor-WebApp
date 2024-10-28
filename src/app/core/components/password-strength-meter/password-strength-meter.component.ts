import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-password-strength-meter',
  templateUrl: './password-strength-meter.component.html',
  styleUrls: ['./password-strength-meter.component.scss']
})
export class PasswordStrengthMeterComponent implements OnChanges{
  @Input() password: string;
  @Input() showDetails: boolean = false;
  level: number = 0;

  ngOnChanges(): void {
    this.checkPasswordStrength();
  }

  /**
  * Check the password strength level
  * @param {string} str - Password string
  * @return {number} - Strength level between 1 to 4
  */
  checkPasswordStrength() {
    this.level = 0;
    if(/.{4,}/.test(this.password)) this.level++;
    if(/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@#$!%*?&]{6,}$/.test(this.password)) this.level++;
    if(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/.test(this.password)) this.level++;
    if(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{12,}$/.test(this.password)) this.level++;
  }
}
