import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Router, ActivatedRoute  } from '@angular/router'; 
declare var JitsiMeetExternalAPI: any;
declare const Swal: any;

interface ApiResponse {
  status: number;
  message: string;
  response: {
    table: {
      sessionid: string;
      calldatetime: string;
      patientID: string;
      chatRoomID: string;
    }[];
  };
  strFilePath: null;
}

@Component({
  selector: 'app-test-doctor',
  templateUrl: './test-doctor.component.html',
  styleUrls: ['./test-doctor.component.css']
})
export class TestDoctorComponent implements OnInit {

  @ViewChild('localVideo') localVideo: ElementRef;

  private cameraStream: MediaStream | null = null;

  showModal: boolean = false;

  baseURL = "https://ec2-3-111-171-157.ap-south-1.compute.amazonaws.com";

  responseTable: ApiResponse['response']['table'] = [];

  domain: string = "meet.spirinova.dev"; //The domain value
  room: string = '';
  options: any;
  api: any;
  user: {
    name: "Test Doctor"
  };
  chatRoomID : any;
  sessionID : any;
  remainingTime: number = 10;
  private timeLeft: any;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.fetchData();

    setInterval(() => {
      this.fetchData();
      // this.responseTable.map((item) => {
      //   this.fetchCallStatus(item?.chatRoomID)
      // })
    }, 5000);

  }

  closeModal() {
    this.api.executeCommand('hangup')
    setTimeout(() => {
        this.showModal = false;
    }, 500);
    this.api.executeCommand('stopRecording','file');
    this.stopCamera()
  }

  getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
  }

  playAudio() {
    const audioElement = document.getElementById('ringingAudio') as HTMLAudioElement;
    audioElement.play();
  }

  stopAudio() {
    const audioElement = document.getElementById('ringingAudio') as HTMLAudioElement;
    audioElement.pause();
    audioElement.currentTime = 0; // Reset the audio to the beginning
  }

  decrementTime() {
    if (this.remainingTime > 0) {
      this.remainingTime -= 1;
      this.timeLeft = setTimeout(() => {
        this.decrementTime();
      }, 1000); // Update every 1 second (1000 milliseconds)
    } else {
      Swal.close();
      this.closeModal();
      this.stopAudio();
      this.handleEventLog("Call Delayed")
    }
  }

  fetchData() {
    // const prefix = this.route.snapshot.data.prefix || 'prod';
    const apiUrl = `${this.baseURL}/api/JitsiAPI/getActivePatientList`;

    this.httpClient.get<ApiResponse>(apiUrl).subscribe((data) => {
      // console.log('GET Response:', data);
      if (data.response && data.response.table) {
        // this.responseTable = data.response.table;

        const currentTime = new Date();
        const fifteenMinutesAgo = new Date(currentTime.getTime() - 15 * 60000); // 10 minutes in milliseconds

        this.responseTable = data.response.table.filter((row) => {
          const callDateTime = new Date(row.calldatetime);
          const isWithinTimeRange = callDateTime >= fifteenMinutesAgo && callDateTime <= currentTime;
          const hasProdInPatientID = row.patientID.includes("test"); // Check if "prod" is present in patientID

        return isWithinTimeRange && hasProdInPatientID;
        });
      }
    }, (error) => {
      console.error('GET Error:', error);
    });
  }

  fetchCallStatus(room) {
    const apiUrl = `${this.baseURL}/api/JitsiAPI/fetchMeetingEvents?ChatRoomID=${room}`;

    this.httpClient.get<ApiResponse>(apiUrl).subscribe((data) => {
      console.log('GET Response:', data);
    })
  }

  handleCall(chatRoomID: string, sessionID: string) { 
    this.chatRoomID = chatRoomID;
    this.sessionID = sessionID;

    // this.showModal = true;
    // this.handleIframe();
    this.handleEventLog("Call Initiated");
    this.decrementTime();

    Swal.fire({
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      icon: "info",
      title: "Ringing....",
      confirmButtonText: 'Ok'
  })
  
  this.playAudio();

    this.options = {
      roomName: chatRoomID,
      width: 900,
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
          displayName: "Test Doctor"
      },
  }

    this.api = new JitsiMeetExternalAPI(this.domain, this.options);

    this.api.addEventListeners({
      videoConferenceJoined: this.handleVideoConferenceJoined,
      videoConferenceLeft: this.handleVideoConferenceLeft,
      participantJoined: this.handleParticipantJoined,
      participantLeft: this.handleParticipantLeft,
      recordingStatusChanged: async (res) => {this.handleEventLog(`Recording Status ${res.on}`)},
      // log: this.handleError,
      readyToClose: async (res) => {this.handleEventLog("Close Meeting"); this.api.dispose();},
      cameraError: async (res) => {this.handleEventLog("Camera Permission Denied")},
      micError: async (res) => {this.handleEventLog("Mic Permission Denied")},
      audioAvailabilityChanged: async (res) => {this.handleEventLog("Audio Availability Toggle")},
      audioMuteStatusChanged: async (res) => {this.handleEventLog("Audio Mute Toggle")},
      browserSupport: async (res) => {this.handleEventLog(`Browser Supported ${res.supported}`)},
      tileViewChanged: async (res) => {this.handleEventLog("Tile View Toggle")},
      notificationTriggered: async (res) => {this.handleEventLog(`App Notification ${res.title}`)},
      videoAvailabilityChanged: async (res) => {this.handleEventLog("Video Availability Toggle")},
      videoMuteStatusChanged: async (res) => {this.handleEventLog("Video Mute Toggle")},
      suspendDetected: async (res) => {this.handleEventLog("Host Computer Suspended")},
      peerConnectionFailure: async (res) => {this.handleEventLog("P2p Connection Issue")},
      p2pStatusChanged: async (res) => {this.handleEventLog("P2p Connection Toggle")},
    });
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

  handleVideoConferenceJoined = async (participant) => {
    this.api.executeCommand('toggleTileView');
    // this.handleStartRecording();

    this.api.getRoomsInfo().then(rooms => {
      rooms?.rooms.map((item) => {
          console.warn(rooms,"This is room item");
          if(item.participants?.length === 2){
            Swal.close();
            this.showModal = true;
            this.stopAudio();
            clearTimeout(this.timeLeft)
          }
      })
  })
}

  handleVideoConferenceLeft = async (participant) => {
    this.api.executeCommand("stopRecording", "file")
    const data = [{RoomID: this.chatRoomID ,MeetingID: this.sessionID ,MeetingEndTime:new Date(new Date().getTime())}];
        // console.warn(data,"This is room item");
    // this.handleMeetEnd(data);
}

