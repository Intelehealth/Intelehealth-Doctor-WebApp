import { HttpClient } from '@angular/common/http';
import { Injectable, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomConnectOptions,
  RoomEvent,
  Track,
  VideoPresets,
  setLogLevel
} from 'livekit-client';
import { map } from 'rxjs/operators';
import { VisitService } from './visit.service';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  public room: any | null | Room = null;
  public url: string = environment.webrtcSdkServerUrl;
  public token: any | null = null;
  public appToken: any | null = null;
  public remoteUser: any | null = null;
  public callConnected: boolean = false;
  private localElement: ElementRef | string | any;
  private remoteElement: ElementRef | string | any;
  public visitHolderId: null;

  constructor(
    private http: HttpClient,
    private visitSvc: VisitService
  ) {
    /**
     *  trace = 0,
     *  debug = 1,
     *  info = 2,
     *  warn = 3,
     *  error = 4,
     *  silent = 5,
     */
    if (localStorage.webrtcLogLevel) {
      try {
        setLogLevel(JSON.parse(localStorage.webrtcLogLevel));
      } catch (error) {
        console.log('error: ', error);
      }
    }
  }

  getToken(name: string, roomId: string, nurseName: string) {
    return this.http.get(`${environment.webrtcTokenServerUrl}api/getToken?name=${name}&roomId=${roomId}&nurseName=${nurseName}`)
      .pipe(map((res: any) => {
        this.token = res?.token;
        this.appToken = res?.appToken;
        return res;
      }));
  }

  async createRoomAndConnectCall({
    handleTrackSubscribed = this.handleTrackSubscribed.bind(this),
    handleTrackUnsubscribed = this.handleTrackUnsubscribed,
    handleActiveSpeakerChange = this.handleActiveSpeakerChange,
    handleDisconnect = this.noop,
    handleConnect = this.noop,
    handleLocalTrackUnpublished = this.handleLocalTrackUnpublished,
    handleLocalTrackPublished = this.attachLocalVideo.bind(this),
    autoEnableCameraOnConnect = true,
    localElement = 'local-video', /** It can be ElementRef or unique id in string for the local video container element */
    remoteElement = 'remote-video' /** It can be ElementRef or unique id in string for the remote video container element */,
    handleTrackMuted = this.noop,
    handleTrackUnmuted = this.noop,
    handleParticipantDisconnected = this.noop,
    handleParticipantConnect = this.noop
  }) {
    if (!this.token) {
      throw new Error('Token not found!');
      return;
    }

    this.localElement = localElement;
    this.remoteElement = remoteElement;
    this.clearAudioVideo();

    this.room = new Room({
      adaptiveStream: true, /* automatically manage subscribed video quality */
      dynacast: true, /* optimize publishing bandwidth and CPU for published tracks */
      videoCaptureDefaults: {
        resolution: VideoPresets.h180.resolution,
      },
      audioCaptureDefaults: {
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true,
      }
    });

    this.room
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
      .on(RoomEvent.Connected, handleConnect)
      .on(RoomEvent.Disconnected, handleDisconnect)
      .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished)
      .on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished)
      .on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
      .on(RoomEvent.ParticipantConnected, handleParticipantConnect)
      .on(RoomEvent.TrackMuted, handleTrackMuted)
      .on(RoomEvent.TrackUnmuted, handleTrackUnmuted)
      .on(RoomEvent.SignalConnected, async () => {
        await this.room.localParticipant.enableCameraAndMicrophone();
      });
    // let connectOpts: RoomConnectOptions = this.getRoomConnectionOpts();
    await this.room.connect(this.url, this.token);
  }

  clearAudioVideo() {
    try {
      if (this.localContainer) this.localContainer.innerHTML = '';
      if (this.remoteContainer) this.remoteContainer.innerHTML = '';
    } catch (error) {
      console.log('error: ', error);
    }
  }

  /**
   * Assign received streaming video to the passed local video container or id
   */
  attachLocalVideo() {
    const camTrack = this.room.localParticipant.getTrack(Track.Source.Camera);

    if (camTrack?.isSubscribed) {
      const videoElement = camTrack.videoTrack?.attach();
      const localContainer: any = this.localContainer;

      videoElement.style.height = '100%';
      localContainer.appendChild(videoElement);
    }
  }

  handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) {
    const element: any = track.attach();
    if (participant?.identity) {
      this.remoteUser = participant;
    }

    if (track.kind === Track.Kind.Audio) {
      this.remoteContainer.appendChild(element);
    } else if (track.kind === Track.Kind.Video) {
      element.style.height = '100%';
      this.remoteContainer.appendChild(element);
    }
  }

  handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) {
    // remove tracks from all attached elements
    track?.detach();
  }

  handleLocalTrackUnpublished(track: LocalTrackPublication | any, participant: LocalParticipant) {
    // when local tracks are ended, update UI to remove them from rendering
    if (track?.detach) track?.detach();
  }

  handleActiveSpeakerChange(speakers: Participant[]) {
    console.log('speakers: ', speakers);
    // show UI indicators when participant is speaking
  }

  /**
   * Method to toggle local video
   */
  public toggleVideo() {
    this.room.localParticipant.setCameraEnabled(!this.room.localParticipant.isCameraEnabled);
    return this.room.localParticipant.isCameraEnabled;
  }


  /**
   * Method to toggle local audio
   */
  public toggleAudio() {
    this.room.localParticipant.setMicrophoneEnabled(!this.room.localParticipant.isMicrophoneEnabled);
    return this.room.localParticipant.isMicrophoneEnabled;
  }


  handleDisconnect() {
    console.log('disconnected from room');
    this.room.disconnect(true);
    this.callConnected = false;
    this.localContainer.innerHTML = '';
    this.remoteContainer.innerHTML = '';
  }

  async disconnect(stopTracks = true) {
    const cam = this.room.localParticipant.getTrack(Track.Source.Camera);
    const mic = this.room.localParticipant.getTrack(Track.Source.Microphone);
    this.room.disconnect(stopTracks);
  }

  get remoteContainer() {
    return this.remoteElement?.nativeElement || document.getElementById(this.remoteElement);
  }

  get localContainer() {
    return this.localElement?.nativeElement || document.getElementById(this.localElement);
  }

  get currentRoom() {
    return this.room;
  }

  getRoomConnectionOpts(opts: any = {}): RoomConnectOptions {
    let connectOpts: RoomConnectOptions = {}

    connectOpts.rtcConfig = {
      iceTransportPolicy: 'relay',
      iceServers: [
        {
          "username": "dc2d2894d5a9023620c467b0e71cfa6a35457e6679785ed6ae9856fe5bdfa269",
          "credential": "tE2DajzSJwnsSbc123",
          "urls": "turn:global.turn.twilio.com:3478?transport=udp"
        },
        {
          "username": "dc2d2894d5a9023620c467b0e71cfa6a35457e6679785ed6ae9856fe5bdfa269",
          "credential": "tE2DajzSJwnsSbc123",
          "urls": "turn:global.turn.twilio.com:3478?transport=tcp"
        },
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
      ]
    }

    return { ...connectOpts, ...opts };
  }

  /**
   * Noop function to be passed as default function if nothing passed
   */
  noop() {
    console.log('Not Implemented.')
  }

  updateVisitHolderId(uuid: string) {
    new Promise((res, rej) => {
      this.visitSvc.fetchVisitDetails(uuid).subscribe((visit: any) => {
        if (Array.isArray(visit?.attributes)) {
          const visitHolder = visit.attributes.find(va => va?.attributeType?.display === 'Visit Holder');
          this.visitHolderId = visitHolder?.value;

          /**
           * Temporary hack just to test, will be removing later
           */
          const visitHolders = visit.attributes.filter(va => va?.attributeType?.display === 'Visit Holder');
          console.log('visitHolders: ', visitHolders);
          if (visitHolders.length > 1) {
            this.visitHolderId = visitHolders[visitHolders.length - 1];
          }
        }
        res(true);
      }, (error: any) => {
        res(false);
      });
    });
  }

}

