import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Router } from '@angular/router';
declare var JitsiMeetExternalAPI: any;
declare const Swal: any;

@Component({
    selector: 'app-jitsi',
    templateUrl: './jitsi.component.html',
    styleUrls: ['./jitsi.component.css']
})

export class JitsiComponent implements OnInit {

    @ViewChild('localVideo') localVideo: ElementRef;

    private cameraStream: MediaStream | null = null;

    showModal: boolean = false;

    baseURL = "http://ec2-3-111-171-157.ap-south-1.compute.amazonaws.com:8085";

    openModal() {
        this.showModal = true;
      }
    
    closeModal() {
        this.api.executeCommand('hangup')
        setTimeout(() => {
            this.showModal = false;
        }, 1000);
        this.stopCamera()
      }
    

    domain: string = "meet.spirinova.dev"; //The domain value
    room: string = '';
    options: any;
    api: any;
    user: any;
    roomID : any;
    meetID : any;

    // For Custom Controls
    isAudioMuted = false;
    isVideoMuted = false;

    constructor(
        private router: Router,
        private httpClient: HttpClient
    ) { }

    ngOnInit(): void {
        // this.room = 'bwb-bfqi-vmh'; // set your room name
        // this.room = 'random'; // set your room name
        this.user = {
            name: 'Test User' // set your username
        }
    }

    // ngAfterViewInit(): void {
    //     this.options = {
    //         roomName: this.room,
    //         width: 900,
    //         height: 500,
    //         configOverwrite: { prejoinPageEnabled: false },
    //         interfaceConfigOverwrite: {
    //             // overwrite interface properties
    //         },
    //         parentNode: document.querySelector('#jitsi-iframe'),
    //         userInfo: {
    //             displayName: this.user.name
    //         }
    //     }

    //     this.api = new JitsiMeetExternalAPI(this.domain, this.options); //API

    //     this.api.addEventListeners({
    //         readyToClose: this.handleClose,
    //         participantLeft: this.handleParticipantLeft,
    //         participantJoined: this.handleParticipantJoined,
    //         videoConferenceJoined: this.handleVideoConferenceJoined,
    //         videoConferenceLeft: this.handleVideoConferenceLeft,
    //         audioMuteStatusChanged: this.handleMuteStatus,
    //         videoMuteStatusChanged: this.handleVideoStatus
    //     });
    // }

    handleNewMeetWithRecording = () => {
        if (!this.room.trim()) {
            alert('Please enter a valid room name');
            return;
        }

        this.showModal = true;

        this.options = {
            roomName: this.room,
            width: 900,
            height: 500,
            configOverwrite: { prejoinPageEnabled: false, 
            toolbarButtons: ['hangup', 'microphone', 'camera', 'invite', "recording"], 
            apiLogLevels: ['error'],
            constraints: {
                video: {
                    width: {
                        ideal: 480,
                        max: 480,
                        min: 240
                    },
                    height: {
                        ideal: 320,
                        max: 320,
                        min: 240
                    }
                }
            },
            disableShortcuts: false,
            },
            interfaceConfigOverwrite: {
                DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
                SHOW_BRAND_WATERMARK: false,
            },
            parentNode: document.querySelector('#jitsi-iframe'),
            userInfo: {
                displayName: this.user.name
            },
        }

        this.api = new JitsiMeetExternalAPI(this.domain, this.options); //API

        this.api.addEventListeners({
            // participantLeft: this.handleParticipantLeft,
            // participantJoined: this.handleParticipantJoined,
            videoConferenceJoined: () => {
                this.handleStartRecording();
            },
            // videoConferenceLeft: this.handleVideoConferenceLeft,
            // audioMuteStatusChanged: this.handleMuteStatus,
            // videoMuteStatusChanged: this.handleVideoStatus,
            // log: this.handleError,
            // cameraError: this.handleCameraError,
            // audioAvailabilityChanged: this.handleAudioAvailabilityChanged,
            // audioMuteStatusChanged: this.handleAudioMuteStatusChanged,
            // browserSupport: this.handleBrowserSupport,
            // micError: this.handleMicError,
            // tileViewChanged: this.handleTileViewChanged,
            // notificationTriggered: this.handleNotificationTriggered,
            readyToClose: this.handleReadyToClose,
            // suspendDetected: this.handleSuspendDetected,
            // peerConnectionFailure: this.handlePeerConnectionFailure,
            // p2pStatusChanged: this.handleP2pStatusChanged,
        });

    }

