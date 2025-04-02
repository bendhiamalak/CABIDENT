import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';

const firebaseConfig = {
  apiKey: "AIzaSyCYTJszIAyZQLDeTdvZC8Oq1J5nJvwka1I",
  authDomain: "cabident-ef1fc.firebaseapp.com",
  projectId: "cabident-ef1fc",
  storageBucket: "cabident-ef1fc.firebasestorage.app",
  messagingSenderId: "598968919761",
  appId: "1:598968919761:web:4d6630665371ad51b887f0",
  measurementId: "G-T9WLDM60X6"
};

export const appConfig: ApplicationConfig = {
  providers: [ provideRouter(routes), 
    provideFirebaseApp(()=>initializeApp(firebaseConfig)),
    provideFirestore(()=>getFirestore()),
    provideAnimations(),
    importProvidersFrom(FullCalendarModule),
    
  ]
};
