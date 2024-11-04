import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LanguageModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';

export interface ILanguageFieldUpdate {
  fieldName: string;
  fieldValue: { [key: string]: string };
}

@Component({
  selector: 'app-language-fields-update',
  templateUrl: './language-fields-update.component.html',
  styleUrls: ['./language-fields-update.component.scss']
})
export class LanguageFieldUpdate implements OnInit {
  @Output() onSubmit = new EventEmitter();
  fieldName: string

  // Define an array of languages
  languages: LanguageModel[] = [{
    code: 'en', 
    name: 'English',
    is_default: false
  }];

  // Form group that will contain a form array for language fields
  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ILanguageFieldUpdate,
    private dialogRef: MatDialogRef<LanguageFieldUpdate>,
    private configService: ConfigService,
    private fb: FormBuilder
  ) {
    this.fieldName = this.data?.fieldName;
    this.form = this.fb.group({
      fields: this.fb.array([]) // FormArray for dynamic fields
    });
  }

  ngOnInit(): void {
    this.getAllLanguage();
  }


  /**
  * Get Language
  * @return {void}
  */
  getAllLanguage(): void {
    this.configService.getAppLanguages().subscribe(({ languages }: { languages: LanguageModel[] }): void => {
      this.languages = languages;

      // Defer form initialization to the next change detection cycle
      setTimeout(() => {
        this.initFields();
      }, 10);
    }, (error) => {

    });
  }

  // Initialize dynamic fields for each language
  initFields() {
    const controlArray = this.form.get('fields') as FormArray;
    const fieldValues = this.data?.fieldValue || {};
    this.languages.forEach((language: LanguageModel): void => {
      controlArray.push(this.fb.group({
        language: [language?.name], // language name (static)
        code: [language?.code],
        value: [fieldValues[language?.code] ?? ''] // input value
      }));
    });
  }

  // Getter for form array to be used in the template
  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  /**
  * Submit
  * @return {void}
  */
  handleSubmit(): void {
    const fieldValue = this.fields?.value?.reduce((acc: { [x: string]: any; }, { code, value }) => {
      acc[code] = value; // Assigning code as key and value as value
      return acc;
    }, {});
    this.onSubmit?.emit(fieldValue)
  }

  /**
  * handleCancel
  * @return {void}
  */
  handleCancel(): void {
    this.dialogRef.close();
  }

}