    handleNewMeet = () => {
        if (!this.room.trim()) {
            alert('Please enter a valid room name');
            return;
        }

        this.showModal = true;
        this.handleIframe();

        this.options = {
            roomName: this.room,
            width: 500,
            height: 500,
            configOverwrite: { prejoinPageEnabled: false, 
            toolbarButtons: [], 
            apiLogLevels: ['error'],
            constraints: {
                video: {
                    width: {
                        ideal: 480,
                        max: 480,
                        min: 240
                    },
                    height: {
                        ideal: 320,
                        max: 320,
                        min: 240
                    }
                }
            },
            disableShortcuts: false,
            },
            interfaceConfigOverwrite: {
                DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
                SHOW_BRAND_WATERMARK: false,
            },
            parentNode: document.querySelector('#jitsi-iframe'),
            userInfo: {
                displayName: this.user.name
            },
        }

        this.api = new JitsiMeetExternalAPI(this.domain, this.options); //API

        this.api.addEventListeners({
            // participantLeft: this.handleParticipantLeft,
            // participantJoined: this.handleParticipantJoined,
            videoConferenceJoined: this.handleVideoConferenceJoined,
            videoConferenceLeft: this.handleVideoConferenceLeft,
            // audioMuteStatusChanged: this.handleMuteStatus,
            // videoMuteStatusChanged: this.handleVideoStatus,
            log: this.handleError,
            // cameraError: this.handleCameraError,
            // audioAvailabilityChanged: this.handleAudioAvailabilityChanged,
            // audioMuteStatusChanged: this.handleAudioMuteStatusChanged,
            // browserSupport: this.handleBrowserSupport,
            // micError: this.handleMicError,
            // tileViewChanged: this.handleTileViewChanged,
            // notificationTriggered: this.handleNotificationTriggered,
            readyToClose: this.handleReadyToClose,
            suspendDetected: this.handleSuspendDetected,
            peerConnectionFailure: this.handlePeerConnectionFailure,
            p2pStatusChanged: this.handleP2pStatusChanged,
        });

    }

    handleCameraError = async (err) => {
        console.log(err,"This is camera error")
    }
    
    handleAudioAvailabilityChanged = async (err) => {
        console.log(err,"This is handleAudioAvailabilityChanged")
    }

    handleAudioMuteStatusChanged = async (err) => {
        console.log(err,"This is handleAudioMuteStatusChanged")
    }

    handleBrowserSupport = async (err) => {
        console.log(err,"This is handleBrowserSupport")
    }

    handleMicError = async (err) => {
        console.log(err,"This is handleMicError")
    }

    handleTileViewChanged = async (err) => {
        console.log(err,"This is handleTileViewChanged")
    }

    handleNotificationTriggered = async (err) => {
        console.log(err,"This is handleNotificationTriggered")
    }

    handleParticipantJoined = async (participant) => {
        console.log(participant, "This is handleParticipantJoined");
    }

    handleParticipantLeft = async (participant) => {
        console.log(participant, "This is handleParticipantLeft");
    }

    handleVideoConferenceJoined = async (participant) => {
        this.api.executeCommand('toggleTileView');
        // this.handleStartRecording();
        console.log(participant, "This is handleVideoConferenceJoined");
        // const data2 = await this.getParticipants();
        // console.warn(data2,"This is data")

        this.api.getRoomsInfo().then(rooms => {
            rooms?.rooms.map((item) => {
                this.roomID = item?.id;
                this.meetID = item?.jid;
                console.warn(rooms,"This is room item");
            })

            const data = [{RoomID: this.roomID ,MeetingID: this.meetID ,MeetingStartTime:new Date(),DoctorID:"0ab80436-5895-4ae5-8074-f58827a12f8a"}];
            // console.warn(data,"This is room item");
            this.handleMeetStart(data);
        })   
    }

    handleVideoConferenceLeft = async (participant) => {
        console.log(participant, "This is handleVideoConferenceLeft");

         const data = [{RoomID: this.roomID ,MeetingID: this.meetID ,MeetingEndTime:new Date(),DoctorID:"0ab80436-5895-4ae5-8074-f58827a12f8a"}];
        // console.warn(data,"This is room item");
        this.handleMeetEnd(data);
    }

