import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxRolesService } from 'ngx-permissions';
import { AuthGatewayLoginResponseModel, CheckSessionResponseModel, LoginResponseModel, ProviderResponseModel } from 'src/app/model/model';
import { AuthService } from 'src/app/services/auth.service';
import { TranslationService } from 'src/app/services/translation.service';
import { getCacheData, setCacheData } from 'src/app/utils/utility-functions';
import { languages, doctorDetails } from 'src/config/constant';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  siteKey: string = environment.siteKey;
  loginForm: FormGroup;
  submitted = false;
  visible = false;
  rememberMe = false;
  loginAttempt = 0;
  selectedLanguage = 'en';
  showCaptcha: boolean = environment.showCaptcha;

  constructor(
    public authService: AuthService,
    private router: Router,
    private rolesService: NgxRolesService,
    public translate: TranslateService,
    public translationService: TranslationService) {


    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      recaptcha: new FormControl('')
    });
    if (this.showCaptcha) {
      this.loginForm.get('recaptcha').setValidators([Validators.required]);
      this.loginForm.get('recaptcha').updateValueAndValidity();
    }
  }

  get f() { return this.loginForm.controls; }

  ngOnInit(): void {
    if(getCacheData(false, languages.SELECTED_LANGUAGE)) {
      this.translate.setDefaultLang(getCacheData(false, languages.SELECTED_LANGUAGE));
      this.translate.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    } else {
      const browserlang = this.translate.getBrowserLang();
      this.translate.setDefaultLang(browserlang);
      setCacheData(languages.SELECTED_LANGUAGE, browserlang);
    }
    this.selectedLanguage = getCacheData(false, languages.SELECTED_LANGUAGE);
  }

  /**
  * Login to the account using username and password
  * @return {void}
  */
  login() {
    this.loginAttempt++;
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    const val = this.loginForm.value;
    const cred = `${val.username}:${val.password}`;
    const base64cred = btoa(cred);
    this.authService.login(base64cred).subscribe((res: LoginResponseModel) => {
      if (res.authenticated && !res.verified) {
        this.authService.getAuthToken(val.username, val.password).subscribe((token: AuthGatewayLoginResponseModel) => {
          this.authService.getProvider(res.user.uuid).subscribe((provider: ProviderResponseModel) => {
            if (provider.results.length) {
              setCacheData(doctorDetails.PROVIDER, JSON.stringify(provider.results[0]));
              setCacheData(doctorDetails.DOCTOR_NAME, provider.results[0].person.display);
              if(provider?.results?.[0]?.attributes?.length === 0) {
                setCacheData(doctorDetails.IS_NEW_DOCTOR, res.user.uuid);
              }
              this.loginSuccess();
            } else {
              this.translationService.getTranslation('Couldn\'t find provider.', 'Login Failed!', false);
            }
          });
        });
      } else {
        this.translationService.getTranslation('Couldn\'t find you, credentials provided are wrong.', 'Login Failed!', false);
      }
    }, err => {
      if (this.loginAttempt < 3) { this.login(); }
    });
  }


  /**
  * Perform appropriate actions for a sucessful login
  * @return {void}
  */
  loginSuccess() {
    this.authService.updateVerificationStatus();
    this.translationService.getTranslation('You have sucessfully logged in.', 'Login Successful', true);
    const role = this.rolesService.getRole('ORGANIZATIONAL: SYSTEM ADMINISTRATOR');
    const isNurse = this.rolesService.getRole('ORGANIZATIONAL: NURSE');
    if (role) {
      setCacheData(doctorDetails.ROLE, 'admin');
      this.router.navigate(['/admin']);
    } else {
      if (isNurse) {
        setCacheData(doctorDetails.ROLE, 'nurse');
        this.router.navigate(['/dashboard/hw-profile']);
      } else {
        setCacheData(doctorDetails.ROLE, 'doctor');
        this.router.navigate(['/dashboard']);
      }
    }
  }

  /**
  * Check user session
  * @return {void}
  */
  checkSession() {
    this.authService.checkSession().subscribe({
      next: (res: CheckSessionResponseModel) => {
        this.rememberMe = res.rememberme;
        this.authService.rememberMe = this.rememberMe ? true : false;
      }
    });
  }
}
