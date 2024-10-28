import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PageTitleService } from '../core/page-title/page-title.service';
import { ChatService } from '../services/chat.service';
import { SocketService } from '../services/socket.service';
import { CoreService } from '../services/core/core.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from '../utils/utility-functions';
import { notifications, doctorDetails, languages } from 'src/config/constant';
import { ApiResponseModel, ConversationModel, MessageModel, PatientVisitsModel } from '../model/model';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {

  conversations: ConversationModel[] = [];
  searchValue: string;
  baseURL = environment.baseURL;
  selectedConversation: ConversationModel;

  message = '';
  fromUuid = null;
  visits: PatientVisitsModel[] = [];
  messageList: MessageModel[];
  visitId: string;
  openMenu = false;
  isOver = false;
  isAttachment = false;
  defaultImage: string = 'assets/images/img-icon.jpeg';
  pdfDefaultImage: string = 'assets/images/pdf-icon.png';
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(
    private pageTitleService: PageTitleService,
    private chatSvc: ChatService,
    private socketSvc: SocketService,
    private coreService: CoreService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Messages", imgUrl: "assets/svgs/menu-message-circle.svg" });
    this.getPatientsList(this.chatSvc?.user?.uuid);
    this.socketSvc.initSocket(true);
    this.subscription1 = this.socketSvc.onEvent(notifications.UPDATE_MESSAGE).subscribe((data) => {
      let isChatOpened = this.selectedConversation.patientId == data.patientId;
      if(isChatOpened){
        this.readMessages(data.id);
      }
      this.conversations.forEach(con=>{
        if(data.patientId === con.patientId){
          if(!isChatOpened) con.count++;
          con.message = data.message;
        }
      });
    });

    this.subscription2 = this.socketSvc.onEvent('isread').subscribe((data) => {
      this.getMessages();
    });

    this.subscription3 = this.socketSvc.onEvent('msg_delivered').subscribe((data) => {
      this.getMessages();
    });
  }

  /**
  * Get filtered conversations based on doctor name or user uuid.
  * @return {void}
  */
  get filteredConversations() {
    return this.conversations.filter((conversation: ConversationModel) => {
      return (
        conversation?.patientName.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        conversation?.message.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        conversation?.openMrsId?.toLowerCase().includes(this.searchValue.toLowerCase())
      );
    });
  }

  /**
  * Get patients list/ conversations.
  * @param {string} drUuid - User uuid of the logged-in doctor
  * @return {void}
  */
  getPatientsList(drUuid) {
    this.chatSvc.getPatientList(drUuid).subscribe({
      next: (res: ApiResponseModel) => {
        this.conversations = res.data;
      },
    });
  }

  /**
  * Select conversation.
  * @param {ConversationModel} conversation - Conversation to select
  * @return {void}
  */
  conversationSelected(conversation: ConversationModel) {
    this.selectedConversation = conversation;
    this.visitId = this.selectedConversation?.visitId;
    if (this.selectedConversation?.fromUser !== this.fromUser) {
      this.readMessages(this.selectedConversation?.id);
    } else {
      this.getMessages();
    }
    this.selectedConversation.count = 0;
  }

  /**
  * Get patients all visits
  * @param {string} patientId - onerror event
  * @return {void}
  */
  getPatientsVisits(patientId: string) {
    this.chatSvc.getPatientAllVisits(patientId).subscribe({
      next: (res: ApiResponseModel) => {
        this.visits = res?.data;
      },
    });
  }

  /**
  * Callback for visit changes event
  * @param {string} visitId - Visit uuid
  * @return {void}
  */
  onVisitChange(visitId: string) {
    this.visitId = visitId;
    this.getMessages();
  }

  /**
  * Get all messages for the selected conversation.
  * @return {void}
  */
  getMessages() {
    this.chatSvc.getPatientMessages(this.selectedConversation?.toUser, this.selectedConversation?.patientId, this.selectedConversation?.fromUser, this.visitId)
      .subscribe({
        next: (res: ApiResponseModel) => {
          this.messageList = res?.data;
          this.getPatientsVisits(this.selectedConversation?.patientId);
          this.conversations[this.conversations.findIndex(c => c?.id === this.selectedConversation.id)].message = this.messageList[0].message
        },
      });
  }

  /**
  * Update message status to read using message id.
  * @param {number} messageId - Message id
  * @return {void}
  */
  readMessages(messageId: number) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
    });
  }

  /**
  * Getter for patient name
  * @return {string} - Patient name
  */
  get patientName(): string {
    return getCacheData(false, 'patientName') || '';
  }

  /**
  * Send a message.
  * @return {void}
  */
  sendMessage() {
    if (this.message) {
      this.selectedConversation.latestMessage = this.message;

      const payload = {
        visitId: this.selectedConversation?.visitId,
        patientName: this.selectedConversation.patientName,
        hwName: this.selectedConversation?.hwName,
        openMrsId: this.selectedConversation?.openMrsId,
        type: this.isAttachment ? 'attachment' : 'text'
      };

      this.chatSvc
        .sendMessage(
          (this.selectedConversation?.toUser === this.fromUser ? this.selectedConversation?.fromUser : this.selectedConversation?.toUser),
          this.selectedConversation?.patientId,
          this.message,
          payload
        )
        .subscribe({
          next: (res) => {
            this.isAttachment = false;
            this.getMessages();
            this.conversations[this.conversations.findIndex(c => c.id === this.selectedConversation.id)].message = this.selectedConversation.latestMessage;
          },
          error: () => {
            this.isAttachment = false;
          },
          complete: () => {
            this.isAttachment = false;
          }
        });
      this.message = '';
    }
  }

  /**
  * Getter for from user uuid
  * @return {string} - user uuid
  */
  get fromUser(): string {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  /**
  * Set image for an attachment
  * @param {string} src - Attachemnet url
  * @return {void}
  */
  setImage(src: string) {
    this.coreService.openImagesPreviewModal({ startIndex: 0, source: [{ src }] }).subscribe();
  }

  /**
  * Check if attachement is pdf
  * @return {boolean} - True if pdf else false
  */
  isPdf(url): boolean {
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

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
    this.subscription3?.unsubscribe();
  }

}
