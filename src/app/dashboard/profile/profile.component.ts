import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { SignaturePad } from 'angular2-signaturepad';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ProviderService } from 'src/app/services/provider.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatTabGroup } from '@angular/material/tabs';
import { AuthService } from 'src/app/services/auth.service';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxRolesService } from 'ngx-permissions';
import { ProviderAttributeValidator } from 'src/app/core/validators/ProviderAttributeValidator';
import { TranslateService } from '@ngx-translate/core';
import { ImageCropComponent } from 'src/app/modal-components/image-crop/image-crop.component';
import { MatDialogRef } from '@angular/material/dialog';
import { CoreService } from 'src/app/services/core/core.service';
import { getCacheData, setCacheData } from 'src/app/utils/utility-functions';
import { languages, doctorDetails } from 'src/config/constant';
import { ApiResponseModel, DataItemModel, ProviderAttributeTypeModel, ProviderAttributeTypesResponseModel, ProviderModel, ProviderResponseModel, SpecializationModel, UserModel } from 'src/app/model/model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { AppConfigService } from 'src/app/services/app-config.service';

const tabs = ['Draw', 'Generate', 'Upload'];

export const PICK_FORMATS = {
  parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd MMM yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {

  file;
  user: UserModel;
  provider: ProviderModel;
  doctorName: string;
  baseUrl: string = environment.baseURL;
  profilePicUrl: string|ArrayBuffer = 'assets/svgs/user.svg';
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChild(MatStepper) stepper: MatStepper;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  dialogRef: MatDialogRef<ImageCropComponent>;

  fonts: DataItemModel[] = [
    {
      id: 1,
      name: 'Arty',
      text: 'arty'
    },
    {
      id: 2,
      name: 'Asem',
      text: 'asem'
    },
    {
      id: 3,
      name: 'Youthness',
      text: 'youthness'
    },
    {
      id: 4,
      name: 'Almondita',
      text: 'almondita'
    }
  ];

  languages: DataItemModel[] = [
    {
      id: 1,
      name: 'English'
    },
    {
      id: 2,
      name: 'Hindi'
    },
    {
      id: 3,
      name: 'Tamil'
    },
    {
      id: 4,
      name: 'Gujrathi'
    },
    {
      id: 5,
      name: 'Bangla'
    }
  ];

  professions: DataItemModel[] = [
    {
      id: 1,
      name: 'MBBS'
    },
    {
      id: 2,
      name: 'MBBS, MD'
    },
    {
      id: 3,
      name: 'Dentist'
    },
    {
      id: 4,
      name: 'Other'
    }
  ];

  specializations: SpecializationModel[] = [];

  // specializations: DataItemModel[] = [
  //   {
  //     id: 1,
  //     name: 'General Physician'
  //   },
  //   {
  //     id: 2,
  //     name: 'Dermatologist'
  //   },
  //   {
  //     id: 3,
  //     name: 'Gynecologist'
  //   },
  //   {
  //     id: 4,
  //     name: 'Pediatrician'
  //   }
  // ];

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 5,
    'canvasWidth': 300,
    'canvasHeight': 100,
    'backgroundColor': '#FFFFFF'
  };

  personalInfoForm: FormGroup;
  professionalInfoForm: FormGroup;
  signatureType = 'Draw';
  selectedSignatureTabIndex = 0;
  signatureFile;
  signaturePicUrl: string|ArrayBuffer;
  phoneNumberValid = false;
  whatsAppNumberValid = false;
  phoneNumber = '';
  whatsAppNumber = '';
  submitted = false;
  providerAttributeTypes: ProviderAttributeTypeModel[] = [];
  phoneNumberObj;
  whatsAppObj;
  subscription1: Subscription;
  subscription2: Subscription;
  maxTelLegth1 = 10;
  maxTelLegth2 = 10;
  oldPhoneNumber = '';
  today: string;
  phoneValid = false;
  emailValid = false;
  checkingPhoneValidity = false;
  specialization: string = '';
  @ViewChild('fileUploader') fileUploader: ElementRef;

  constructor(
    private pageTitleService: PageTitleService,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private providerService: ProviderService,
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private rolesService: NgxRolesService,
    private translateService: TranslateService,
    private coreService: CoreService,
    private appointmentService: AppointmentService,
    private appConfigService: AppConfigService) {
  
    this.personalInfoForm = new FormGroup({
      givenName: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
      middleName: new FormControl('', [Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
      familyName: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
      gender: new FormControl('M', [Validators.required]),
      birthdate: new FormControl('', [Validators.required]),
      age: new FormControl('', [Validators.required, Validators.min(18), Validators.pattern(/^[0-9]*$/)]),
      countryCode1: new FormControl('+91'),
      countryCode2: new FormControl('+91'),
      phoneNumber: new FormControl('', [Validators.required]),
      whatsapp: new FormControl('', [Validators.required]),
      emailId: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')], [ProviderAttributeValidator.createValidator(this.authService, doctorDetails.EMAIL_ID, getCacheData(true, doctorDetails.PROVIDER).uuid)]),
      signatureType: new FormControl('Draw', [Validators.required]),
      textOfSign: new FormControl(null),
      fontOfSign: new FormControl(null),
      signature: new FormControl(null)
    });

    this.professionalInfoForm = new FormGroup({
      typeOfProfession: new FormControl(null, [Validators.required]),
      registrationNumber: new FormControl(null, [Validators.required, Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9-]*$/)]),
      specialization: new FormControl(null, [Validators.required]),
      consultationLanguage: new FormControl(null, [Validators.required]),
      workExperience: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]*$/)]),
      researchExperience: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]*$/)]),
      workExperienceDetails: new FormControl('', [Validators.required])
    });
  }

  get f1() { return this.personalInfoForm.controls; }
  get f2() { return this.professionalInfoForm.controls; }


  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.today = moment().format('YYYY-MM-DD');
    this.user = getCacheData(true, doctorDetails.USER);
    this.provider = getCacheData(true, doctorDetails.PROVIDER);
    this.doctorName = getCacheData(false, doctorDetails.DOCTOR_NAME);
    this.profilePicUrl = this.baseUrl + '/personimage/' + this.provider.person.uuid;
    this.pageTitleService.setTitle(null);
    this.formControlValueChanges();
    this.getProviderAttributeTypes();
    this.specializations = this.appConfigService.specialization;
    this.subscription1 = this.personalInfoForm.get(doctorDetails.PHONE_NUMBER).valueChanges.subscribe((val: string) => {
      if (val) {
        if (val.length > this.maxTelLegth1) {
          this.personalInfoForm.get(doctorDetails.PHONE_NUMBER).setValue(val.substring(0, this.maxTelLegth1));
        }
      }
    });
    this.subscription2 = this.personalInfoForm.get(doctorDetails.WHATS_APP).valueChanges.subscribe((val: string) => {
      if (val) {
        if (val.length > this.maxTelLegth2) {
          this.personalInfoForm.get(doctorDetails.WHATS_APP).setValue(val.substring(0, this.maxTelLegth2));
        }
      }
    });
  }

  ngAfterViewInit() {
    // this.signaturePad is now available
    this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  /**
  * Subscribe to form control value changes observables
  * @return {void}
  */
  formControlValueChanges() {
    this.personalInfoForm.get(doctorDetails.TEXT_OF_SIGN).valueChanges.subscribe(val => {
      if (val) {
        this.fonts.map((f: DataItemModel) => f.text = val);
      } else {
        this.fonts.map((f: DataItemModel) => f.text = f.name);
      }
    });

    this.personalInfoForm.get(doctorDetails.SIGNATURE_TYPE).valueChanges.subscribe(val => {
      if (val) {
        this.signatureType = val;
        if (val === 'Generate') {
          this.personalInfoForm.get(doctorDetails.TEXT_OF_SIGN).setValidators([Validators.required, Validators.maxLength(20)]);
          this.personalInfoForm.get(doctorDetails.TEXT_OF_SIGN).updateValueAndValidity();
          this.personalInfoForm.get(doctorDetails.FONT_OF_SIGN).setValidators([Validators.required]);
          this.personalInfoForm.get(doctorDetails.FONT_OF_SIGN).updateValueAndValidity();
        } else {
          this.personalInfoForm.get(doctorDetails.TEXT_OF_SIGN).clearValidators();
          this.personalInfoForm.get(doctorDetails.TEXT_OF_SIGN).updateValueAndValidity();
          this.personalInfoForm.get(doctorDetails.FONT_OF_SIGN).clearValidators();
          this.personalInfoForm.get(doctorDetails.FONT_OF_SIGN).updateValueAndValidity();
        }
        if (this.selectedSignatureTabIndex !== tabs.indexOf(val)) {
          setTimeout(() => {
            this.selectedSignatureTabIndex = tabs.indexOf(val);
          }, 1000);
        }
      } else {
        this.personalInfoForm.get(doctorDetails.TEXT_OF_SIGN).clearValidators();
        this.personalInfoForm.get(doctorDetails.TEXT_OF_SIGN).updateValueAndValidity();
        this.personalInfoForm.get(doctorDetails.FONT_OF_SIGN).clearValidators();
        this.personalInfoForm.get(doctorDetails.FONT_OF_SIGN).updateValueAndValidity();
        setTimeout(() => {
          this.personalInfoForm.patchValue({ signatureType: 'Draw' });
        }, 1000);
      }
    });

    this.personalInfoForm.get(doctorDetails.BIRTHDATE).valueChanges.subscribe(val => {
      if (val) {
        this.personalInfoForm.patchValue({ age: moment().diff(moment(val), 'years', false) });
      }
    });

    this.professionalInfoForm.get(doctorDetails.SPECIALIZATION).valueChanges.subscribe(val => {
      if (val && val != this.specialization) {
        this.appointmentService.checkAppointmentPresent(this.user.uuid, moment().startOf('year').format('DD/MM/YYYY'), moment().endOf('year').format('DD/MM/YYYY'), this.specialization).subscribe((res: ApiResponseModel) => {
          if (res.status) {
            if (res.data) {
              this.toastr.warning("You have some appointments booked for this specialization, please complete them first.", "Can't change specialization!");
              this.professionalInfoForm.patchValue({ specialization: this.specialization });
            }
          }
        }, (err => {
          this.toastr.error("Something went wrong.", "Can't change specialization!");
          this.professionalInfoForm.patchValue({ specialization: this.specialization });
        }));
      }
    });
  }

  /**
  * Get provider attribute types
  * @return {void}
  */
  getProviderAttributeTypes() {
    this.providerService.getProviderAttributeTypes().subscribe((res: ProviderAttributeTypesResponseModel) => {
      if (res.results.length) {
        this.providerAttributeTypes = res.results;
        this.patchFormValues();
      }
    });
  }

  /**
  * Patch the form values with the provider details
  * @return {void}
  */
  patchFormValues() {
    if (this.provider) {

      const personalFormValues: any = {};
      const professionalFormValues: any = {};

      personalFormValues.givenName = (this.provider.person?.preferredName) ? this.provider.person?.preferredName.givenName : null,
      personalFormValues.middleName = (this.provider.person?.preferredName) ? this.provider.person?.preferredName.middleName : null,
      personalFormValues.familyName = (this.provider.person?.preferredName) ? this.provider.person?.preferredName.familyName : null,
      personalFormValues.gender = (this.provider.person?.gender) ? this.provider.person?.gender : null,
      personalFormValues.birthdate = (this.provider.person?.birthdate) ? moment(this.provider.person?.birthdate).format('YYYY-MM-DD') : null,
      personalFormValues.age = (this.provider.person?.age) ? this.provider.person?.age : null;
      this.providerAttributeTypes.forEach((attrType: ProviderAttributeTypeModel) => {
        switch (attrType.display) {
          case doctorDetails.ADDRESS:

            break;
          case doctorDetails.CONSULTATION_LANGUAGE:
            professionalFormValues.consultationLanguage = this.getAttributeValue(attrType.uuid, attrType.display)?.split(',');
            break;
          case doctorDetails.COUNTRY_CODE:
            personalFormValues.countryCode1 = this.getAttributeValue(attrType.uuid, attrType.display);
            personalFormValues.countryCode2 = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.EMAIL_ID:
            personalFormValues.emailId = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.FONT_OF_SIGN:
            personalFormValues.fontOfSign = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.PHONE_NUMBER:
            personalFormValues.phoneNumber = this.getAttributeValue(attrType.uuid, attrType.display);
            this.phoneNumberValid = (personalFormValues.phoneNumber) ?  true : false;
            this.oldPhoneNumber = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.QUALIFICATION:

            break;
          case doctorDetails.REGISTRATION_NUMBER:
            professionalFormValues.registrationNumber = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.RESEARCH_EXPERIENCE:
            professionalFormValues.researchExperience = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.SIGNATURE:
            personalFormValues.signature = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.SIGNATURE_TYPE:
            this.signatureType = this.getAttributeValue(attrType.uuid, attrType.display);
            personalFormValues.signatureType = this.signatureType;
            break;
          case doctorDetails.SPECIALIZATION:
            this.specialization = this.getAttributeValue(attrType.uuid, attrType.display);
            professionalFormValues.specialization = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.TEXT_OF_SIGN:
            personalFormValues.textOfSign = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.TYPE_OF_PROFESSION:
            professionalFormValues.typeOfProfession = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.WHATS_APP:
            personalFormValues.whatsapp = this.getAttributeValue(attrType.uuid, attrType.display);
            this.whatsAppNumberValid = (personalFormValues.whatsapp) ?  true : false;
            break;
          case doctorDetails.WORK_EXPERIENCE:
            professionalFormValues.workExperience = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.WORK_EXPERIENCE_DETAILS:
            professionalFormValues.workExperienceDetails = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          default:
            break;
        }
      });
      this.personalInfoForm.patchValue(personalFormValues);
      if (personalFormValues.phoneNumber) { this.validateProviderAttribute(doctorDetails.PHONE_NUMBER); }
      this.professionalInfoForm.patchValue(professionalFormValues);
      const signature = this.personalInfoForm.value.signature;
      switch (this.signatureType) {
        case 'Draw':
          this.signaturePad.clear();
          this.signaturePad.fromDataURL(signature);
          break;
        case 'Generate':

          break;
        case 'Upload':
          this.signaturePicUrl = signature;
          fetch(signature)
            .then(res => res.blob())
            .then(blob => {
              this.signatureFile = new File([blob], 'inetelehealth', { type: this.detectMimeType(signature.split(',')[0]) });
            });
          break;
        default:
          break;
      }
    }
  }

  /**
  * Get attribute value for the given provider attribute uuid and type
  * @param {string} uuid - Provider attribute uuid
  * @param {string} display - Provider attribute type name/display
  * @return {any} - Provider attribute value
  */
  getAttributeValue(uuid: string, display: string) {
    let attrValue = null;
    for (let i = 0; i < this.provider.attributes.length; i++) {
      if (this.provider.attributes[i].attributeType.display === display && this.provider.attributes[i].attributeType.uuid === uuid && this.provider.attributes[i].voided === false) {
        attrValue = this.provider.attributes[i].value;
        break;
      }
    }
    return attrValue;
  }

  /**
  * Callback for step change event
  * @param {Event} event - Step change event
  * @return {void}
  */
  stepChanged(event) {
    this.submitted = false;
  }

  /**
  * Callback for image upload event
  * @param {Event} event - File upload event
  * @return {void}
  */
  async preview(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      if (!this.file.name.endsWith('.jpg') && !this.file.name.endsWith('.jpeg')) {
        this.toastr.warning(this.translateService.instant('Upload JPG/JPEG format image only.'), this.translateService.instant('Upload error!'));
        return;
      }

      if (this.dialogRef) {
        this.dialogRef.close();
        return;
      }

      const imageBase64 = await this.coreService.blobToBase64(this.file);
      this.dialogRef = this.coreService.openImageCropModal({base64: imageBase64.toString().split(',')[1]});
      this.dialogRef.afterClosed().subscribe(async result => {
        if (result) {
          const imageBlob = result.toString().split(',')[1];
          const payload = {
            person: this.provider.person.uuid,
            base64EncodedImage: imageBlob
          };
          this.profileService.updateProfileImage(payload).subscribe((res) => {
            this.profilePicUrl = result;
            this.profileService.setProfilePic(result);
            this.toastr.success(this.translateService.instant('Profile picture uploaded successfully!'), this.translateService.instant('Profile Pic Uploaded'));
          });
        }
        this.dialogRef = undefined;
        this.fileUploader.nativeElement.value = null;
      });
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
      case doctorDetails.WHATS_APP_NUMBER:
        this.whatsAppNumberValid = event;
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
      case doctorDetails.WHATS_APP_NUMBER:
        this.whatsAppNumberValid = true;
        this.whatsAppNumber = event;
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
      case doctorDetails.WHATS_APP_NUMBER:
        this.whatsAppObj = event;
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
        this.personalInfoForm.patchValue({ countryCode1: event?.dialCode });
        this.maxTelLegth1 = this.authService.getInternationalMaskByCountryCode(event.iso2.toUpperCase(), false).filter((o) => o !== ' ').length;
        break;
      case doctorDetails.WHATS_APP_NUMBER:
        this.whatsAppNumberValid = false;
        this.whatsAppObj.setCountry(event.iso2);
        this.personalInfoForm.patchValue({ countryCode2: event?.dialCode });
        this.maxTelLegth2 = this.authService.getInternationalMaskByCountryCode(event.iso2.toUpperCase(), false).filter((o) => o !== ' ').length;
        break;
    }
  }

  /**
  * Clear signature pad
  * @return {void}
  */
  clearSignature() {
    this.signaturePad.clear();
  }

  /**
  * Callback for draw complete on signature pad
  * @return {void}
  */
  drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
  }

  /**
  * Callback for draw started on signature pad
  * @return {void}
  */
  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
  }

  /**
  * Callback for signature tab changed event
  * @param {Event} event - Tab changed event
  * @return {void}
  */
  signatureTabChanged(event) {
    this.selectedSignatureTabIndex = event.index;
    this.signatureType = tabs[event.index];
    this.personalInfoForm.patchValue({ signatureType: this.signatureType });
  }

  /**
  * Callback for file drop event
  * @param {Event} event - File drop event
  * @return {void}
  */
  onFilesDropped(event) {
    if (event.addedFiles.length) {
      this.signatureFile = event.addedFiles[0];
      const filename = this.signatureFile.name;
      if (!(filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.PNG') || filename.endsWith('.JPEG') || filename.endsWith('.JPG'))) {
        this.reset();
        alert('Please upload png, jpg or jpeg file only.');
        return;
      }
      if (this.signatureFile.size < 5120) {
        this.reset();
        this.toastr.error(this.translateService.instant('Upload a scanned image of your signature. having size (5kb to 48kb)'), this.translateService.instant('Invalid File!'));
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.signaturePicUrl = fileReader.result;
      };
      fileReader.onerror = (error) => {
        this.reset();
      };
      fileReader.readAsDataURL(this.signatureFile);
    }
    if (event.rejectedFiles.length) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.toastr.error(this.translateService.instant('Upload a scanned image of your signature. having size (5kb to 48kb)'), this.translateService.instant('Invalid File!'));
      }
      if (event.rejectedFiles[0].reason === 'type') {
        this.toastr.error(this.translateService.instant('Upload a scanned image of your signature. having type png, jpg, jpeg only.'), this.translateService.instant('Invalid File!'));
      }
    }
  }

  /**
  * Reset signature
  * @return {void}
  */
  reset() {
    this.signatureFile = undefined;
    this.signaturePicUrl = '';
  }

  /**
  * Check if step 1 is valid and move to next step
  * @return {void}
  */
  goToNextStep() {
    this.submitted = true;
    if (this.personalInfoForm.invalid || !this.phoneNumberValid || !this.whatsAppNumberValid || !this.phoneValid) {
      return;
    }
    if (this.selectedSignatureTabIndex === 0 && this.signaturePad.isEmpty()) {
      this.toastr.warning(this.translateService.instant('Please draw your signature.'), this.translateService.instant('Draw Signature'));
      return;
    }
    if (this.selectedSignatureTabIndex === 2 && !this.signatureFile) {
      this.toastr.warning(this.translateService.instant('Please upload signature.'), this.translateService.instant('Upload Signature'));
      return;
    }
    this.stepper.next();
    this.submitted = false;
  }

  /**
  * Update user profile
  * @return {void}
  */
  updateProfile() {
    this.submitted = true;
    if (this.professionalInfoForm.invalid) {
      return;
    }

    const pf1 = this.personalInfoForm.value;

    this.providerService.updatePerson(this.provider.person.uuid, pf1.gender, pf1.age, pf1.birthdate).subscribe(res1 => {
      if (this.provider.person?.preferredName) {
        this.providerService.updatePersonName(this.provider.person.uuid, this.provider.person?.preferredName.uuid, pf1.givenName, pf1.middleName, pf1.familyName).subscribe(res2 => {
          this.updateSignature();
        });
      } else {
        this.providerService.createPersonName(this.provider.person.uuid, pf1.givenName, pf1.middleName, pf1.familyName).subscribe(res2 => {
          this.updateSignature();
        });
      }
    });
    this.submitted = false;
  }

  /**
  * Update signature
  * @return {void}
  */
  updateSignature() {
    let signature: string|ArrayBuffer;

    switch (this.signatureType) {
      case 'Draw':
        signature = this.signaturePad.toDataURL('image/jpeg');
        this.providerService.uploadSignature(signature.split(',')[1], this.provider.uuid).subscribe((res) => {
          this.personalInfoForm.patchValue({ signature });
          this.updateProviderAttributes();
        });
        break;

      case 'Generate':
        this.providerService.creatSignature(this.provider.uuid, this.getAttributeValueFromForm(doctorDetails.TEXT_OF_SIGN), this.getAttributeValueFromForm(doctorDetails.FONT_OF_SIGN)).subscribe((res) => {
          if (res.success) {
            fetch(res.data.url).then(pRes => pRes.blob()).then(blob => {
              const reader = new FileReader();
              reader.onload = () => {
                signature = reader.result.toString();
                this.personalInfoForm.patchValue({ signature });
                this.updateProviderAttributes();
              };
              reader.readAsDataURL(blob);
            });
          }
        });
        break;

      case 'Upload':
        signature = this.signaturePicUrl;
        this.providerService.uploadSignature((<string>signature).split(',')[1], this.provider.uuid).subscribe((res) => {
          this.personalInfoForm.patchValue({ signature });
          this.updateProviderAttributes();
        });
        break;

      default:
        break;
    }
  }

  /**
  * Update logged-in user provider attributes
  * @return {void}
  */
  updateProviderAttributes() {
    const requests = [];
    this.providerAttributeTypes.forEach((attrType: ProviderAttributeTypeModel) => {
      switch (attrType.display) {
        case doctorDetails.ADDRESS:
          break;
        case doctorDetails.CONSULTATION_LANGUAGE:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display).toString()));
          break;
        case doctorDetails.COUNTRY_CODE:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm('countryCode1')));
          break;
        case doctorDetails.EMAIL_ID:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.FONT_OF_SIGN:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.PHONE_NUMBER:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.QUALIFICATION:
          break;
        case doctorDetails.REGISTRATION_NUMBER:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.RESEARCH_EXPERIENCE:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.SIGNATURE:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.SIGNATURE_TYPE:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.SPECIALIZATION:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.TEXT_OF_SIGN:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.TYPE_OF_PROFESSION:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.WHATS_APP:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.WORK_EXPERIENCE:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.WORK_EXPERIENCE_DETAILS:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        default:
          break;
      }
    });
    this.providerService.requestDataFromMultipleSources(requests).subscribe((responseList) => {
      this.toastr.success(this.translateService.instant('Profile has been updated successfully'), this.translateService.instant('Profile Updated'));
      if (this.specialization != this.professionalInfoForm.get('specialization').value) {
        this.specialization = this.professionalInfoForm.get('specialization').value;
        this.appointmentService.updateSlotSpeciality(this.user.uuid, this.specialization).subscribe((resp: ApiResponseModel) => {});
      }
      if (this.personalInfoForm.get(doctorDetails.PHONE_NUMBER).dirty && this.oldPhoneNumber !== this.getAttributeValueFromForm(doctorDetails.PHONE_NUMBER)) {
        this.toastr.warning(this.translateService.instant('Kindly re-login to see updated details'), this.translateService.instant('Re-login'));
        this.cookieService.delete('app.sid', '/');
        this.authService.logOut();
      } else {
        this.authService.getProvider(getCacheData(true, doctorDetails.USER).uuid).subscribe((provider: ProviderResponseModel) => {
          if (provider.results.length) {
            setCacheData(doctorDetails.PROVIDER, JSON.stringify(provider.results[0]));
            setCacheData(doctorDetails.DOCTOR_NAME, provider.results[0].person.display);
            let u = getCacheData(true,doctorDetails.USER);
            u.person.display = provider.results[0].person.display;
            setCacheData(doctorDetails.USER, JSON.stringify(u));
            const role = this.rolesService.getRole('ORGANIZATIONAL: SYSTEM ADMINISTRATOR');
            if (role) {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        });
      }
    });
  }

  /**
  * Get provider attribute uuid for a given diaplay and provider attrubute type uuid
  * @param {string} uuid - Provider attribute type uuid
  * @param {string} display - Display name
  * @return {string} - Provider attribute uuid
  */
  getAttributeUuid(uuid: string, display: string): string {
    let attrUuid: string = null;
    for (let i = 0; i < this.provider.attributes.length; i++) {
      if (this.provider.attributes[i].attributeType.display === display && this.provider.attributes[i].attributeType.uuid === uuid && this.provider.attributes[i].voided === false) {
        attrUuid = this.provider.attributes[i].uuid;
        break;
      }
    }
    return attrUuid;
  }

  /**
  * Get value for a given key from form
  * @param {string} key - Key name
  * @return {any} - Value for a given key
  */
  getAttributeValueFromForm(key: string) {
    const formValue = { ...this.personalInfoForm.value, ...this.professionalInfoForm.value };
    return formValue[key];
  }

  /**
  * Detect MIME type from the base 64 url
  * @param {string} b64 - Base64 url
  * @return {string} - MIME type
  */
  detectMimeType(b64: string) {
    return this.profileService.detectMimeType(b64);
  }

  /**
  * Validate phone number/email already exists or not
  * @param {string} type - Attribute Type email/phone number
  * @return {void}
  */
  validateProviderAttribute(type: string) {
    this.checkingPhoneValidity = true;
    this.authService.validateProviderAttribute(type, this.personalInfoForm.value[type], this.provider.uuid).subscribe(res => {
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

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
  }

}
