import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
declare var JitsiMeetExternalAPI: any;
declare const Swal: any;

@Component({
    selector: 'app-jitsi',
    templateUrl: './jitsi.component.html',
    styleUrls: ['./jitsi.component.css']
})
export class JitsiComponent implements OnInit {

    domain: string = "meet.spirinova.dev"; //The domain value
    room: string = '';
    options: any;
    api: any;
    user: any;

    // For Custom Controls
    isAudioMuted = false;
    isVideoMuted = false;

    constructor(
        private router: Router
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

    handleNewMeet = () => {
        if (!this.room.trim()) {
            alert('Please enter a valid room name');
            return;
        }

        this.options = {
            roomName: this.room,
            width: 900,
            height: 500,
            configOverwrite: { prejoinPageEnabled: false, 
                // toolbarButtons: ['hangup', 'microphone', 'camera', 'invite', "recording"], 
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
            }
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
            // videoConferenceJoined: this.handleVideoConferenceJoined,
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
        // this.handleStartRecording();
        console.log(participant, "This is handleVideoConferenceJoined");
        // const data = await this.getParticipants();
    }

    handleVideoConferenceLeft = async (participant) => {
        console.log(participant, "This is handleVideoConferenceLeft");
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
            .then(() => {
                this.api.dispose();
            })
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
            .then(() => {
                this.api.dispose();
            })
        }
        else return null
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