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
        component: PatientScreenComponent,
        data: { prefix: 'prod' }
    },
    {
        path: 'test-patient',
        component: PatientScreenComponent,
        data: { prefix: 'test' }
    },
    {
        path: 'doctor',
        component: DoctorScreenComponent,
        data: { prefix: 'prod' }
    },
    {
        path: 'test-doctor',
        component: DoctorScreenComponent,
        data: { prefix: 'test' }
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
