import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "src/app/services/socket.service";
declare const getFromStorage: Function;
@Component({
  selector: "app-vc",
  templateUrl: "./vc.component.html",
  styleUrls: ["./vc.component.css"],
})
export class VcComponent implements OnInit, OnDestroy {
  @ViewChild("remoteVideo") remoteVideoRef: any;
  @ViewChild("localVideo") localVideoRef: any;
  @ViewChild("mainContainer") mainContainer: any;
  @ViewChild("localContainer") localContainer: any;

  callerStream: any;
  localStream: MediaStream;
  remoteStream: MediaStream;
  myId;
  callerSignal;
  callerInfo;
  incomingCall;
  isInitiator;
  isStarted;
  pc;
  isChannelReady;
  room = "";
  isMute = false;
  isVideoOff = false;
  isFullscreen = false;
  classFlag = false;
  setSpiner = false;
  patientUuid = "";
  nurseId: { uuid } = { uuid: null };
  doctorName = "";

  constructor(
    public socketService: SocketService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<VcComponent>,
    private snackbar: MatSnackBar
  ) { }

  close() {
    this.dialogRef.close();
    this.localStream.getTracks().forEach(function (track) {
      track.stop();
    });
    if (this.remoteStream)
      this.remoteStream.getTracks().forEach(function (track) {
        track.stop();
      });
  }

  toast({
    message,
    duration = 5000,
    horizontalPosition = "center",
    verticalPosition = "bottom",
  }) {
    const opts: any = {
      duration,
      horizontalPosition,
      verticalPosition,
    };
    this.snackbar.open(message, null, opts);
  }

  ngOnInit(): void {
    this.room = this.data.patientUuid;
    const patientVisitProvider = getFromStorage("patientVisitProvider");
    const doctorName = getFromStorage("doctorName");
    this.doctorName = doctorName ? doctorName : this.user.display;

    this.nurseId =
      patientVisitProvider && patientVisitProvider.provider
        ? patientVisitProvider.provider
        : this.nurseId;

    this.socketService.initSocket(true);
    this.initSocketEvents();
    this.socketService.emitEvent("call", {
      nurseId: this.nurseId.uuid,
      doctorName: this.doctorName,
      roomId: this.room,
    });
    this.makeCall();
    this.socketService.onEvent("toast").subscribe((data) => {
      if (data?.message) {
        this.toast(data);
      }
    });
  }

  ngOnDestroy() {
    this.socketService.close();
    this.close();
  }

  @HostListener("fullscreenchange")
  fullScreenChange() {
    this.isFullscreen = document.fullscreenEnabled;
  }

  makeCall() {
    this.startUserMedia();
    this.socketService.emitEvent("create or join", this.room);
    console.log("Attempted to create or  join room", this.room);
    this.toast({
      message: "Calling....",
      duration: 8000,
    });
  }

  mute() {
    this.localStream.getAudioTracks()[0].enabled = this.isMute;
    this.isMute = !this.isMute;
  }

  video() {
    this.localStream.getVideoTracks()[0].enabled = this.isVideoOff;
    this.isVideoOff = !this.isVideoOff;
  }

  fullscreen() {
    if (this.isFullscreen) {
      document.exitFullscreen();
    } else {
      this.mainContainer.nativeElement.requestFullscreen();
    }
    this.isFullscreen = !this.isFullscreen;
  }

  isStreamAvailable;
  startUserMedia(config?: any, cb = () => { }): void {
    let mediaConfig = {
      audio: true,
      video: {
        width: { min: 160, ideal: 480 },
        height: { min: 120, ideal: 640 },
        frameRate: { min: 5, ideal: 20 },
      },
    };

    if (config) {
      mediaConfig = config;
    }

    const n = <any>navigator;
    n.getUserMedia =
      n.getUserMedia ||
      n.webkitGetUserMedia ||
      n.mozGetUserMedia ||
      n.msGetUserMedia;
    n.getUserMedia(
      mediaConfig,
      (stream: MediaStream) => {
        this.localStream = stream;
        const localStream = new MediaStream();
        localStream.addTrack(stream.getVideoTracks()[0]);
        this.localVideoRef.nativeElement.srcObject = localStream;
        cb();
      },
      (err) => {
        this.isStreamAvailable = false;
        console.error(err);
      }
    );
  }