handleParticipantJoined = async (participant) => {
  this.handleEventLog("Participant Joined");
  Swal.close();
  this.showModal = true;
  this.stopAudio();
  clearTimeout(this.timeLeft)

  const currentDateTime = this.getCurrentDateTime();
  const data = [{RoomID: this.room ,MeetingID: this.sessionID ,MeetingStartTime: currentDateTime}];
  this.handleMeetStart(data);

  this.api.getRoomsInfo().then(rooms => {
    rooms?.rooms?.map((item) => {
      item.participants?.map((item) => {
        this.api.executeCommand("grantModerator", item.id)
        console.warn(item.id,"This is id")
      })
    })
  })
}


handleParticipantLeft = async (participant) => {
  this.handleEventLog("Participant Left");
  this.api.executeCommand("stopRecording", "file")
  this.closeModal();

  const currentDateTime = this.getCurrentDateTime();
  const data = [{RoomID: this.room ,MeetingID: this.sessionID ,MeetingEndTime: currentDateTime }];
  this.handleMeetEnd(data);
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

handleReadyToClose = async (res) => {
  this.api.dispose()
}

handleMeetStart(data){
  const apiUrl = `${this.baseURL}/api/JitsiAPI/markMeetingStart`;

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
  const apiUrl = `${this.baseURL}/api/JitsiAPI/markMeetingEnd`;

    this.httpClient.post(apiUrl, data).subscribe(
      (data) => {
        console.warn('POST Response:', data);
      },
      (error) => {
        console.error('POST Error:', error);
      }
    );
}

handleEventLog(event){
  const currentDateTime = this.getCurrentDateTime();
  const apiUrl = `${this.baseURL}/api/JitsiAPI/updateMeetingEvents`;
  const data = [{RoomID: this.room, EventID: event, EventTime: currentDateTime}]

    this.httpClient.post(apiUrl, data).subscribe(
      (data) => {
        console.warn('This is Event Log Response:', data);
      },
      (error) => {
        console.error('POST Error:', error);
      }
    );
}


}

