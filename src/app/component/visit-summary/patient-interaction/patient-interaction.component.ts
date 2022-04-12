import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VisitService } from 'src/app/services/visit.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { VcComponent } from '../../vc/vc.component';
import { environment } from 'src/environments/environment';
import { ConfirmDialogService } from '../reassign-speciality/confirm-dialog/confirm-dialog.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any;

@Component({
  selector: 'app-patient-interaction',
  templateUrl: './patient-interaction.component.html',
  styleUrls: ['./patient-interaction.component.css'],
  animations: [
    trigger('moveInLeft', [
      transition('void=> *', [style({ transform: 'translateX(300px)' }),
      animate(200, keyframes([
        style({ transform: 'translateX(300px)' }),
        style({ transform: 'translateX(0)' })
      ]))]),
      transition('*=>void', [style({ transform: 'translateX(0px)' }),
      animate(100, keyframes([
        style({ transform: 'translateX(0px)' }),
        style({ transform: 'translateX(300px)' })
      ]))])
    ])
  ]
})
export class PatientInteractionComponent implements OnInit {
  @Output() isDataPresent = new EventEmitter<boolean>();
  msg: any = [];
  whatsappLink: string;
  phoneNo;
  doctorDetails: any = {};
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  encounterUuid: string;
  patientUuid = "";
  managerRoleAccess=false;
  videoIcon = environment.production
  ? "../../../intelehealth/assets/svgs/video-w.svg"
  : "../../../assets/svgs/video-w.svg";
  callRecordings = [];
  isNoOptionClicked = false;
  selectedReason:string;
  reasons = [
    'Not reachable',
    'Switched off',
    'Patient did not pick up',
    'Invalid number'
  ]

  interaction = new FormGroup({
    interaction: new FormControl('', [Validators.required]),
    selectedReason: new FormControl('')
  });

  constructor(private visitService: VisitService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private encounterService: EncounterService,
    private dialog: MatDialog,
    private dialogService: ConfirmDialogService,
    private diagnosisService: DiagnosisService
    ) { }

  ngOnInit() {

    const userDetails = getFromStorage('user');
    if (userDetails) {
      const roles = userDetails['roles'];
      roles.forEach(role => {
        if (role.name === "Project Manager") {
          this.managerRoleAccess = true;
        }
      });
    } 

    const visitId = this.route.snapshot.params['visit_id'];
    this.patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.visitService.patientInfo(uuid)
      .subscribe(info => {
        info.person['attributes'].forEach(attri => {
          if (attri.attributeType.display.match('Telephone Number')) {
            info['telephone'] = attri.value;
          }
        });
          if ( info['telephone'] != null) {
            this.phoneNo =  info['telephone'];
            const whatsapp =  info['telephone'];
            // tslint:disable-next-line: max-line-length
            const text = encodeURI(`Hello I'm calling for patient ${info.person.display} from Swasth Sampark Helpline`);
            this.whatsappLink = `https://wa.me/91${whatsapp}?text=${text}`;
            this.getRecordings(); 
          }
      });
    this.visitService.getAttribute(visitId)
      .subscribe(response => {
        const result = response.results;
        if (result.length !== 0) {
          this.msg = result.filter((pType) =>
          pType.attributeType.uuid === "6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc"
        );
        }
      });
  }

  submit() {
    const visitId = this.route.snapshot.params['visit_id'];
    const formValue = this.interaction.value;
    const value = this.isNoOptionClicked ? formValue.interaction+' : '+formValue.selectedReason :  formValue.interaction;
    const providerDetails = getFromStorage('provider');
    if (this.diagnosisService.isSameDoctor()) {
      this.visitService.getAttribute(visitId)
        .subscribe(response => {
          const result = response.results;
          if (result.length !== 0 && ["Yes", "No"].includes(response.value)) {
          } else {
            const json = {
              'attributeType': '6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc',
              'value': value
            };
            this.visitService.postAttribute(visitId, json)
              .subscribe(response1 => {
                this.isDataPresent.emit(true);
                this.msg.push({ uuid: response1.uuid, value: response1.value });
                if(formValue.interaction === "Yes") {
                  this.getRecordings();
                }
              });
          }
        });
      this.encounterUuid = getEncounterUUID;
      const attributes = providerDetails.attributes;
      this.doctorDetails.name = providerDetails.person.display;
      if (attributes.length) {
        attributes.forEach(attribute => {
          if (attribute.display.match('phoneNumber') != null) {
            this.doctorDetails.phone = `<a href="tel:${attribute.value}">Start Audio Call with ${this.doctorDetails.name} </a>`;
          }
          if (attribute.display.match('whatsapp') != null) {
            // tslint:disable-next-line: max-line-length
            this.doctorDetails.whatsapp = `<a href="https://wa.me/91${attribute.value}">Start WhatsApp Call ${this.doctorDetails.name}</a>`;
          }
        });
        if (this.doctorDetails.phone || this.doctorDetails.whatsapp) {
          if (this.doctorDetails.phone && this.doctorDetails.whatsapp) {
            this.doctorDetails.html = `${this.doctorDetails.phone}<br>${this.doctorDetails.whatsapp}`;
          } else if (this.doctorDetails.phone) {
            this.doctorDetails.html = `${this.doctorDetails.phone}`;
          } else if (this.doctorDetails.whatsapp) {
            this.doctorDetails.html = `${this.doctorDetails.whatsapp}`;
          }
          const date = new Date();
          const json = {
            concept: this.conceptAdvice,
            person: this.route.snapshot.params['patient_id'],
            obsDatetime: date,
            value: this.doctorDetails.html,
            encounter: this.encounterUuid
          };
          this.encounterService.postObs(json)
            .subscribe(response => { });
        }
      }
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const visitId = this.route.snapshot.params['visit_id'];
      const uuid = this.msg[i].uuid;
      this.visitService.deleteAttribute(visitId, uuid)
        .subscribe(res => {
          this.msg.splice(i, 1);
          this.isDataPresent.emit(false);
        });
      }
  }

  openVcModal() {
    this.dialog.open(VcComponent, {
      disableClose: true,
      data: {
        patientUuid: this.patientUuid,
      },
    });
  }

  startCall(patientMobileNo) {
    const providerDetails = getFromStorage('provider');
    let doctorsMobileNo: string;
    providerDetails.attributes.forEach(attribute => {
      if (attribute.display.match('phoneNumber') != null) {
        doctorsMobileNo = attribute.value;
      }
    });
    if (doctorsMobileNo) {
      this.visitService.startCall(patientMobileNo, doctorsMobileNo)
      .subscribe(()=> {
            this.openDialog("Calling to patient")
      }, () => {
            this.openDialog("Unable to connect this call, please try again")
      });
    } else {
      this.snackbar.open('To perform call, please update your phone no in MyAccount section', null, { duration: 4000 }); 
    }
  }

  openDialog(msg:string) {
    this.dialogService.openConfirmDialog(msg, "info")
      .afterClosed().subscribe();
  }

  displayReasons() {
    this.isNoOptionClicked = true;
    this.selectedReason = undefined;
  }

  setReason() {
    this.selectedReason = this.interaction.value.selectedReason;
  }

  private getRecordings() {
    this.visitService.getCallRecordings(this.phoneNo)
      .subscribe(res => {
        this.callRecordings = res?.data;
        this.callRecordings.sort((a, b) => new Date(a.CallStartTime).getTime() - new Date(b.CallStartTime).getTime()).reverse();
      });
  }
}
