import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JitsiComponent } from './jitsi/jitsi.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PatientScreenComponent } from './patient-screen/patient-screen.component';
import { DoctorScreenComponent } from './doctor-screen/doctor-screen.component';
import { HomeComponent } from './home/home.component';
import { TestPatientComponent } from './test-patient/test-patient.component';
import { TestDoctorComponent } from './test-doctor/test-doctor.component';

@NgModule({
  declarations: [
    AppComponent,
    JitsiComponent,
    ThankYouComponent,
    PatientScreenComponent,
    DoctorScreenComponent,
    HomeComponent,
    TestPatientComponent,
    TestDoctorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
