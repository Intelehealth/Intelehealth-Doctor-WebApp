import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiResponseModel, MessageModel, UserModel } from 'src/app/model/model';
import { SocketService } from 'src/app/services/socket.service';
import { SupportService } from 'src/app/services/support.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { notifications, doctorDetails } from 'src/config/constant';

@Component({
  selector: 'app-help-menu',
  templateUrl: './help-menu.component.html',
})
export class HelpMenuComponent implements OnInit, OnDestroy {

  messages: MessageModel[] = [];
  message = '';
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private socketService: SocketService, private supportService: SupportService) { }

  ngOnInit(): void {
    this.getMessages(true);
    this.socketService.initSocketSupport(true);
    this.subscription1 = this.socketService.onEvent(notifications.SUPPORT_MESSAGE).subscribe((data) => {
      this.readMessagesSupport(data.id);
      this.messages = data.allMessages.sort((a: MessageModel, b: MessageModel) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
    });

    this.subscription2 = this.socketService.onEvent(notifications.ISREAD_SUPPORT).subscribe((data) => {
      if (data.msgTo === 'System Administrator') {
        this.getMessages();
      }
    });
  }

  /**
  * Send a message.
  * @return {void}
  */
  sendMessage(): void {
    if (!this.message || this.message.trim() === '') {
      return; // Do not send a blank message
    }
    const payload = {
      type: 'text',
      message: this.message,
      from: this.user.uuid,
      to: 'System Administrator'
    };
    this.supportService.sendMessage(payload).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.message = '';
        this.getMessages();
      }
    });
  }

  /**
  * Get all messages to and from admin
  * @param {boolean} init - Init true/false
  * @return {void}
  */
  getMessages(init = false) {
    this.supportService.getSupportMessages(this.user.uuid, 'System Administrator')
      .subscribe({
        next: (res: ApiResponseModel) => {
          if (res.success) {
            this.messages = res?.data;
            if (init && this.messages.length) {
              const mid = this.messages.find(m => m.from === 'System Administrator')?.id;
              if (mid) {
                this.readMessagesSupport(mid);
              }
            }
          }
        },
      });
  }

  /**
  * Update message status to read using message id.
  * @param {number} messageId - Message id
  * @return {void}
  */
  readMessagesSupport(messageId: number) {
    this.supportService.readMessageById(this.user?.uuid, messageId).subscribe({
      next: (res: ApiResponseModel) => {
        if (res.success) {
          this.getMessages();
        }
      },
    });
  }

  /**
  * Get user from localstorage
  * @return {UserModel} - User
  */
  get user() {
    return getCacheData(true, doctorDetails.USER);
  }

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
  }

}
