import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
declare var JitsiMeetExternalAPI: any;

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
            configOverwrite: { prejoinPageEnabled: false, toolbarButtons: ['hangup', 'microphone', 'camera', 'invite', "recording"], 
            constraints: {
                video: {
                    height: {
                        ideal: 320,
                        max: 320,
                        min: 240
                    }
                }
            }},
            interfaceConfigOverwrite: {
                DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
                SHOW_BRAND_WATERMARK: false,
            },
            parentNode: document.querySelector('#jitsi-iframe'),
            userInfo: {
                displayName: this.user.name
            }
        }

        this.api = new JitsiMeetExternalAPI(this.domain, this.options); //API

        this.api.addEventListeners({
            readyToClose: this.handleClose,
            participantLeft: this.handleParticipantLeft,
            participantJoined: this.handleParticipantJoined,
            videoConferenceJoined: this.handleVideoConferenceJoined,
            videoConferenceLeft: this.handleVideoConferenceLeft,
            audioMuteStatusChanged: this.handleMuteStatus,
            videoMuteStatusChanged: this.handleVideoStatus,
            trackError: this.handleError
        });

    }


    handleClose = () => {
        console.log("handleClose");
    }

    handleError = async (error) => {
        console.log("This is are the errors", error, "ereor erroer erroe r oreor "); // { id: "2baa184e" }
    }

    handleParticipantLeft = async (participant) => {
        console.log("handleParticipantLeft", participant); // { id: "2baa184e" }
        const data = await this.getParticipants();
    }

    handleParticipantJoined = async (participant) => {
        console.log("handleParticipantJoined", participant); // { id: "2baa184e", displayName: "Shanu Verma", formattedDisplayName: "Shanu Verma" }
        const data = await this.getParticipants();
    }

    handleVideoConferenceJoined = async (participant) => {
        this.handleStartRecording();
        console.log("handleVideoConferenceJoined", participant); // { roomName: "bwb-bfqi-vmh", id: "8c35a951", displayName: "Akash Verma", formattedDisplayName: "Akash Verma (me)"}
        const data = await this.getParticipants();
        console.log(data,"This is data")
    }

    handleVideoConferenceLeft = () => {
        console.log("handleVideoConferenceLeft");
        this.router.navigate(['/thank-you']);
    }

    handleMuteStatus = (audio) => {
        console.log("handleMuteStatus", audio); // { muted: true }
    }

    handleVideoStatus = (video) => {
        console.log("handleVideoStatus", video); // { muted: true }
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