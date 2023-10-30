import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ApiResponseModel, MessageModel, SocketUserModel } from 'src/app/model/model';
import { ChatService } from 'src/app/services/chat.service';
import { CoreService } from 'src/app/services/core/core.service';
import { SocketService } from 'src/app/services/socket.service';
import { WebrtcService } from 'src/app/services/webrtc.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { notifications, doctorDetails, visitTypes } from 'src/config/constant';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, OnDestroy {

  message: string;
  messageList: MessageModel[] = [];
  toUser: string;
  hwName: string;
  isAttachment = false;
  baseUrl: string = environment.baseURL;
  defaultImage = 'assets/images/img-icon.jpeg';
  pdfDefaultImage = 'assets/images/pdf-icon.png';
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;
  sending = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ChatBoxComponent>,
    private chatSvc: ChatService,
    private socketSvc: SocketService,
    private coreService: CoreService,
    private webrtcSvc: WebrtcService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const patientVisitProvider = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER);
    this.toUser = patientVisitProvider?.provider?.uuid;
    this.hwName = patientVisitProvider?.display?.split(":")?.[0];
    if (this.data.patientId && this.data.visitId) {
      this.getMessagesAndCheckRead();
    }
    this.socketSvc.initSocket(true);
    this.socketSvc.updateMessage = true;
    this.subscription1 = this.socketSvc.onEvent(notifications.UPDATE_MESSAGE).subscribe((data) => {
      if (this.socketSvc.updateMessage) {
        this.readMessages(data.id);
      }
    });

    this.subscription3 = this.socketSvc.onEvent("msg_delivered").subscribe((data) => {
      this.getMessages();
    });

    this.subscription2 = this.socketSvc.onEvent("isread").subscribe((data) => {
      this.getMessages();
    });
  }

  /**
  * Get all messages and update status to read
  * @param {string} toUser - To user uuid
  * @param {string} patientId - Patient uuid
  * @param {string} fromUser - from user uuid
  * @param {string} visitId - Visit uuid
  * @param {boolean} isFirstTime - Is first time true/false
  * @return {void}
  */
  getMessagesAndCheckRead(toUser = this.toUser, patientId = this.data.patientId, fromUser = this.fromUser, visitId = this.data.visitId, isFirstTime = false) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: ApiResponseModel) => {
          this.messageList = res?.data;
          const msg = this.messageList[0];
          if (msg && !msg?.isRead && msg?.fromUser !== this.fromUser) {
            this.readMessages(this.messageList[0].id);
          }
        },
      });
  }

  /**
  * Get all messages
  * @param {string} toUser - To user uuid
  * @param {string} patientId - Patient uuid
  * @param {string} fromUser - from user uuid
  * @param {string} visitId - Visit uuid
  * @param {boolean} isFirstTime - Is first time true/false
  * @return {void}
  */
  getMessages(toUser = this.toUser, patientId = this.data.patientId, fromUser = this.fromUser, visitId = this.data.visitId, isFirstTime = false) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: ApiResponseModel) => {
          this.messageList = res?.data;
        },
      });
  }

  /**
  * Send a message.
  * @return {void}
  */
  async sendMessage() {
    if (this.message) {
      const nursePresent: SocketUserModel = this.socketSvc.activeUsers.find(u => u?.uuid === this.toUser);
      if (!nursePresent) {
        this.toastr.error("Please try again later.", "Health Worker is not Online.");
        return;
      }

      const payload = {
        visitId: this.data.visitId,
        patientName: this.data.patientName,
        hwName: this.hwName,
        type: this.isAttachment ? 'attachment' : 'text'
      };
      this.sending = true;
      this.chatSvc
        .sendMessage(this.toUser, this.data.patientId, this.message, payload)
        .subscribe({
          next: (res) => {
            this.isAttachment = false;
            this.getMessages();
            setTimeout(() => { this.sending = false; }, 500);
          },
          error: () => {
            this.isAttachment = false;
          },
          complete: () => {
            this.isAttachment = false;
          }
        });
      this.message = "";
    }
  }

  /**
  * Update message status to read using message id.
  * @param {number} messageId - Message id
  * @return {void}
  */
  readMessages(messageId) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
    });
  }

  /**
  * Getter for from user uuid
  * @return {string} - user uuid
  */
  get fromUser(): string {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  /**
  * Handle image not found error
  * @param {Event} event - onerror event
  * @return {void}
  */
  onImgError(event) {
    event.target.src = 'assets/svgs/user.svg';
  }

  /**
  * Check if attachement is pdf
  * @return {boolean} - True if pdf else false
  */
  isPdf(url: string) {
    return url.includes('.pdf');
  }

  /**
  * Upload attachment
  * @param {file[]} files - Array of attachemnet files
  * @return {void}
  */
  uploadFile(files) {
    this.chatSvc.uploadAttachment(files, this.messageList).subscribe({
      next: (res: ApiResponseModel) => {
        this.isAttachment = true;

        this.message = res.data;
        this.sendMessage();
      }
    });
  }

  /**
  * Set image for an attachment
  * @param {string} src - Attachemnet url
  * @return {void}
  */
  setImage(src) {
    this.coreService.openImagesPreviewModal({ startIndex: 0, source: [{ src }] }).subscribe();
  }

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
    this.subscription3?.unsubscribe();
    this.dialogRef.close();
    this.socketSvc.updateMessage = false;
  }

}
