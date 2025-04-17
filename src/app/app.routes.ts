import { Routes } from '@angular/router';
import { PatientComponent } from './components/patient/patient.component';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { LoginComponent } from './components/login/login.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ConsultationComponent } from './components/consultation/consultation.component';

export const routes: Routes = [
    {path:'',component:WelcomePageComponent},
    {path:'login',component:LoginComponent},
    {path:'admin',
        component:AdminLayoutComponent,
        children: [
            {path:'patients', component:PatientComponent},
            {path:'accueil', component: CalendarComponent},
            {path:'consultations/:patientId', component:ConsultationComponent  }
        ]
    },
    
    {path:'**',redirectTo:''}
];
//bech nzid par defaut admin ykoun f acceuil illi chtkoun fiha calender