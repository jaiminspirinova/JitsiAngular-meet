import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Router, ActivatedRoute  } from '@angular/router';
import { async } from 'rxjs/internal/scheduler/async';
declare var JitsiMeetExternalAPI: any;
declare const Swal: any;

interface ApiResponse {
  status: number;
  message: string;
  response: {
    table: {
      sessionID: string;
      patientID: string;
      chatRoomID: string;
      callDateTime: string;
      callStatus: number;
      doctorid: string;
    }[];
  };
  strFilePath: null;
}

@Component({
  selector: 'app-test-patient',
  templateUrl: './test-patient.component.html',
  styleUrls: ['./test-patient.component.css']
})
export class TestPatientComponent implements OnInit {

  @ViewChild('localVideo') localVideo: ElementRef;

  private cameraStream: MediaStream | null = null;

  showModal: boolean = false;

  baseURL = "https://ec2-3-111-171-157.ap-south-1.compute.amazonaws.com";

  randomData: { uid: string; docuid: string; name: string; docname: string } | null = null;

  domain: string = "meet.spirinova.dev"; //The domain value
  room: string = '';
  options: any;
  api: any;
  user: any;
  roomID : any;
  meetID : any;

  remainingTime: number = 10;

  private timeLeft: any;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.generateRandomUser();
  }

  closeModal() {
    this.api.executeCommand('hangup')
    setTimeout(() => {
        this.showModal = false;
    }, 500);
  }

  generateRandomMeetingRoomName() {
    // Generate three random segments with the specified format
    const segment1 = this.generateRandomSegment(3);
    const segment2 = this.generateRandomSegment(4);
    const segment3 = this.generateRandomSegment(3);

    this.room = `${segment1}-${segment2}-${segment3}`;
  }

  private generateRandomSegment(length: number): string {
    const randomChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => randomChars[Math.floor(Math.random() * randomChars.length)]).join('');
  }

  generateRandomUser() {
    const uid = this.generateUID();
    const docuid = this.generateUID();
    
    const name = this.generateRandomName();
    const docname = this.generateDoctorName();
    
    this.randomData = { uid, name, docuid, docname };

    this.user = {
      name: name
    };

    // this.generateRandomMeetingRoomName();
  }

  generateUID(): string {
    // Generate a UUID (you can use a library for more robust generation)
    // const prefix = this.route.snapshot.data.prefix || 'prod';
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return `test-${uuid}`;
  }

  generateRandomName(): string {
    // Replace this with logic to generate random names
    const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Felicia Quick', 'Shakira Daley', 'Corina Doll', 'Markell Austin', 'Richard Peterson', 'Derrick Harper', 'Alessandra Westmoreland', 'Micheal Figueroa', 'Blayne Vo', 'Corbin Patel'];
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
  }

  generateDoctorName(): string {
    // Replace this with logic to generate random names
    const names = [ 'Dr. Diana', 'Dr. Ansley', 'Dr. Amaiya', 'Dr. Skylar', 'Dr. Arman', 'Dr. Maia', 'Dr. Presley', 'Dr. Heaven', 'Dr. Gwendolyn', 'Dr. Marshall', 'Dr. Hezekiah', 'Dr. Brannon', 'Dr. Odalys', 'Dr. Iyanna', 'Dr. Darrell', 'Dr. Natali', 'Dr. Malia', 'Dr. Destin', 'Dr. Guillermo', 'Dr. Stone' ];
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
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
      // this.handleEventLog("Call Delayed")
      this.handleMeetDelayed();
    }
  }

  handleNewMeet() {
    if(this.room) this.handleCall()
    else {this.handleCreateRoom(); this.decrementTime();}
  }

    handleCreateRoom() {
    const currentDateTime = this.getCurrentDateTime();
    const apiUrl = `${this.baseURL}/api/JitsiAPI/initMeetingSession`;
    const data = [{PatientID: this.randomData.uid, DoctorID: this.randomData.docuid}]

    this.httpClient.post<ApiResponse>(apiUrl, data).subscribe(
      (data) => {
        console.warn('POST Response:', data);
        this.room = data.response.table[0].chatRoomID;
        this.meetID = data.response.table[0].sessionID;

        this.handleCall();
      },
      (error) => {
        console.error('POST Error:', error);
      }
    );

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

  handleCall = () => {

    // this.handleEventLog("Call Initiated")
    this.handleMeetInitiated();

    Swal.fire({
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      icon: "info",
      title: "Ringing....",
      confirmButtonText: 'Ok'
  })
  
  this.playAudio();

    // this.showModal = true;

    // this.handleIframe();
    // this.remainingTime = 10;

    this.options = {
      roomName: this.room,
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
          displayName: this.user.name
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

  handleVideoConferenceJoined = async (participant) => {
    this.handleEventLog("User Joined");
    this.api.executeCommand('toggleTileView');
    // this.decrementTime();
    // this.handleStartRecording();

    this.api.getRoomsInfo().then(rooms => {
      rooms?.rooms.map((item) => {
          this.meetID = item?.jid;
          console.warn(rooms,"This is room item");
          if(item.participants?.length === 2){
            Swal.close();
            this.showModal = true;
            this.stopAudio();
            clearTimeout(this.timeLeft)
          }
      })
      // console.warn(data,"This is room item");
      // this.handleMeetStart(data);
  })
}

handleVideoConferenceLeft = async (participant) => {
  const currentDateTime = this.getCurrentDateTime();
  this.handleEventLog("User Left");
  this.api.executeCommand("stopRecording", "file")
}

handleParticipantJoined = async (participant) => {
  this.handleEventLog("Participant Joined");
  Swal.close();
  this.showModal = true;
  this.stopAudio();
  clearTimeout(this.timeLeft)

  const currentDateTime = this.getCurrentDateTime();
  const data = [{RoomID: this.room ,MeetingID: this.meetID ,DoctorID: this.randomData.docuid, PatientID: this.randomData.uid}];
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
  const data = [{RoomID: this.room ,MeetingID: this.meetID }];
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

handleCallEvent = async (res, event) => {
  console.warn(res,event ,"THis is handle call event");
  // this.handleEventLog("Audio Mute Toggle")
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

handleMeetInitiated(){
  const currentDateTime = this.getCurrentDateTime();
  const apiUrl = `${this.baseURL}/api/JitsiAPI/markMeetinginitiated`;
  const data = [{RoomID: this.room}]
    this.httpClient.post(apiUrl, data).subscribe(
      (data) => {
        console.warn('POST Response:', data);
      },
      (error) => {
        console.error('POST Error:', error);
      }
    );
}

handleMeetDelayed(){
  const currentDateTime = this.getCurrentDateTime();
  const apiUrl = `${this.baseURL}/api/JitsiAPI/markMeetingdelayed`;
  const data = [{RoomID: this.room}]
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
  const data = [{RoomID: this.room, EventID: event }]

    this.httpClient.post(apiUrl, data).subscribe(
      (data) => {
        console.warn('This is Event Log Response:', data);
      },
      (error) => {
        console.error('POST Error:', error);
      }
    );
}

handleStartRecording = () => {
  this.api.executeCommand("startRecording", {
      mode: "file",
      onlySelf: false,
  })
}

getRoomInfo = () => {
  this.api.getRoomsInfo().then((room) => {
    console.log(room,"This is room info")
  })
}

}

