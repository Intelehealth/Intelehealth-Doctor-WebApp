import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute } from "@angular/router";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { Observable } from "rxjs";
import { DiagnosisService } from "../../../services/diagnosis.service";
// import { FormGroup, FormControl, Validators } from "@angular/forms";
import {
  transition,
  trigger,
  style,
  animate,
  keyframes,
} from "@angular/animations";
import medicines from "./medicines";
declare var getEncounterUUID: any;

@Component({
  selector: "app-prescribed-medication",
  templateUrl: "./prescribed-medication.component.html",
  styleUrls: ["./prescribed-medication.component.css"],
  animations: [
    trigger("moveInLeft", [
      transition("void=> *", [
        style({ transform: "translateX(300px)" }),
        animate(
          200,
          keyframes([
            style({ transform: "translateX(300px)" }),
            style({ transform: "translateX(0)" }),
          ])
        ),
      ]),
      transition("*=>void", [
        style({ transform: "translateX(0px)" }),
        animate(
          100,
          keyframes([
            style({ transform: "translateX(0px)" }),
            style({ transform: "translateX(300px)" }),
          ])
        ),
      ]),
    ]),
  ],
})
export class PrescribedMedicationComponent implements OnInit {
  @Output() isDataPresent = new EventEmitter<boolean>();
  meds: any = [];
  patientId: string;
  visitUuid: string;
  // add = false;
  // encounterUuid: string;
  conceptPrescription = [];
  // conceptDose = [];
  // conceptfrequency = [];
  // conceptAdministration = [];
  // conceptDurationUnit = [];
  earlyMorning = [
    {
      value: '',
      unit: '',
      qty: ''
    }
  ]

  breakfast = [
    {
      value: '',
      unit: '',
      qty: ''
    }
  ]

  midMorning = [
    {
      value: '',
      unit: '',
      qty: ''
    }
  ]

  lunch = [
    {
      value: '',
      unit: '',
      qty: ''
    }
  ]

  eveningSnack = [
    {
      value: '',
      unit: '',
      qty: ''
    }
  ]

  dinner = [
    {
      value: '',
      unit: '',
      qty: ''
    }
  ]

  bedTime = [
    {
      value: '',
      unit: '',
      qty: ''
    }
  ]

  conceptMed = "c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca";

