import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProviderAttributeValidator } from 'src/app/core/validators/ProviderAttributeValidator';
import { RolesModel } from 'src/app/model/model';
import { AuthService } from 'src/app/services/auth.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit, OnDestroy{
  personalInfoForm: FormGroup;
  phoneNumberValid: any;
  phoneNumber: any;
  phoneNumberObj: any;
  maxTelLegth1: number;
  checkingPhoneValidity: boolean;
  phoneValid: any;
  emailValid: any;
  submitted: boolean = false;
  uuid: string = "";
  providerUuid: string = "";
  providerAttrData: any = [];
  controlsArray: string[] = [];
  subscription1: any;

  constructor(private authService: AuthService, private activatedRoute: ActivatedRoute, private toastr: ToastrService, private router: Router){
    this.activatedRoute.params.subscribe(paramsId => {
        if(paramsId?.uuid){
          this.uuid = paramsId?.uuid
        }
        this.personalInfoForm = new FormGroup({
          givenName: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
          middleName: new FormControl('', [Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
          familyName: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
          gender: new FormControl('M', [Validators.required]),
          role: new FormControl('doctor', [Validators.required]),
          countryCode: new FormControl('+91'),
          phoneNumber: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
          emailId: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
          username: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`% ]*$/), Validators.minLength(3), Validators.maxLength(20)], [ProviderAttributeValidator.usernameValidator(this.authService)]),
          password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/), Validators.minLength(8), Validators.maxLength(20)]),
        });
        
    });
  }

  get f1() { return this.personalInfoForm.controls; }

  ngOnInit(){
    this.subscription1 = this.personalInfoForm.get(doctorDetails.PHONE_NUMBER).valueChanges.subscribe((val: string) => {
      if (val) {
        if (val.length > this.maxTelLegth1) {
          this.personalInfoForm.get(doctorDetails.PHONE_NUMBER).setValue(val.substring(0, this.maxTelLegth1));
        }
      }
    });
    this.getUserDetails();
  }

  getUserDetails(){
    if(this.uuid){
      this.authService.getUser(this.uuid).subscribe(res=>{
        this.personalInfoForm.controls['username'].clearAsyncValidators();
        this.personalInfoForm.controls['username'].disable({onlySelf:true});
        this.personalInfoForm.removeControl('password');
        this.personalInfoForm.controls["givenName"].setValue(res.data.person?.preferredName?.givenName);
        this.personalInfoForm.controls['givenName'].disable({onlySelf:true});
        this.personalInfoForm.controls["middleName"].setValue(res.data.person?.preferredName?.middleName);
        this.personalInfoForm.controls['middleName'].disable({onlySelf:true});
        this.personalInfoForm.controls["familyName"].setValue(res.data.person?.preferredName?.familyName);
        this.personalInfoForm.controls['familyName'].disable({onlySelf:true});
        this.personalInfoForm.controls["gender"].setValue(res.data.person?.gender);
        this.personalInfoForm.controls['gender'].disable({onlySelf:true});
        this.personalInfoForm.controls["role"].setValue(this.getRole(res.data.roles));
        this.personalInfoForm.controls['role'].disable({onlySelf:true});
        this.personalInfoForm.controls["username"].setValue(res.data.username);
        this.authService.getProvider(this.uuid).subscribe(provider=>{
          let currentProvider = provider.results.pop();
          this.providerUuid = currentProvider.uuid;
          this.controlsArray = Object.keys(this.personalInfoForm.controls);
          this.personalInfoForm.controls['emailId'].setAsyncValidators([ProviderAttributeValidator.createValidator(this.authService, doctorDetails.EMAIL_ID, this.providerUuid)]);
          currentProvider.attributes.forEach(attr=>{
            if(this.controlsArray.includes(attr.attributeType.display)){
              this.providerAttrData.push({uuid:attr.uuid, key: attr.attributeType.display, value: attr.value});
              this.personalInfoForm.get(attr.attributeType.display).setValue(attr.value);
            }
          })
          this.phoneNumberValid = true;
          this.validateProviderAttribute(doctorDetails.PHONE_NUMBER);
        });
      })
    } else {
      this.personalInfoForm.controls['emailId'].setAsyncValidators([ProviderAttributeValidator.createValidator(this.authService, doctorDetails.EMAIL_ID, "")]);
    }
  }
  
  /**
  * Callback for phone number input error event
  * @param {boolean} $event - True if valid else false
  * @param {string} errorFor - Error for which input
  * @return {void}
  */
  hasError(event, errorFor: string) {
    switch (errorFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberValid = event;
        break;
    }
  }

  /**
  * Callback for a input for phone number get valid
  * @param {string} $event - Phone number
  * @param {string} changedFor - Which input changed
  * @return {void}
  */
  getNumber(event, changedFor: string) {
    switch (changedFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberValid = true;
        this.phoneNumber = event;
        this.validateProviderAttribute(doctorDetails.PHONE_NUMBER);
        break;
    }
  }

  /**
  * Callback for a phone number object change event
  * @param {string} $event - change event
  * @param {string} objectFor - Which object changed
  * @return {void}
  */
  telInputObject(event, objectFor: string) {
    switch (objectFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberObj = event;
        break;
    }
  }

  /**
  * Callback for a phone number country change event
  * @param {string} $event - country change event
  * @param {string} changedFor - For which object country changed
  * @return {void}
  */
  onCountryChange(event, changedFor: string) {
    switch (changedFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberValid = false;
        this.phoneNumberObj.setCountry(event.iso2);
        this.personalInfoForm.patchValue({ countryCode: event?.dialCode });
        this.maxTelLegth1 = this.authService.getInternationalMaskByCountryCode(event.iso2.toUpperCase(), false).filter((o) => o !== ' ').length;
        break;
    }
  }

  /**
  * Validate phone number/email already exists or not
  * @param {string} type - Attribute Type email/phone number
  * @return {void}
  */
  validateProviderAttribute(type: string) {
    this.checkingPhoneValidity = true;
    this.authService.validateProviderAttribute(type, this.personalInfoForm.value[type],this.providerUuid).subscribe(res => {
      if (res.success) {
        if (type === doctorDetails.PHONE_NUMBER) {
          this.phoneValid = res.data;
        } else {
          this.emailValid = res.data;
        }
        setTimeout(() => {
          this.checkingPhoneValidity = false;
        }, 500);
      }
    });
  }

  /**
  * Add/Update the User
  * @return {void}
  */
  save(){
    this.submitted = true;
    if(this.personalInfoForm.valid && this.phoneValid){
      if(this.uuid){
        let payload = [];
        this.providerAttrData.forEach(data=>{
          let controlName = data.key;
          if(this.controlsArray.includes(controlName)){
            payload.push({uuid:data.uuid, value:this.personalInfoForm.controls[controlName].value});
          }
        });
        this.authService.setProvider(this.providerUuid,payload).subscribe(res=>{
            this.toastr.success("User has been successfully updated", "Update successful");
            this.router.navigate(["admin/actions/user-creation"]);
        })
      } else {
        this.authService.createUser(this.personalInfoForm.value).subscribe(res=>{
          if(res.status){
            this.toastr.success("New User has been successfully updated", "Creation successful");
            this.router.navigate(["admin/actions/user-creation"]);
          }
        })
      }
    }
  }

  getRole(roles: RolesModel[]): string{
    return roles.filter(r=>r.display.includes("Doctor")).length ? "doctor" : "nurse";
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }
}
