import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { DiagnosisService } from "../services/diagnosis.service";
import { EncounterService } from "../services/encounter.service";
import { getEncounterUUID } from "../utils/utility-functions";
import { conceptIds } from 'src/config/constant';

@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"],
})
export class TestComponent implements OnInit {
  @Input() iconImg = "assets/svgs/test.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

  showAddMore = false;
  isCollapsed = false;
  test = [];
  patientId: string;
  visitUuid: string;
  testData = [];
  newTest:string;

  constructor(private encounterService: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.test.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  ngOnInit(): void {
    const testUuid = '98c5881f-b214-4597-83d4-509666e9a7c9';
    this.diagnosisService.concept(testUuid)
      .subscribe(res => {
        const result = res.answers;
        result.forEach(ans => {
          this.test.push(ans.display);
        });
      });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, conceptIds.conceptTest)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid || this.readOnly === true) {
            this.testData.push(obs);
          }
        });
      });
  }

  submit() {
    const date = new Date();
    if (this.diagnosisService.isSameDoctor() && this.newTest?.trim()) {
      let encounterUuid = getEncounterUUID();
      const json = {
        concept: conceptIds.conceptTest,
        person: this.patientId,
        obsDatetime: date,
        value: this.newTest,
        encounter: encounterUuid
      };
      this.encounterService.postObs(json)
      .subscribe(resp => {
        this.testData.push({uuid: resp.uuid, value: this.newTest});
        this.newTest = '';
      });
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.testData[i].uuid;
      this.diagnosisService.deleteObs(uuid)
      .subscribe(() => {
        this.testData.splice(i, 1);
      });
    }
  }
}
