import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MindmapService } from 'src/app/services/mindmap.service';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.scss']
})
export class VideoLibraryComponent implements OnInit {

  categoryForm: FormGroup;
  submitted: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<VideoLibraryComponent>,
    private mindmapService: MindmapService,
    private translateService: TranslateService) {
    this.categoryForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.categoryForm.patchValue({
      title: this.data?.name,
    });
  }

  get f() { return this.categoryForm.controls; }

  /**
  * Close modal
  * @return {void}
  */
  close() {
    this.dialogRef.close(false);
  }

  /**
  * Add new license key
  * @return {void}
  */
  saveCategory() {
    this.submitted = true;
    if (this.categoryForm.invalid) {
      return;
    }
    this.dialogRef.close(this.categoryForm.value);
  }
}
