import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { AddLicenseKeyComponent } from 'src/app/modal-components/add-license-key/add-license-key.component';
import { AppointmentDetailMonthComponent } from 'src/app/modal-components/appointment-detail-month/appointment-detail-month.component';
import { AppointmentDetailComponent } from 'src/app/modal-components/appointment-detail/appointment-detail.component';
import { CancelAppointmentConfirmComponent } from 'src/app/modal-components/cancel-appointment-confirm/cancel-appointment-confirm.component';
import { ChatBoxComponent } from 'src/app/modal-components/chat-box/chat-box.component';
import { ConfirmDayOffComponent } from 'src/app/modal-components/confirm-day-off/confirm-day-off.component';
import { ConfirmDialogComponent } from 'src/app/modal-components/confirm-dialog/confirm-dialog.component';
import { ConfirmHoursOffComponent } from 'src/app/modal-components/confirm-hours-off/confirm-hours-off.component';
import { ConfirmOpenmrsIdComponent } from 'src/app/modal-components/confirm-openmrs-id/confirm-openmrs-id.component';
import { DiagnosisDetailComponent } from 'src/app/modal-components/diagnosis-detail/diagnosis-detail.component';
import { HelpMenuComponent } from 'src/app/modal-components/help-menu/help-menu.component';
import { ImagesPreviewComponent } from 'src/app/modal-components/images-preview/images-preview.component';
import { NoInternetComponent } from 'src/app/modal-components/no-internet/no-internet.component';
import { PasswordResetSuccessComponent } from 'src/app/modal-components/password-reset-success/password-reset-success.component';
import { RescheduleAppointmentConfirmComponent } from 'src/app/modal-components/reschedule-appointment-confirm/reschedule-appointment-confirm.component';
import { RescheduleAppointmentComponent } from 'src/app/modal-components/reschedule-appointment/reschedule-appointment.component';
import { SearchedPatientsComponent } from 'src/app/modal-components/searched-patients/searched-patients.component';
import { SelectLanguageComponent } from 'src/app/modal-components/select-language/select-language.component';
import { SharePrescriptionErrorComponent } from 'src/app/modal-components/share-prescription-error/share-prescription-error.component';
import { SharePrescriptionSuccessComponent } from 'src/app/modal-components/share-prescription-success/share-prescription-success.component';
import { SharePrescriptionComponent } from 'src/app/modal-components/share-prescription/share-prescription.component';
import { UpdateChatgptModelComponent } from 'src/app/modal-components/update-chatgpt-model/update-chatgpt-model.component';
import { UploadMindmapJsonComponent } from 'src/app/modal-components/upload-mindmap-json/upload-mindmap-json.component';
import { VideoCallComponent } from 'src/app/modal-components/video-call/video-call.component';
import { ViewVisitPrescriptionComponent } from 'src/app/modal-components/view-visit-prescription/view-visit-prescription.component';
import { ViewVisitSummaryComponent } from 'src/app/modal-components/view-visit-summary/view-visit-summary.component';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  openConfirmationDialog(data: { confirmationMsg: string, cancelBtnText: string, confirmBtnText: string }): MatDialogRef<ConfirmDialogComponent> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { panelClass: 'modal-md', data } );
    return dialogRef;
  }

  openHelpMenuModal(): MatDialogRef<HelpMenuComponent> {
    const dialogRef = this.dialog.open(HelpMenuComponent, { panelClass: "chatbot-container", backdropClass: "chatbot-backdrop", width: "100%", maxHeight: "500px", maxWidth: "300px", position: { bottom: "20px", right: "20px" }, hasBackdrop: false } );
    return dialogRef;
  }

  openAddLicenseKeyModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AddLicenseKeyComponent, { panelClass: 'modal-md', data });
    return dialogRef.afterClosed();
  }

  openUploadMindmapModal(): Observable<any> {
    const dialogRef = this.dialog.open(UploadMindmapJsonComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openNoInternetConnectionModal(): Observable<any> {
    const dialogRef = this.dialog.open(NoInternetComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openPasswordResetSuccessModal(): Observable<any> {
    const dialogRef = this.dialog.open(PasswordResetSuccessComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openSelectLanguageModal(): Observable<any> {
    const dialogRef = this.dialog.open(SelectLanguageComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openSharePrescriptionConfirmModal(): Observable<any> {
    const dialogRef = this.dialog.open(SharePrescriptionComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openSharePrescriptionSuccessModal(): Observable<any> {
    const dialogRef = this.dialog.open(SharePrescriptionSuccessComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openSharePrescriptionErrorModal(data: { msg:string, confirmBtnText: string }): Observable<any> {
    const dialogRef = this.dialog.open(SharePrescriptionErrorComponent, { panelClass: 'modal-md', data });
    return dialogRef.afterClosed();
  }

  openVisitSummaryModal(data: { uuid:string }): Observable<any> {
    const dialogRef = this.dialog.open(ViewVisitSummaryComponent, { panelClass: 'modal-lg', data,  });
    return dialogRef.afterClosed();
  }

  openVisitPrescriptionModal(data: { uuid:string }): Observable<any> {
    const dialogRef = this.dialog.open(ViewVisitPrescriptionComponent, { panelClass: 'modal-lg', data });
    return dialogRef.afterClosed();
  }

  openChatBoxModal(data: any): MatDialogRef<ChatBoxComponent> {
    const dialogRef = this.dialog.open(ChatBoxComponent, { data, panelClass: "chatbot-container", backdropClass: "chatbot-backdrop", width: "100%", maxHeight: "500px", maxWidth: "300px", position: { bottom: "80px", right: "20px" }, hasBackdrop: false } );
    return dialogRef;
  }

  openVideoCallModal(data: any): MatDialogRef<VideoCallComponent> {
    const dialogRef = this.dialog.open(VideoCallComponent, { panelClass: "vc-modal-lg", data, hasBackdrop: true, disableClose: true });
    return dialogRef;
  }

  openSearchedPatientModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(SearchedPatientsComponent, { panelClass: "modal-lg", data } );
    return dialogRef.afterClosed();
  }

  openAppointmentDetailDayViewModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AppointmentDetailComponent, { panelClass: "modal-md", data } );
    return dialogRef.afterClosed();
  }

  openAppointmentDetailMonthViewModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AppointmentDetailMonthComponent, { panelClass: ["modal-md","dayView-con"], data } );
    return dialogRef.afterClosed();
  }

  openConfirmCancelAppointmentModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(CancelAppointmentConfirmComponent, { panelClass: "modal-md", data } );
    return dialogRef.afterClosed();
  }

  openRescheduleAppointmentModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(RescheduleAppointmentComponent, { panelClass: "modal-md", data } );
    return dialogRef.afterClosed();
  }

  openRescheduleAppointmentConfirmModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(RescheduleAppointmentConfirmComponent, { panelClass: "modal-md", data } );
    return dialogRef.afterClosed();
  }

  openImagesPreviewModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ImagesPreviewComponent, { panelClass: ["modal-lg", "transparent"], data } );
    return dialogRef.afterClosed();
  }

  openConfirmDayOffModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmDayOffComponent, { panelClass: "modal-md", data } );
    return dialogRef.afterClosed();
  }

  openConfirmHoursOffModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmHoursOffComponent, { panelClass: "modal-md", data } );
    return dialogRef.afterClosed();
  }

  openConfirmOpenMrsIdModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmOpenmrsIdComponent, { panelClass: "modal-md", data, disableClose: true } );
    return dialogRef.afterClosed();
  }

  openUpateChatGptModelModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(UpdateChatgptModelComponent, { panelClass: "modal-md", data, disableClose: true } );
    return dialogRef.afterClosed();
  }

  openDiagnosisDetailModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(DiagnosisDetailComponent, { panelClass: "modal-md", data, disableClose: true } );
    return dialogRef.afterClosed();
  }
}