    handleVideoQualityChanged = async (res) => {
        console.log(res, "This is handleVideoQualityChanged");
    }

    handleReadyToClose = async (res) => {
        this.api.dispose()
    }

    handleSuspendDetected = async (res) => {
        console.log(res, "This is handleSuspendDetected");
    }

    handlePeerConnectionFailure = async (res) => {
        console.log(res, "This is handlePeerConnectionFailure");
    }

    handleP2pStatusChanged = async (res) => {
        console.log(res, "This is handleP2pStatusChanged");
    }


    handleIframe =  () => {
        navigator.mediaDevices
        .getUserMedia({ video: true})
        .then((stream) => {
        //   this.localVideo.nativeElement.srcObject = stream;
          const videoElement = this.localVideo.nativeElement;
          videoElement.srcObject = stream;
          this.cameraStream = stream;
        })
        .catch((error) => {
          alert('Error accessing camera');
        });
    }
    
    stopCamera() {
        if (this.cameraStream) {
          const tracks = this.cameraStream.getTracks();
          tracks.forEach((track) => track.stop());
          this.localVideo.nativeElement.srcObject = null;
          this.cameraStream = null;
        }
      }





    handleError = async (error) => {
        console.log("This is are the errors",error);
        if(error?.args?.length === 3 && !error?.args[2]?.includes("WakeLock")){
            // alert(error?.args[2])
            Swal.fire({
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                position: "bottom-end",
                icon: "error",
                title: "Error - " + error?.args[2],
                confirmButtonText: 'Ok'
            })
            // .then(() => {
            //     this.api.dispose();
            // })
        }
        else if(error?.args?.length === 5){
            // alert(error?.args[4]?.message)
            Swal.fire({
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                position: "bottom-end",
                icon: "error",
                title: "Error - " + error?.args[4]?.message,
                confirmButtonText: 'Ok'
            })
            // .then(() => {
            //     this.api.dispose();
            // })
        }
        else return null
    }

    //API FUNCTIONS /////

    fetchData() {
        const apiUrl = `${this.baseURL}/api/JitsiAPI/GetChatRoomDetails?ChatRoomID=102d7682-56da-11ee-aa1c-0605fa`;
    
        this.httpClient.get(apiUrl).subscribe((data) => {
            console.log('GET Response:', data);
        }, (error) => {
            console.error('GET Error:', error);
        });

        console.log(new Date())
    }

    handleMeetStart(data){
        const apiUrl = `${this.baseURL}/api/JitsiAPI/UpdMeetingStartDetails`;

          this.httpClient.post(apiUrl, data).subscribe(
            (data) => {
              console.warn('POST Response:', data);
            },
            (error) => {
              console.error('POST Error:', error);
            }
          );
      
    }

    handleMeetEnd(data){
        const apiUrl = `${this.baseURL}/api/JitsiAPI/UpdMeetingEndDetails`;

          this.httpClient.post(apiUrl, data).subscribe(
            (data) => {
              console.warn('POST Response:', data);
            },
            (error) => {
              console.error('POST Error:', error);
            }
          );
      
    }


    handleMuteStatus = (audio) => {
        console.log("handleMuteStatus", audio); // { muted: true }
    }

    handleVideoStatus = (video) => {
        console.log("handleVideoStatus", video); // { muted: true }
    }

    handle = async () => {
        const data = await this.getParticipants();
        console.log(data,"THis is data")
    }

    getParticipants() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(this.api.getParticipantsInfo()); // get all participants
            }, 500)
        });
    }

    // custom events
    executeCommand(command: string) {
        this.api.executeCommand(command);
        if(command == 'hangup') {
            this.router.navigate(['/thank-you']);
            return;
        }

        if(command == 'toggleAudio') {
            this.isAudioMuted = !this.isAudioMuted;
        }

        if(command == 'toggleVideo') {
            this.isVideoMuted = !this.isVideoMuted;
        }
    }

    handleKick = () => {
        this.api.executeCommand('kickParticipant',
            "1389ed85" // participantID
        )
    }

    handleLeaveCall = () => {
        this.api.executeCommand('hangup')
    }

    handleEndCall = () => {
        this.api.executeCommand('endConference')
    }

    handleStartRecording = () => {
        this.api.executeCommand("startRecording", {
            mode: "file",
            onlySelf: false,
        })
    }
}