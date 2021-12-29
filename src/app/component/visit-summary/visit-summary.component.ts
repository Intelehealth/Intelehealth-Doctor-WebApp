import { VisitService } from '../../services/visit.service';
import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
declare var getFromStorage: any, saveToStorage: any, getEncounterProviderUUID: any;

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.css']
})
export class VisitSummaryComponent implements OnInit {
  show = false;
  text: string;
  font: string;
  visitNotePresent = false;
  visitCompletePresent = false;
  setSpiner = true;
  doctorDetails; doctorValue;
  allVisit: Array<{}> = getFromStorage('allAwaitingConsult');
  allReferralVisit: Array<{}> = getFromStorage('referral');
  visitUuid: String = '';
  patientUuid: String = '';
  next: any;
  noVisit: Boolean = false;
  coordinator: Boolean = getFromStorage('coordinator') || false;

constructor(private service: EncounterService,
            private visitService: VisitService,
            private authService: AuthService,
            private snackbar: MatSnackBar,
            private route: ActivatedRoute,
            private router: Router) {
              this.router.routeReuseStrategy.shouldReuseRoute = function() {
                return false;
              };
            }

  ngOnInit() {
    setTimeout(() => {this.setSpiner = false; }, 1000);
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientUuid = this.route.snapshot.paramMap.get('patient_id');
    this.visitService.fetchVisitDetails(this.visitUuid)
    .subscribe(visitDetails => {
      visitDetails.encounters.forEach(visit => {
        if (visit.display.match('Visit Note') !== null) {
          saveToStorage('visitNoteProvider', visit);
          this.visitNotePresent = true;
          this.show = true;
        }
        if (visit.display.match('ADULTINITIAL') || visit.display.match('Vitals')) {
          saveToStorage('healthWorkerDetails', visit);
        }
        if (visit.display.match('Visit Complete') !== null) {
          this.visitCompletePresent = true;
          visit.encounterProviders[0].provider.attributes.forEach(element => {
            if (element.attributeType.display === 'textOfSign') {
              this.text = element.value;
            } if (element.attributeType.display === 'fontOfSign') {
              this.font = element.value;
            }
          });
        }
      });
    });
    this.nextVisitButton(this.coordinator ? this.allReferralVisit : this.allVisit);
  }

  nextVisitButton(visitData) {
    if (visitData.length) {
      const currentVisit = visitData.findIndex((visit: any) => this.visitUuid === visit.visitId);
      if (currentVisit !== -1) {
        this.next = {
          patientId : visitData[currentVisit + 1]['patientId'],
          visitId: visitData[currentVisit + 1]['visitId']
        };
      }
    } else {
      this.noVisit = true;
    }
  }

  onStartVisit() {
    const myDate = new Date(Date.now() - 30000);
    if (!this.visitNotePresent) {
      // const userDetails = getFromStorage('user');
      const providerDetails = getFromStorage('provider');
      // if (userDetails && providerDetails) {
        const providerUuid = providerDetails.uuid;
        const json = {
          patient: this.patientUuid,
          encounterType: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
          encounterProviders: [{
            provider: providerUuid,
            encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03'
          }],
          visit: this.visitUuid,
          encounterDatetime: myDate
        };
        this.service.postEncounter(json)
        .subscribe(response => {
          if (response) {
            this.visitService.fetchVisitDetails(this.visitUuid)
            .subscribe(visitDetails => { saveToStorage('visitNoteProvider', visitDetails.encounters[0]); });
            this.show = true;
            this.snackbar.open(`Visit Note Created`, null, {duration: 4000});
            const currentVisit = this.allVisit.findIndex((visit: any) => this.visitUuid === visit.visitId);
            if (currentVisit === this.allVisit.length) {
              this.noVisit = true;
            }
            this.allVisit.splice(currentVisit, 1);
            saveToStorage('allAwaitingConsult', this.allVisit);
          } else {
            this.snackbar.open(`Visit Note Not Created`, null, {duration: 4000});
          }
        });
      // } else {this.authService.logout(); }
    }
  }

  sign() {
    const myDate = new Date(Date.now() - 30000);
    // const userDetails = getFromStorage('user');
    const providerDetails = getFromStorage('provider');
    // if (userDetails && providerDetails) {
        this.doctorDetails = providerDetails;
        this.getDoctorValue();
        const providerUuid = providerDetails.uuid;
        // if (providerUuid === getEncounterProviderUUID()) {
        this.service.signRequest(providerUuid)
        .subscribe(res => {
          if (res.results.length) {
            res.results.forEach(element => {
              if (element.attributeType.display === 'textOfSign') {
                this.text = element.value;
              } if (element.attributeType.display === 'fontOfSign') {
                this.font = element.value;
              }
            });
            const json = {
              patient: this.patientUuid,
              encounterType: 'bd1fbfaa-f5fb-4ebd-b75c-564506fc309e',
              encounterProviders: [{
                provider: providerUuid,
                encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03'
                }],
              visit: this.visitUuid,
              encounterDatetime: myDate,
              obs: [{
                concept: '7a9cb7bc-9ab9-4ff0-ae82-7a1bd2cca93e',
                value: JSON.stringify(this.doctorValue)
              }],
            };
            this.service.postEncounter(json)
            .subscribe(post => {
              this.visitCompletePresent = true;
              this.snackbar.open('Visit Complete', null, {duration: 4000});
            });
          } else {
            if (window.confirm('Your signature is not setup! If you click "Ok" you would be redirected. Cancel will load this website ')) {
              this.router.navigateByUrl('/myAccount');
            }
          }
        });
      // } else {this.snackbar.open('Another doctor is viewing this case', null, {duration: 4000}); }
    // } else {this.authService.logout(); }
  }

  getDoctorValue = () => {
    const doctor = {};
    doctor['name'] = this.doctorDetails.person.display;
    // tslint:disable-next-line: max-line-length
    const doctorAttributes = ['phoneNumber', 'qualification', 'whatsapp', 'emailId', 'registrationNumber', 'specialization', 'address', 'fontOfSign', 'textOfSign'];
    doctorAttributes.forEach(attr => {
      const details = this.filterAttributes(this.doctorDetails.attributes, attr);
      if (details.length) {
        doctor[attr] = details[details.length - 1 ].value;
      }
    });
    this.doctorValue = doctor;
  }


 filterAttributes = (data, text) => {
    return data.filter(attr => attr.attributeType['display'].toLowerCase() === text.toLowerCase());
  }


}

