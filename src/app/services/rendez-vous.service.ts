import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Observable } from 'rxjs';
import { RendezVous } from '../models/rendez-vous';


@Injectable({
  providedIn: 'root'
})
export class RendezVousService {

  private collectionName = 'rendezVous';

  constructor(private firestoreService: FirestoreService) {}

  addRendezVous(rdv: RendezVous) {
    rdv.dateCreation = new Date();
    return this.firestoreService.addDocument(this.collectionName, rdv);
  }

  getRendezVous(): Observable<RendezVous[]> {
    return this.firestoreService.getDocuments(this.collectionName);
  }

  getRendezVousById(id: string): Observable<RendezVous | null> {
    return this.firestoreService.getDocument(this.collectionName, id);
  }

  updateRendezVous(id: string, data: Partial<RendezVous>) {
    return this.firestoreService.updateDocument(this.collectionName, id, data);
  }

  deleteRendezVous(id: string) {
    return this.firestoreService.deleteDocument(this.collectionName, id);
  }
}
