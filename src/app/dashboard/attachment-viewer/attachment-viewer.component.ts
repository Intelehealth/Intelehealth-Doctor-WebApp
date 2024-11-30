import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-attachment-viewer',
  templateUrl: './attachment-viewer.component.html',
  styleUrls: ['./attachment-viewer.component.scss']
})
export class AttachmentViewerComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

}
