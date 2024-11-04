import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { tr } from 'date-fns/locale';
import { Observable } from 'rxjs/internal/Observable';
import { AddLicenseKeyComponent } from 'src/app/modal-components/add-license-key/add-license-key.component';
import { AddTicketComponent } from 'src/app/modal-components/add-ticket/add-ticket.component';
import { AppointmentDetailMonthComponent } from 'src/app/modal-components/appointment-detail-month/appointment-detail-month.component';
import { AppointmentDetailComponent } from 'src/app/modal-components/appointment-detail/appointment-detail.component';
import { CancelAppointmentConfirmComponent } from 'src/app/modal-components/cancel-appointment-confirm/cancel-appointment-confirm.component';
import { ChatBoxComponent } from 'src/app/modal-components/chat-box/chat-box.component';
import { ConfirmDayOffComponent } from 'src/app/modal-components/confirm-day-off/confirm-day-off.component';
import { ConfirmDialogComponent } from 'src/app/modal-components/confirm-dialog/confirm-dialog.component';
import { ConfirmHoursOffComponent } from 'src/app/modal-components/confirm-hours-off/confirm-hours-off.component';
import { ConfirmOpenmrsIdComponent } from 'src/app/modal-components/confirm-openmrs-id/confirm-openmrs-id.component';
import { FileDownloadComponent } from 'src/app/modal-components/file-download/file-download.component';
import { HelpMenuComponent } from 'src/app/modal-components/help-menu/help-menu.component';
import { ImageCropComponent } from 'src/app/modal-components/image-crop/image-crop.component';
import { ImagesPreviewComponent } from 'src/app/modal-components/images-preview/images-preview.component';
import { ILanguageFieldUpdate, LanguageFieldUpdate } from 'src/app/modal-components/language-fields-update/language-fields-update.component';
import { NoInternetComponent } from 'src/app/modal-components/no-internet/no-internet.component';
import { PasswordResetSuccessComponent } from 'src/app/modal-components/password-reset-success/password-reset-success.component';
import { PasswordResetComponent } from 'src/app/modal-components/password-reset/password-reset.component';
import { RaiseTicketComponent } from 'src/app/modal-components/raise-ticket/raise-ticket.component';
import { ReportErrorComponent } from 'src/app/modal-components/report-error/report-error.component';
import { ReportGeneratorComponent } from 'src/app/modal-components/report-generator/report-generator.component';
import { ReportSuccessComponent } from 'src/app/modal-components/report-success/report-success.component';
import { RescheduleAppointmentConfirmComponent } from 'src/app/modal-components/reschedule-appointment-confirm/reschedule-appointment-confirm.component';
import { RescheduleAppointmentComponent } from 'src/app/modal-components/reschedule-appointment/reschedule-appointment.component';
import { SearchedPatientsComponent } from 'src/app/modal-components/searched-patients/searched-patients.component';
import { SelectLanguageComponent } from 'src/app/modal-components/select-language/select-language.component';
import { SharePrescriptionErrorComponent } from 'src/app/modal-components/share-prescription-error/share-prescription-error.component';
import { SharePrescriptionSuccessComponent } from 'src/app/modal-components/share-prescription-success/share-prescription-success.component';
import { SharePrescriptionComponent } from 'src/app/modal-components/share-prescription/share-prescription.component';
import { SubSectionsComponent } from 'src/app/modal-components/sub-sections/sub-sections.component';
import { UploadMindmapJsonComponent } from 'src/app/modal-components/upload-mindmap-json/upload-mindmap-json.component';
import { VcallOverlayComponent } from 'src/app/modal-components/vcall-overlay/vcall-overlay.component';
import { VideoCallComponent } from 'src/app/modal-components/video-call/video-call.component';
import { ViewVisitPrescriptionComponent } from 'src/app/modal-components/view-visit-prescription/view-visit-prescription.component';
import { ViewVisitSummaryComponent } from 'src/app/modal-components/view-visit-summary/view-visit-summary.component';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  /**
  * Open Confirmation dialog modal
  * @param {{ confirmationMsg: string, cancelBtnText: string, confirmBtnText: string }} data - Dialog data
  * @return {MatDialogRef<ConfirmDialogComponent>} - Dialog reference
  */
  openConfirmationDialog(data: { confirmationMsg: string, cancelBtnText: string, confirmBtnText: string }): MatDialogRef<ConfirmDialogComponent> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { panelClass: 'modal-md', data, hasBackdrop: true, disableClose: true });
    return dialogRef;
  }

  /**
  * Open help chat modal
  * @return {MatDialogRef<HelpMenuComponent>} - Dialog reference
  */
  openHelpMenuModal(): MatDialogRef<HelpMenuComponent> {
    const dialogRef = this.dialog.open(HelpMenuComponent, { panelClass: "chatbot-container", backdropClass: "chatbot-backdrop", width: "100%", maxHeight: "500px", maxWidth: "300px", position: { bottom: "20px", right: "20px" }, hasBackdrop: false });
    return dialogRef;
  }

  /**
  * Open add license modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openAddLicenseKeyModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AddLicenseKeyComponent, { panelClass: 'modal-md', data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open upload mindmap modal
  * @return {Observable<any>} - Dialog result
  */
  openUploadMindmapModal(): Observable<any> {
    const dialogRef = this.dialog.open(UploadMindmapJsonComponent, { panelClass: 'modal-md', hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open no ineternat connection modal
  * @return {Observable<any>} - Dialog result
  */
  openNoInternetConnectionModal(): Observable<any> {
    const dialogRef = this.dialog.open(NoInternetComponent, { panelClass: 'modal-md', hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open password reset success modal
  * @return {Observable<any>} - Dialog result
  */
  openPasswordResetSuccessModal(): Observable<any> {
    const dialogRef = this.dialog.open(PasswordResetSuccessComponent, { panelClass: 'modal-md', hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open select language modal
  * @return {Observable<any>} - Dialog result
  */
  openSelectLanguageModal(): Observable<any> {
    const dialogRef = this.dialog.open(SelectLanguageComponent, { panelClass: 'modal-md', hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open share prescription confirmation modal
  * @return {Observable<any>} - Dialog result
  */
  openSharePrescriptionConfirmModal(): Observable<any> {
    const dialogRef = this.dialog.open(SharePrescriptionComponent, { panelClass: 'modal-md', hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open prescription share success modal
  * @return {Observable<any>} - Dialog result
  */
  openSharePrescriptionSuccessModal(): Observable<any> {
    const dialogRef = this.dialog.open(SharePrescriptionSuccessComponent, { panelClass: 'modal-md', hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open share prescription error modal
  * @param {{ msg: string, confirmBtnText: string }} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openSharePrescriptionErrorModal(data: { msg: string, confirmBtnText: string }): Observable<any> {
    const dialogRef = this.dialog.open(SharePrescriptionErrorComponent, { panelClass: 'modal-md', data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open view visit summary modal
  * @param {{ uuid: string }} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openVisitSummaryModal(data: { uuid: string }): Observable<any> {
    const dialogRef = this.dialog.open(ViewVisitSummaryComponent, { panelClass: 'modal-lg', data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open view visit prescription modal
  * @param {{ uuid: string }} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openVisitPrescriptionModal(data: { uuid: string }): Observable<any> {
    const dialogRef = this.dialog.open(ViewVisitPrescriptionComponent, { panelClass: 'modal-lg', data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open chat box modal
  * @param {any} data - Dialog data
  * @return {MatDialogRef<ChatBoxComponent>} - Dialog reference
  */
  openChatBoxModal(data: any): MatDialogRef<ChatBoxComponent> {
    const dialogRef = this.dialog.open(ChatBoxComponent, { data, panelClass: ["chatbot-container","chatbot-container-mobile"], backdropClass: "chatbot-backdrop", width: "100%", hasBackdrop: true, disableClose:true, scrollStrategy: new NoopScrollStrategy() } );
    return dialogRef;
  }

  /**
  * Open video call modal
  * @param {any} data - Dialog data
  * @return {MatDialogRef<VideoCallComponent>} - Dialog reference
  */
  openVideoCallModal(data: any): MatDialogRef<VideoCallComponent> {
    const dialogRef = this.dialog.open(VideoCallComponent, { panelClass: "vc-modal-lg", data, hasBackdrop: true, disableClose: true });
    return dialogRef;
  }

  /**
  * Open video call overlay modal
  * @param {any} data - Dialog data
  * @return {MatDialogRef<VcallOverlayComponent>} - Dialog reference
  */
  openVideoCallOverlayModal(data: any): MatDialogRef<VcallOverlayComponent> {
    const dialogRef = this.dialog.open(VcallOverlayComponent, { panelClass: "modal-sm", data, id: "vcOverlayModal", disableClose: true, hasBackdrop: true });
    return dialogRef;
  }

  /**
  * Open searched patients modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openSearchedPatientModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(SearchedPatientsComponent, { panelClass: "modal-lg", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open appointment details day view modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openAppointmentDetailDayViewModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AppointmentDetailComponent, { panelClass: "modal-md", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open appointment details month view modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openAppointmentDetailMonthViewModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AppointmentDetailMonthComponent, { panelClass: ["modal-md", "dayView-con"], data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open cancel appointment confirmation modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openConfirmCancelAppointmentModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(CancelAppointmentConfirmComponent, { panelClass: "modal-md", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open reschedule appointment modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openRescheduleAppointmentModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(RescheduleAppointmentComponent, { panelClass: "modal-md", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open reschedule appointment confirmation modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openRescheduleAppointmentConfirmModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(RescheduleAppointmentConfirmComponent, { panelClass: "modal-md", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open images preview modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openImagesPreviewModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ImagesPreviewComponent, { panelClass: ["modal-lg", "transparent"], data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open mark day as dayoff confirmation modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openConfirmDayOffModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmDayOffComponent, { panelClass: "modal-md", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open mark day hours as hoursOff confirmation modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openConfirmHoursOffModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmHoursOffComponent, { panelClass: "modal-md", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open confirm OpenMRS Id modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openConfirmOpenMrsIdModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmOpenmrsIdComponent, { panelClass: "modal-md", data, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open raise ticket modal
  * @return {MatDialogRef<RaiseTicketComponent>} - Dialog reference
  */
  openRaiseTicketModal(): MatDialogRef<RaiseTicketComponent> {
    const dialogRef = this.dialog.open(RaiseTicketComponent, { panelClass: "modal-md", hasBackdrop: true, disableClose: true });
    return dialogRef;
  }

  /**
  * Open crop image modal
  * @param {any} data - Dialog data
  * @return {MatDialogRef<ImageCropComponent>} - Dialog reference
  */
  openImageCropModal(data: any): MatDialogRef<ImageCropComponent> {
    const dialogRef = this.dialog.open(ImageCropComponent, { panelClass: 'modal-md', data, hasBackdrop: true, disableClose: true });
    return dialogRef;
  }

   /**
  * Open report generator modal
  * @param {any} data - Dialog data
  * @return {MatDialogRef<ReportGeneratorComponent>} - Dialog reference
  */
  openGenerateReportDialog(data: { reportId: Number, title: string, field1: string, field2: string, cancelBtnText: string, confirmBtnText: string }): Observable<any> {
    const dialogRef = this.dialog.open(ReportGeneratorComponent, { panelClass: 'modal-md', data });
    return dialogRef.afterClosed();
  }

   /**
  * Open file download modal
  * @param {any} data - Dialog data
  * @return {MatDialogRef<FileDownloadComponent>} - Dialog reference
  */
  openFileDownloadDialog(data): Observable<any> {
    const dialogRef = this.dialog.open(FileDownloadComponent, { panelClass: 'modal-md', data });
    return dialogRef.afterClosed();
  }

   /**
  * Open report success modal
  * @return {MatDialogRef<ReportSuccessComponent>} - Dialog reference
  */
  openReportSuccessDialog(): Observable<any> {
    const dialogRef = this.dialog.open(ReportSuccessComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

   /**
  * Open report error modal
  * @return {MatDialogRef<ImageCropComponent>} - Dialog reference
  */
  openReportErrorDialog(): Observable<any> {
    const dialogRef = this.dialog.open(ReportErrorComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }
  
  /**
  * Convert blob to base64
  * @param {Blob} blob - Blob  file
  * @return {Promise} - Promise containing base64
  */
  blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  /**
  * Open password reset modal
  * @return {Observable<any>} - Dialog result
  */
  openPasswordResetModal(data): Observable<any> {
    const dialogRef = this.dialog.open(PasswordResetComponent, { panelClass: 'modal-md', hasBackdrop: true, disableClose: true, data });
    return dialogRef.afterClosed();
  }

  /**
  * Open add ticket modal
  * @return {Observable<any>} - Dialog result
  */
  openAddTicketModal(): Observable<any> {
    const dialogRef = this.dialog.open(AddTicketComponent, { panelClass: 'modal-md', hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open language field modal
  * @return {Observable<any>} - Dialog result
  */
  openLanguageFieldModal({ data }: { data: ILanguageFieldUpdate; }): MatDialogRef<LanguageFieldUpdate, any> {
    const dialogRef = this.dialog.open(LanguageFieldUpdate, { panelClass: 'modal-lg', hasBackdrop: true, disableClose: false, data });
    return dialogRef;
  }

  /**
  * Open Visit Summery Sub Section modal
  * @return {Observable<any>} - Dialog result
  */
  openPatientVisitSubSectionModel({ data }: { data: any }): MatDialogRef<SubSectionsComponent, any> {
    const dialogRef = this.dialog.open(SubSectionsComponent, { panelClass: 'modal-md', hasBackdrop: true, disableClose: false, data });
    return dialogRef;
  }
}