  // medForm = new FormGroup({
  //   med: new FormControl("", [Validators.required]),
  //   dose: new FormControl("", Validators.min(0)),
  //   unit: new FormControl("", [Validators.required]),
  //   amount: new FormControl("", Validators.min(1)),
  //   unitType: new FormControl("", [Validators.required]),
  //   frequency: new FormControl("", [Validators.required]),
  //   route: new FormControl(""),
  //   reason: new FormControl(""),
  //   duration: new FormControl("", Validators.min(1)),
  //   durationUnit: new FormControl("", [Validators.required]),
  //   additional: new FormControl(""),
  // });

  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) { }

  searchEarlyMorning = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.earlyMorning
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchBreakfast = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.breakfast
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchMidMorning = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.midMorning
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchLunch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.lunch
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchEveningSnack = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.eveningSnack
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchDinner = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.dinner
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchBedTime = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.bedTime
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );


  // searchFrequency = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map((term) =>
  //       term.length < 1
  //         ? []
  //         : this.conceptfrequency
  //           .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //           .slice(0, 10)
  //     )
  //   );

  // searchAdministration = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map((term) =>
  //       term.length < 1
  //         ? []
  //         : this.conceptAdministration
  //           .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //           .slice(0, 10)
  //     )
  //   );

  // searchDose = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map((term) =>
  //       term.length < 1
  //         ? []
  //         : this.conceptDose
  //           .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //           .slice(0, 10)
  //     )
  //   );

  // durationUnit = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map((term) =>
  //       term.length < 1
  //         ? []
  //         : this.conceptDurationUnit
  //           .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //           .slice(0, 10)
  //     )
  //   );

  ngOnInit() {
    // this.init();
    this.conceptPrescription = this.conceptPrescription.concat(medicines);
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.diagnosisService
      .getObs(this.patientId, this.conceptMed)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.meds.push(obs);
          }
        });
        this.setToHindi();
      });
  }

  // init(){
  //   const prescriptionUuid = "c25ea0e9-6522-417f-97ec-6e4b7a615254";
  //   this.conceptPrescription = this.conceptPrescription.concat(medicines);
  //   const doseUnit = "162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  //   this.diagnosisService.concept(doseUnit).subscribe((res) => {
  //     const result = res.setMembers;
  //     result.forEach((ans) => {
  //       this.conceptDose.push(ans.display);
  //     });
  //   });
  //   const frequency = "9847b24f-8434-4ade-8978-157184c435d2";
  //   this.diagnosisService.concept(frequency).subscribe((res) => {
  //     const result = res.setMembers;
  //     result.forEach((ans) => {
  //       this.conceptfrequency.push(ans.display);
  //     });
  //   });
  //   const RouteOfAdministration = "162394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  //   this.diagnosisService.concept(RouteOfAdministration).subscribe((res) => {
  //     const result = res.setMembers;
  //     result.forEach((ans) => {
  //       this.conceptAdministration.push(ans.display);
  //     });
  //   });
  //   const conceptDurationUnit = "1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  //   this.diagnosisService.concept(conceptDurationUnit).subscribe((res) => {
  //     const result = res.setMembers;
  //     result.forEach((ans) => {
  //       this.conceptDurationUnit.push(ans.display);
  //     });
  //   });
  // }

  // onSubmit() {
  //   const date = new Date();
  //   const value = this.prescription;
  //   // tslint:disable-next-line:max-line-length
  //   var insertValue = `${value.med}: ${value.dose} ${value.unit}, ${value.amount} ${value.unitType} ${value.frequency}`;
  //   if (value.route) {
  //     insertValue = `${insertValue} (${value.route})`;
  //   }
  //   if (value.reason) {
  //     insertValue = `${insertValue} ${value.reason}`;
  //   }
  //   insertValue = `${insertValue} for ${value.duration} ${value.durationUnit}`;
  //   if (value.additional) {
  //     insertValue = `${insertValue} ${value.additional}`;
  //   } else {
  //     insertValue = `${insertValue}`;
  //   }
  //   if (this.diagnosisService.isSameDoctor()) {
  //     this.encounterUuid = getEncounterUUID();
  //     const json = {
  //       concept: this.conceptMed,
  //       person: this.patientId,
  //       obsDatetime: date,
  //       value: insertValue,
  //       encounter: this.encounterUuid,
  //     };
  //     this.service.postObs(json).subscribe((response) => {
  //       this.isDataPresent.emit(true);
  //       this.meds.push({ uuid: response.uuid, value: insertValue });
  //       this.add = false;
  //     });
  //   }
  // }

  get isInvalid() {
    return !(this.earlyMorning || this.breakfast || this.midMorning || this.lunch || this.eveningSnack || this.dinner || this.bedTime);
  }

  submit() {
    if (this.diagnosisService.isSameDoctor()) {

      const prescTypes = [
        { label: 'Early Morning', key: 'earlyMorning' },
        { label: 'Breakfast', key: 'breakfast' },
        { label: 'Mid Morning', key: 'midMorning' },
        { label: 'Lunch', key: 'lunch' },
        { label: 'Evening Snack', key: 'eveningSnack' },
        { label: 'Dinner', key: 'dinner' },
        { label: 'Bed Time', key: 'bedTime' }
      ]
      let value = {
        en: {},
        hi: {}
      };
      prescTypes.forEach((type) => {
        if (Array.isArray(this[type.key])) {
          this[type.key].filter(opt => opt.value).forEach(opt => {
            if (!value.en[type.label]) value.en[type.label] = [];
            if (!value.hi[type.label]) value.hi[type.label] = [];

            let [enVal, hiVal] = opt.value.split(',');

            if (!enVal) enVal = ''
            if (!hiVal) hiVal = ''

            enVal = enVal.trim();
            hiVal = hiVal.trim();

            value.en[type.label].push({ value: enVal, unit: opt.unit, qty: opt.qty });
            value.hi[type.label].push({ value: hiVal, unit: opt.unit, qty: opt.qty });
          });
        }
      });
      const json = {
        concept: this.conceptMed,
        person: this.patientId,
        obsDatetime: new Date(),
        value,
        encounter: getEncounterUUID(),
      };
      this.service.postObs(json).subscribe((response) => {
        this.isDataPresent.emit(true);
        this.meds.push({ uuid: response.uuid, value });
        this.setToHindi();
        this.clearFields();
      });
    }
  }

  setToHindi() {
    this.meds.forEach((med, idx) => {
      for (const key in medicines) {
        if (Object.prototype.hasOwnProperty.call(medicines, key) && key != 'earlyMorning') {
          const optionsArr = medicines[key];
          optionsArr.forEach(opt => {
            const [eng] = opt.split(',')
            this.meds[idx].value = med.value.replaceAll(eng.trim(), opt);
          });
        }
      }
    });
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.meds[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.meds.splice(i, 1);
        if (this.meds.length === 0) {
          this.isDataPresent.emit(false);
        }
      });
    }
  }

  add(optArr) {
    optArr.unshift({
      value: '',
      qty: '',
      unit: ''
    })
  }

  clearFields() {
    this.earlyMorning = [{ value: '', qty: '', unit: '' }];
    this.breakfast = [{ value: '', qty: '', unit: '' }];
    this.midMorning = [{ value: '', qty: '', unit: '' }];
    this.lunch = [{ value: '', qty: '', unit: '' }];
    this.eveningSnack = [{ value: '', qty: '', unit: '' }];
    this.dinner = [{ value: '', qty: '', unit: '' }];
    this.bedTime = [{ value: '', qty: '', unit: '' }];
  }
}
