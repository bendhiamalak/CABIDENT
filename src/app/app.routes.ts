import { Routes } from '@angular/router';
import { PatientComponent } from './components/patient/patient.component';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { LoginComponent } from './components/login/login.component';


export const routes: Routes = [
    {path:'',component:WelcomePageComponent},
    {path:'patients', component:PatientComponent},
    {path:'login',component:LoginComponent}
];
