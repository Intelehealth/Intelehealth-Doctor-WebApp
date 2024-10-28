import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  DialogPosition,
  MatDialog,
  MatDialogConfig,
} from "@angular/material/dialog";
import { BehaviorSubject, Observable } from "rxjs";
import * as io from "socket.io-client";
import { environment } from "../../environments/environment";
import { VisitService } from "./visit.service";
import { getCacheData, setCacheData } from "../utils/utility-functions";
import { WebrtcService } from "./webrtc.service";
import { ToastrService } from "ngx-toastr";
import { doctorDetails } from "src/config/constant";
import { CoreService } from "./core/core.service";
import { SocketUserModel } from "../model/model";
import { notifications } from 'src/config/constant';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public socket: any;
  public incoming;
  public incomingCallData = {};
  public activeUsers: SocketUserModel[] = [];
  appIcon = "/assets/images/intelehealth-logo-reverse.png";
  public callRing = new Audio("assets/phone.mp3");
  ringTimeout = null;
  closeOverlayTimeout = null;
  updateMessage = false;
  private baseURL = environment.socketURL;
  private adminUnreadSubject: BehaviorSubject<any>;
  public adminUnread: Observable<any>;
  private drUnreadSubject: BehaviorSubject<any>;
  public drUnread: Observable<any>;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private visitSvc: VisitService,
    private webrtcSvc: WebrtcService,
    private cs: CoreService,
    private toastr: ToastrService
  ) {
    this.adminUnreadSubject = new BehaviorSubject<any>(0);
    this.adminUnread = this.adminUnreadSubject.asObservable();
    this.drUnreadSubject = new BehaviorSubject<any>(0);
    this.drUnread = this.drUnreadSubject.asObservable();
  }

  addCount(count: number) {
    this.adminUnreadSubject.next(count);
  }

  addDoctorCount(count: number) {
    this.drUnreadSubject.next(count);
  }

  message(roomId, clientId, message): Observable<any> {
    const url = `${this.baseURL}/message/${roomId}/${clientId}`;
    return this.http.post(url, message);
  }

  public initSocket(forceInit = false) {
    if (forceInit && this.socket?.id && this.socket?.disconnect) {
      this.socket.disconnect();
    }
    if (!this.socket || forceInit) {
      if (!sessionStorage.webrtcDebug) {
        setCacheData('socketQuery', `userId=${this.userUuid}&name=${this.userName}`);
      }

      this.socket = io(environment.socketURL, {
        query: getCacheData(false, 'socketQuery'),
      });

      this.onEvent("log").subscribe((array) => {
        if (getCacheData(false, 'log') === "1") console.log.apply(console, array);
      });

      this.initEvents();
    }
  }

  initEvents() {
    this.onEvent("allUsers").subscribe((data) => {
      this.activeUsers = data;
    });

    this.onEvent("cancel_hw").subscribe((data) => {
      this.toastr.error(`Call Cancelled.`, "Health Worker cancelled the call.");
      this.closeVcOverlay();
    });

    this.onEvent("incoming_call").subscribe((data = {}) => {
      if (!location.hash.includes("test/chat")) {
        localStorage.patientId = data.patientId;
        if (localStorage.patientId) {
          this.openVcOverlay(data);
        }
      }
    });

    this.onEvent("updateMessage").subscribe((data) => {
      this.emitEvent('ack_msg_received', { messageId: data.id });
    });

    this.onEvent(notifications.DOCTOR_UNREAD_COUNT).subscribe((data) => {
      this.addDoctorCount(data);
    });
  }

  public emitEvent(action, data) {
    this.socket?.emit(action, data);
  }

  public onEvent(action) {
    return new Observable<any>((observer) => {
      this.socket.on(action, (data) => observer.next(data));
    });
  }

  async showNotification({ title, body, timestamp = Date.now() }) {
    if ("Notification" in window === true) {
      if ("granted" === (await Notification.requestPermission())) {
        const icon = this.appIcon;
        return new Notification(title, {
          body,
          icon,
          vibrate: [200, 100, 200],
          timestamp: Math.floor(timestamp),
        });
      }
    }
  }

  public openVcOverlay(data: any) {
    this.callRing = new Audio("assets/phone.mp3");
    this.cs.openVideoCallOverlayModal(data);
    this.callRing.play();

    this.ringTimeout = setInterval(() => {
      this.callRing.pause();
      this.callRing = new Audio("assets/phone.mp3");
      this.callRing.play();
    }, 10000);

    this.closeOverlayTimeout = setTimeout(() => {
      if (!this.webrtcSvc.callConnected) {
        this.closeVcOverlay();
      }
    }, 59000);
  }

  public closeVcOverlay() {
    const dailog = this.dialog.getDialogById("vcOverlayModal");
    clearInterval(this.ringTimeout);
    clearInterval(this.closeOverlayTimeout);
    if (dailog) {
      dailog.close();
    }
    this.callRing.pause();
  }

  public openNewVCModal(
    initiator = "dr",
    visitId = this.visitSvc.chatVisitId || ""
  ) {
    this.visitSvc.isVisitSummaryShow = true;
    const bodyElement = document.body;
    bodyElement.classList.add("body-hide-overflow");
    window.scroll(0, 0);
    const position: DialogPosition = {
      top: "90px",
      right: "0px",
    };
  }

  get user() {
    try {
      return getCacheData(true, doctorDetails.USER);
    } catch (error) {
      return {};
    }
  }

  get userUuid() {
    return this.user.uuid;
  }

  get userName() {
    return this.user.display;
  }

  close() {
    try {
      this.socket.close();
    } catch (error) { }
  }

  public initSocketSupport(forceInit = false) {
    if (forceInit && this.socket?.id && this.socket?.disconnect) {
      this.socket.disconnect();
    }
    if (!this.socket || forceInit) {
      this.socket = io(environment.socketURL, {
        query: `userId=${this.userUuid}&name=${this.userName}`
      });
    }
    this.initEvents();
  }
}
