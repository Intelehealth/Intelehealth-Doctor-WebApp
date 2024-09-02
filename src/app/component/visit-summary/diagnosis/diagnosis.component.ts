import { Component, Input, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
declare var getEncounterUUID: any;

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css'],
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
export class DiagnosisComponent implements OnInit {
@Input() isManagerRole : boolean;
diagnosis: any = [];
diagnosisList = [];
conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
patientId: string;
visitUuid: string;
encounterUuid: string;
isDisabled = false;
showOthers = false;

diagnosisForm = new FormGroup({
  text: new FormControl('', [Validators.required]),
  type: new FormControl('', [Validators.required]),
  confirm: new FormControl('', [Validators.required]),
  comments: new FormControl(''),
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptDiagnosis)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.diagnosis.push(obs);
        }
      });
    });
  }

  search(event) {
    this.resetIfInvalid();
    this.diagnosisService.getDiagnosisList(event.target.value)
    .subscribe(response => {
      this.diagnosisList = response;
    });
  }

  selected($event){
    this.showOthers = $event.option.value === 'Others';
    if(this.showOthers){
      this.ctrl.comments.setValidators([Validators.required, Validators.minLength(3)]);
      this.isDisabled = true;
    } else {
      this.ctrl.comments.clearValidators();
      this.ctrl.comments.setValue('');
      this.isDisabled = false;
    }
    this.ctrl.comments.updateValueAndValidity();
  }

  get ctrl(){
    return this.diagnosisForm.controls;
  }

  get val() {
    return this.diagnosisForm.value;
  }

  commentChange(event) {
    this.isDisabled = this.val.comments.length < 3;
  }

  resetIfInvalid() {
    this.isDisabled = true;
  }

  onSubmit() {
    const date = new Date();
    const value = this.diagnosisForm.value;
    if (this.diagnosisService.isSameDoctor()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptDiagnosis,
        person: this.patientId,
        obsDatetime: date,
        value: `${this.showOthers ? this.val.comments : value.text}:${value.type} & ${value.confirm}`,
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(resp => {
        this.diagnosisList = [];
        this.diagnosis.push({uuid: resp.uuid, value: json.value});
        this.showOthers = false;
      });
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.diagnosis[i].uuid;
      this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        this.diagnosis.splice(i, 1);
      });
    }
  }
}
