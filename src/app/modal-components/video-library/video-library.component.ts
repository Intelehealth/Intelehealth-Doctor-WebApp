import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MindmapService } from 'src/app/services/mindmap.service';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.scss']
})
export class VideoLibraryComponent implements OnInit {

  categoryForm: FormGroup;
  videoForm: FormGroup;
  moveVideoForm : FormGroup;
  submitted: boolean = false;
  isPreviewVideo: any = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<VideoLibraryComponent>,
    private translateService: TranslateService,
    private sanitizer: DomSanitizer) {
    this.categoryForm = new FormGroup({
      title: new FormControl('', [Validators.required,Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%]*$/)],),
    });
    this.videoForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%]*$/)]),
      videoId : new FormControl('', [Validators.required])
    });
    this.moveVideoForm = new FormGroup({
      selectedCategory: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.categoryForm.patchValue({
      title: this.data?.name,
    });
    this.videoForm.patchValue({
      title: this.data?.title,
      videoId : this.data?.videoId
    });
  }

  get f() { return this.categoryForm.controls; }

  get f1() { return this.videoForm.controls; }

  get f2() { return this.moveVideoForm.controls; }

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


  previewVideo() {
    this.data.videoId = this.videoForm.value.videoId;
    this.data.videoURL = this.getSafeUrl(this.videoForm.value.videoId);
    this.isPreviewVideo = false;
    setTimeout(() => {
      this.isPreviewVideo = true;
    }, 500);
  }

  getSafeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  saveVideo() {
    this.submitted = true;
    if (this.videoForm.invalid) {
      return;
    }
    this.dialogRef.close(this.videoForm.value);
  }

  moveVideo() {
    this.submitted = true;
    if (this.moveVideoForm.invalid) {
      return;
    }
    this.dialogRef.close(this.moveVideoForm.value);
  }
}
