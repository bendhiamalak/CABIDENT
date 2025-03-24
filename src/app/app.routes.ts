import { Routes } from '@angular/router';
import { PatientComponent } from './components/patient/patient.component';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';

export const routes: Routes = [
    {path:'',component:WelcomePageComponent},
    {path:'patients', component:PatientComponent}
];
