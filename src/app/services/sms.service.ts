// sms.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { FirestoreService } from './firestore.service';
import { SMS } from '../models/sms';

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private collectionName = 'sms';
  
  // Les API SMS gratuites ou abordables pour étudiants:
  // - FreeSMS API (fictif - à remplacer)
  // - TextLocal (offre gratuite limitée)
  // - Twilio (crédits gratuits pour commencer)
  private smsApiUrl = 'https://api.exemple-sms-gratuit.com/send';

  constructor(
    private http: HttpClient,
    private firestoreService: FirestoreService
  ) {}

  addSMS(sms: SMS) {
    return this.firestoreService.addDocument(this.collectionName, sms);
  }

  getSMSByRendezVousId(rendezVousId: string): Observable<SMS[]> {
    return this.firestoreService.getDocumentsWhere(
      this.collectionName, 
      'rendezVousId', 
      '==', 
      rendezVousId
    );
  }

  getSMSNonEnvoyes(): Observable<SMS[]> {
    return this.firestoreService.getDocumentsWhere(
      this.collectionName,
      'envoye',
      '==',
      false
    );
  }

  // Vous pourriez commencer par simuler l'envoi SMS pendant vos tests
  envoyerSMS(sms: SMS): Observable<any> {
    // OPTION 1: Simulation (pour développement/test)
    console.log(`SIMULATION: SMS envoyé à ${sms.telephone}: "${sms.message}"`);
    return of({ success: true, messageId: 'sim_' + Date.now() });
    
    // OPTION 2: API SMS réelle (décommentez quand vous êtes prêt)
    /*
    const payload = {
      to: sms.telephone,
      message: sms.message,
      // Autres paramètres spécifiques à l'API que vous utilisez
    };
    
    return this.http.post(this.smsApiUrl, payload).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'envoi du SMS:', error);
        return of({ success: false, error });
      })
    );
    */
  }

  marquerCommeEnvoye(id: string) {
    return this.firestoreService.updateDocument(this.collectionName, id, {
      envoye: true,
      dateEnvoi: new Date()
    });
  }
}