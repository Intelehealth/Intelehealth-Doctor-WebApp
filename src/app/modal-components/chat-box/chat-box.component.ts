import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatService } from 'src/app/services/chat.service';
import { CoreService } from 'src/app/services/core/core.service';
import { SocketService } from 'src/app/services/socket.service';
import { WebrtcService } from 'src/app/services/webrtc.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {

  message: string;
  messageList: any = [];
  toUser: any;
  hwName: any;
  isAttachment = false;
  baseUrl: string = environment.baseURL;
  defaultImage = 'assets/images/img-icon.jpeg';
  pdfDefaultImage = 'assets/images/pdf-icon.png';
  sending = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ChatBoxComponent>,
    private chatSvc: ChatService,
    private socketSvc: SocketService,
    private coreService: CoreService,
    private webrtcSvc: WebrtcService
  ) { }

  async ngOnInit() {
    const patientVisitProvider = JSON.parse(localStorage.getItem("patientVisitProvider"));
    await this.webrtcSvc.updateVisitHolderId(this.data.visitId);
    this.toUser = this.webrtcSvc.visitHolderId || patientVisitProvider?.provider?.uuid;
    // this.toUser = patientVisitProvider?.provider?.uuid;
    this.hwName = patientVisitProvider?.display?.split(":")?.[0];
    if (this.data.patientId && this.data.visitId) {
      this.getMessagesAndCheckRead();
    }
    // this.socketSvc.initSocket(true);
    this.socketSvc.updateMessage = true;
    this.socketSvc.onEvent("updateMessage").subscribe((data) => {
      if (this.socketSvc.updateMessage) {
        this.readMessages(data.id);
      }
    });
    this.socketSvc.onEvent("msg_delivered").subscribe((data) => {
      this.getMessages();
    });

    this.socketSvc.onEvent("isread").subscribe((data) => {
      this.getMessages();
    });
  }

  ngOnDestroy() {
    console.log('chat destroyed');
    this.dialogRef.close();
    this.socketSvc.updateMessage = false;
  }

  getMessagesAndCheckRead(toUser = this.toUser, patientId = this.data.patientId, fromUser = this.fromUser, visitId = this.data.visitId, isFirstTime = false) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: any) => {
          this.messageList = res?.data;
          const msg = this.messageList[0];
          if (msg && !msg?.isRead && msg?.fromUser !== this.fromUser) {
            this.readMessages(this.messageList[0].id);
          }
        },
      });
  }

  getMessages(toUser = this.toUser, patientId = this.data.patientId, fromUser = this.fromUser, visitId = this.data.visitId, isFirstTime = false) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: any) => {
          this.messageList = res?.data;
        },
      });
  }

  sendMessage() {
    if (this.message) {
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

  readMessages(messageId) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
    });
  }

  get fromUser() {
    return JSON.parse(localStorage.user).uuid;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  isPdf(url) {
    return url.includes('.pdf');
  }

  uploadFile(files) {
    this.chatSvc.uploadAttachment(files, this.messageList).subscribe({
      next: (res: any) => {
        this.isAttachment = true;

        this.message = res.data;
        this.sendMessage();
      }
    });
  }

  setImage(src) {
    this.coreService.openImagesPreviewModal({ startIndex: 0, source: [{ src }] }).subscribe();
  }

}
