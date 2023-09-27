import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DoctorScreenComponent } from './doctor-screen/doctor-screen.component';
import { HomeComponent } from './home/home.component';
import { JitsiComponent } from './jitsi/jitsi.component';
import { PatientScreenComponent } from './patient-screen/patient-screen.component';
import { ThankYouComponent } from './thank-you/thank-you.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'test',
        component: JitsiComponent
    },
    {
        path: 'thank-you',
        component: ThankYouComponent
    },
    {
        path: 'patient',
        component: PatientScreenComponent
    },
    {
        path: 'doctor',
        component: DoctorScreenComponent
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
