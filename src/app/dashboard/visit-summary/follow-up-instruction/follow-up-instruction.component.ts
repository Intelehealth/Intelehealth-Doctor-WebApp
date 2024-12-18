import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EncounterModel, ObsApiResponseModel, ObsModel, VisitModel } from 'src/app/model/model';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { conceptIds } from 'src/config/constant';

@Component({
  selector: 'app-follow-up-instruction',
  templateUrl: './follow-up-instruction.component.html',
  styleUrls: ['./follow-up-instruction.component.scss']
})
export class FollowUpInstructionComponent {
  followUpInstructions: ObsModel[] = [];
  @Input() isVisitNoteProvider = false;
  @Input() visitEnded: EncounterModel | string;
  @Input() set visit(_visit: VisitModel) {
    this._visit = _visit;
    if (this._visit)
      this.checkIfFollowUpInstructionsPresent();
  }
  @Input() visitNotePresent: EncounterModel;
  @Input() title: string = 'notes';
  @Input() isMCCUser: boolean = false;
 
  _visit: VisitModel;
  addInstructionForm: FormGroup = new FormGroup({
    instructions: new FormControl(null, [Validators.required])
  });
  addMoreInstruction = false;
  conceptId = conceptIds.conceptFollowUpInstruction;

  constructor(
    private diagnosisSvc: DiagnosisService,
    private encounterSvc: EncounterService,
    private translateSvc: TranslateService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void { }

  /**
   * Get followUpInstructions for the visit
   * @returns {void}
   */
  checkIfFollowUpInstructionsPresent(): void {
    this.followUpInstructions = [];
    this.diagnosisSvc.getObs(this._visit.patient.uuid, this.conceptId).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this._visit.uuid) {
          this.followUpInstructions.push(obs);
        }
      });
    });
  }


  /**
  * Save addInstruction
  * @returns {void}
  */
  addInstructions(): void {
      if(this.addInstructionForm.invalid) {
      this.toastr.warning(this.translateSvc.instant('Please enter instructions to add'), this.translateSvc.instant('Invalid Instructions'));
      return;
    }
    if (this.followUpInstructions.find((o: ObsModel) => o.value === this.addInstructionForm.value.instructions)) {
      this.toastr.warning(this.translateSvc.instant('Instructions already added, please add another Instructions.'), this.translateSvc.instant('Already Added'));
      return;
    }
    this.encounterSvc.postObs({
      concept: this.conceptId,
      person: this._visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addInstructionForm.value.instructions,
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: ObsModel) => {
      this.followUpInstructions.push({ uuid: res.uuid, value: this.addInstructionForm.value.instructions });
      this.addInstructionForm.reset();
    });
  }

  /**
  * Delete Instructions for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Note obs uuid
  * @returns {void}
  */
  deleteInstructions(index: number, uuid: string): void {
    this.diagnosisSvc.deleteObs(uuid).subscribe(() => {
      this.followUpInstructions.splice(index, 1);
    });
  }

  /**
   * Toggle follow Up Instructions add form, show/hide add more notes button
   * @returns {void}
   */
  toggleInstructions(): void {
    this.addMoreInstruction = !this.addMoreInstruction;
    this.addInstructionForm.reset();
  }
}
