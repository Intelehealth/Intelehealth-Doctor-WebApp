import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EncounterModel, ObsApiResponseModel, ObsModel, VisitModel } from 'src/app/model/model';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { conceptIds } from 'src/config/constant';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
  notes: ObsModel[] = [];
  @Input() isVisitNoteProvider = false;
  @Input() visitEnded: EncounterModel | string;
  @Input() set visit(_visit: VisitModel) {
    this._visit = _visit;
    if (this._visit)
      this.checkIfNotePresent();
  }
  @Input() visitNotePresent: EncounterModel;
  @Input() title: string = 'notes';
  @Input() isMCCUser: boolean = false;
 
  _visit: VisitModel;
  addNoteForm: FormGroup = new FormGroup({
    note: new FormControl(null, [Validators.required])
  });
  addMoreNote = false;

  constructor(
    private diagnosisSvc: DiagnosisService,
    private encounterSvc: EncounterService,
    private translateSvc: TranslateService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void { }

  /**
   * Get notes for the visit
   * @returns {void}
   */
  checkIfNotePresent(): void {
    this.notes = [];
    this.diagnosisSvc.getObs(this._visit.patient.uuid, this.conceptId).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this._visit.uuid) {
          this.notes.push(obs);
        }
      });
    });
  }

  get conceptId(): string {
    switch (this.title) {
      case 'Family History Notes':
        return conceptIds.conceptFamilyHistoryNotes;

      case 'Past Medical History Notes':
        return conceptIds.conceptPastMedicalHistoryNotes;

      default:
        return conceptIds.conceptNote
    }
  }


    /**
    * Save note
    * @returns {void}
    */
    addNote(): void {
      if(this.addNoteForm.invalid) {
      this.toastr.warning(this.translateSvc.instant('Please enter note text to add'), this.translateSvc.instant('Invalid note'));
      return;
    }
    if (this.notes.find((o: ObsModel) => o.value === this.addNoteForm.value.note)) {
      this.toastr.warning(this.translateSvc.instant('Note already added, please add another note.'), this.translateSvc.instant('Already Added'));
      return;
    }
    this.encounterSvc.postObs({
      concept: this.conceptId,
      person: this._visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addNoteForm.value.note,
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: ObsModel) => {
      this.notes.push({ uuid: res.uuid, value: this.addNoteForm.value.note });
      this.addNoteForm.reset();
    });
  }

  /**
  * Delete note for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Note obs uuid
  * @returns {void}
  */
  deleteNote(index: number, uuid: string): void {
    this.diagnosisSvc.deleteObs(uuid).subscribe(() => {
      this.notes.splice(index, 1);
    });
  }

  /**
   * Toggle notes add form, show/hide add more notes button
   * @returns {void}
   */
  toggleNote(): void {
    this.addMoreNote = !this.addMoreNote;
    this.addNoteForm.reset();
  }
  
}
