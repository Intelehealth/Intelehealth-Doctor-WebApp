import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Observable } from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { TranslationService } from 'src/app/services/translation.service';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from 'src/app/services/session.service';
declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-prescribed-test',
  templateUrl: './prescribed-test.component.html',
  styleUrls: ['./prescribed-test.component.css'],
  animations: [
    trigger('moveInLeft', [
       transition('void=> *', [style({transform: 'translateX(300px)'}),
         animate(200, keyframes ([
          style({transform: 'translateX(300px)'}),
          style({transform: 'translateX(0)'})
           ]))]),
    transition('*=>void', [style({transform: 'translateX(0px)'}),
         animate(100, keyframes([
          style({transform: 'translateX(0px)'}),
          style({transform: 'translateX(300px)'})
        ]))])
     ])
 ]
})
export class PrescribedTestComponent implements OnInit {
@Input() isManagerRole : boolean;
@Input() visitCompleted: boolean;

tests: any = [];
test =  [];
conceptTest = '23601d71-50e6-483f-968d-aeef3031346d';
encounterUuid: string;
patientId: string;
visitUuid: string;
errorText: string;

testForm = new FormGroup({
  test: new FormControl('', [Validators.required])
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private translationService: TranslationService,
              private route: ActivatedRoute,
              private snackbar: MatSnackBar,
              private sessionSvc:SessionService) { }


      search = (text$: Observable<string>) =>
      text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.test.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' } ).compare).slice(0, 10))
      )

  ngOnInit() {
    const testUuid = '98c5881f-b214-4597-83d4-509666e9a7c9';
    this.diagnosisService.concept(testUuid)
    .subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.test.push(this.translationService.getDropdownTranslation('tests', ans.display));
      });
    });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptTest)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.sessionSvc.provider(obs.creator.uuid).subscribe(user => {
            obs.creator.regNo = '(-)';
            const attributes = Array.isArray(user?.results?.[0]?.attributes) ? user?.results?.[0]?.attributes : [];
            const exist = attributes.find(atr => atr?.attributeType?.display === "registrationNumber");
            if (exist) {
              obs.creator.regNo = `(${exist?.value})`;
            }
            this.tests.push(this.diagnosisService.getData(obs));
          });
        }
      });
    });
  }

  submit() {
    const date = new Date();
    const form = this.testForm.value;
    const value = form.test;
    if (this.tests.filter(o => o.value.toLowerCase() == value.toLowerCase()).length > 0) {
      this.snackbar.open("Can't add, this entry already exists!", null, { duration: 4000 });
      return;
    }
    if (this.diagnosisService.isEncounterProvider()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptTest,
        person: this.patientId,
        obsDatetime: date,
        value: JSON.stringify(this.diagnosisService.getBody('tests', value)),
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(resp => {
        const user = getFromStorage("user");
        let obj = {
          uuid : resp.uuid,
          value: json.value,
          obsDatetime: resp.obsDatetime,
          creator: { uuid: user.uuid, person: user.person, regNo:`(${getFromStorage("registrationNumber")})` }
        }
        this.tests.push(this.diagnosisService.getData(obj));
      });
    }
  }

  delete(i) {

    if (this.diagnosisService.isEncounterProvider()) {
      const observation = this.tests[i];
      const uuid = observation.uuid;
      if (observation.comment) {
        console.log("Can't delete, already deleted")
      } else {
        // if (observation.creator.uuid == getFromStorage("user").uuid) {
        //   this.diagnosisService.deleteObs(uuid)
        //   .subscribe(() => {
        //     this.tests.splice(i, 1);
        //   });
        // } else {
          const provider = getFromStorage("provider");
          const registrationNumber = getFromStorage("registrationNumber");
          const deletedTimestamp = moment.utc().toISOString();
          const prevCreator = observation?.creator?.person?.display;
          this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}${registrationNumber?'|'+registrationNumber:'|NA'}|${prevCreator}` })
          .subscribe(() => {
            this.tests[i] = {...this.tests[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}${registrationNumber?'|'+registrationNumber:'|NA'}|${prevCreator}` };
          });
        // }
      }
    }

    // if (this.diagnosisService.isSameDoctor()) {
    //   const uuid = this.tests[i].uuid;
    //   this.diagnosisService.deleteObs(uuid)
    //   .subscribe(() => {
    //     this.tests.splice(i, 1);
    //   });
    // }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
   }
}

