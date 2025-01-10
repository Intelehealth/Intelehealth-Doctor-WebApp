import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MomentModule } from 'ngx-moment';
import { MatListModule } from '@angular/material/list';
import { RescheduleAppointmentComponent } from './reschedule-appointment/reschedule-appointment.component';
import { RescheduleAppointmentConfirmComponent } from './reschedule-appointment-confirm/reschedule-appointment-confirm.component';
import { CancelAppointmentConfirmComponent } from './cancel-appointment-confirm/cancel-appointment-confirm.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgSelectModule } from '@ng-select/ng-select';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
    declarations: [
        RescheduleAppointmentComponent,
        RescheduleAppointmentConfirmComponent,
        CancelAppointmentConfirmComponent,
    ],
    imports: [
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        NgxDropzoneModule,
        MomentModule,
        MatListModule,
        MatDatepickerModule,
        PdfViewerModule,
        NgSelectModule,
        SignaturePadModule,
        ImageCropperModule,
        MatProgressBarModule,
        MatTabsModule,
        MatTableModule,
        TranslateModule
    ],
    // schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class ModalComponentsModule { }
