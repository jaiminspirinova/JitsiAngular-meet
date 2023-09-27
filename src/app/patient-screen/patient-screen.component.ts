import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Router } from '@angular/router';
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
  selector: 'app-patient-screen',
  templateUrl: './patient-screen.component.html',
  styleUrls: ['./patient-screen.component.css']
})
export class PatientScreenComponent implements OnInit {

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

  constructor(
    private router: Router,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    this.generateRandomUser();
  }

  closeModal() {
    this.api.executeCommand('hangup')
    setTimeout(() => {
        this.showModal = false;
    }, 1000);
    this.stopCamera()
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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

  handleCreateRoom() {
    const apiUrl = `${this.baseURL}/api/JitsiAPI/SaveChatRoomSessionDetails`;
    const data = [{CallDatetime: new Date(), PatientID: this.randomData.uid, DoctorID: this.randomData.docuid}]

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

  handleCall = () => {
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

    this.api = new JitsiMeetExternalAPI(this.domain, this.options);

    this.api.addEventListeners({
      videoConferenceJoined: this.handleVideoConferenceJoined,
      videoConferenceLeft: this.handleVideoConferenceLeft,
      log: this.handleError,
      readyToClose: this.handleReadyToClose,
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
          // this.roomID = item?.id;
          this.meetID = item?.jid;
          console.warn(rooms,"This is room item");
          console.warn(this.randomData.uid,"This is this.randomData.uid");
      })

      const data = [{RoomID: this.room ,MeetingID: this.meetID ,MeetingStartTime:new Date(),DoctorID: this.randomData.docuid, PatientID: this.randomData.uid}];
      // console.warn(data,"This is room item");
      // this.handleMeetStart(data);
  })
}

  handleVideoConferenceLeft = async (participant) => {
    // this.api.executeCommand('toggleTileView');
    // this.handleStartRecording();

    const data = [{RoomID: this.room ,MeetingID: this.meetID ,MeetingEndTime:new Date()}];
        // console.warn(data,"This is room item");
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

}