  initSocketEvents() {
    this.socketService.onEvent("join").subscribe((room) => {
      console.log("Another peer made a request to join room " + room);
      console.log("This peer is the initiator of room " + room + "!");
      this.isChannelReady = true;
    });

    this.socketService.onEvent("joined").subscribe((room) => {
      console.log("joined: " + room);
      this.isChannelReady = true;
    });

    this.socketService.onEvent("log").subscribe((array) => {
      console.log.apply(console, array);
    });

    this.socketService.onEvent("message").subscribe((message) => {
      console.log("Client received message:", message);
      if (message === "got user media") {
        this.maybeStart();
      } else if (message.type === "offer") {
        if (!this.isInitiator && !this.isStarted) {
          this.maybeStart();
        }
        this.pc.setRemoteDescription(new RTCSessionDescription(message));
        this.doAnswer();
      } else if (message.type === "answer" && this.isStarted) {
        this.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === "candidate" && this.isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate,
        });
        this.pc.addIceCandidate(candidate);
      } else if (message === "bye" && this.isStarted) {
        this.handleRemoteHangup();
      }
    });

    this.socketService.onEvent("myId").subscribe((id) => (this.myId = id));
    this.socketService.onEvent("bye").subscribe((data) => {
      console.log("bye::: ", data);
      this.handleRemoteHangup();
    });
    this.socketService.onEvent("no answer").subscribe((data) => {
      console.log("no answer: ", data);
      this.toast({ message: "No answer." });
      this.close();
    });
  }

  maybeStart() {
    if (
      !this.isStarted &&
      typeof this.localStream !== "undefined" &&
      this.isChannelReady
    ) {
      console.log(">>>>>> creating peer connection");
      this.createPeerConnection();
      this.pc.addStream(this.localStream);
      this.isStarted = true;
      if (this.isInitiator) {
        this.doCall();
      }
    }
  }

  createPeerConnection() {
    try {
      this.pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: ["turn:demo.intelehealth.org:3478"],
            username: "ihuser",
            credential: "keepitsecrect",
          },
          {
            urls: ["turn:testing.intelehealth.org:3478"],
            username: "ihuser",
            credential: "keepitsecrect",
          },
          { urls: ["stun:stun.l.google.com:19302"] },
          { urls: ["stun:stun1.l.google.com:19302"] },
        ],
      });
      this.pc.onicecandidate = this.handleIceCandidate.bind(this);
      this.pc.onaddstream = this.handleRemoteStreamAdded.bind(this);
      this.pc.onremovestream = this.handleRemoteStreamRemoved.bind(this);
      console.log("Created RTCPeerConnnection");
    } catch (e) {
      console.log("Failed to create PeerConnection, exception: " + e.message);
      alert("Cannot create RTCPeerConnection object.");
      return;
    }
  }

  handleRemoteStreamRemoved(event) {
    console.log("Remote stream removed. Event: ", event);
  }

  handleRemoteStreamAdded(event) {
    console.log("Remote stream added.");
    const remoteStream = event.stream;
    this.remoteVideoRef.nativeElement.srcObject = remoteStream;
    this.remoteStream = remoteStream;
    this.setSpiner = true;
  }

  handleIceCandidate(event) {
    console.log("icecandidate event: ", event);
    if (event.candidate) {
      this.sendMessage({
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    } else {
      console.log("End of candidates.");
    }
    this.setSpiner = true;
    setTimeout(() => {
      this.setSpiner = false;
    }, 2000);
  }

  doCall() {
    console.log("Sending offer to peer");
    this.pc.createOffer(
      this.setLocalAndSendMessage.bind(this),
      this.handleCreateOfferError.bind(this)
    );
  }

  handleCreateOfferError(event) {
    console.log("createOffer() error: ", event);
  }

  doAnswer() {
    console.log("Sending answer to peer.");
    this.pc
      .createAnswer()
      .then(
        this.setLocalAndSendMessage.bind(this),
        this.onCreateSessionDescriptionError.bind(this)
      );
  }

  setLocalAndSendMessage(sessionDescription) {
    this.pc.setLocalDescription(sessionDescription);
    console.log("setLocalAndSendMessage sending message", sessionDescription);
    this.sendMessage(sessionDescription);
  }

  onCreateSessionDescriptionError(error) {
    console.log("Failed to create session description: " + error.toString());
  }

  sendMessage(data) {
    this.socketService.emitEvent("message", data);
  }

  handleRemoteHangup() {
    console.log("Session terminated.");
    this.isInitiator = false;
    this.stop();
    if (this.socketService.socket) this.socketService.socket.close();
  }

  endCallInRoom() {
    this.socketService.emitEvent("bye", this.room);
    this.setSpiner = false;
    this.close();
  }

  stop() {
    this.isStarted = false;
    this.localStream &&
      this.localStream.getTracks().forEach(function (track) {
        track.stop();
      });
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.setSpiner = false;
    this.close();
  }

  get users() {
    return this.socketService.activeUsers;
  }

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }
}