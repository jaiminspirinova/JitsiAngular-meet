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
      sessionid: string;
      calldatetime: string;
      patientID: string;
      chatRoomID: string;
    }[];
  };
  strFilePath: null;
}

@Component({
  selector: 'app-doctor-screen',
  templateUrl: './doctor-screen.component.html',
  styleUrls: ['./doctor-screen.component.css']
})
export class DoctorScreenComponent implements OnInit {

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

  constructor(
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    this.fetchData();

    setInterval(() => {
      this.fetchData();
    }, 5000);

  }

  closeModal() {
    this.api.executeCommand('hangup')
    setTimeout(() => {
        this.showModal = false;
    }, 1000);
    this.stopCamera()
  }

  fetchData() {
    const apiUrl = `${this.baseURL}/api/JitsiAPI/GetPendingPatientList`;

    this.httpClient.get<ApiResponse>(apiUrl).subscribe((data) => {
      // console.log('GET Response:', data);
      if (data.response && data.response.table) {
        // this.responseTable = data.response.table;

        const currentTime = new Date();
        const tenMinutesAgo = new Date(currentTime.getTime() - 15 * 60000); // 10 minutes in milliseconds

        this.responseTable = data.response.table.filter((row) => {
          const callDateTime = new Date(row.calldatetime);
          return callDateTime >= tenMinutesAgo && callDateTime <= currentTime;
        });
      }
    }, (error) => {
      console.error('GET Error:', error);
    });
  }

  handleCall(chatRoomID: string, sessionID: string) { 
    this.chatRoomID = chatRoomID;
    this.sessionID = sessionID;

    this.showModal = true;
    this.handleIframe();

    this.options = {
      roomName: chatRoomID,
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
          displayName: "Test Doctor"
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
          // this.meetID = item?.jid;
          console.warn(rooms,"This is room item");
      })

      const data = [{RoomID: this.chatRoomID ,MeetingID: this.sessionID ,MeetingStartTime:new Date()}];
      // console.warn(data,"This is room item");
      // this.handleMeetStart(data);
  })
}

  handleVideoConferenceLeft = async (participant) => {
    // this.api.executeCommand('toggleTileView');
    // this.handleStartRecording();

    const data = [{RoomID: this.chatRoomID ,MeetingID: this.sessionID ,MeetingEndTime:new Date(new Date().getTime())}];
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
