import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { map, Observable } from 'rxjs';
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

  getRendezVousDuJour(date: Date = new Date()): Observable<RendezVous[]> {
    // Calcul des bornes de date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    // Requête Firestore optimisée
    return this.firestoreService.getDocumentsByDateRange(
      this.collectionName,
      'date',
      startOfDay,
      endOfDay
    ).pipe(
      map(rdvs => rdvs.map(rdv => ({
        ...rdv,
        date: this.convertToDate(rdv.date) // Conversion unique
      }))),
      map(rdvs => rdvs.sort((a, b) => a.date.getTime() - b.date.getTime()))
    );
  }
  
  private convertToDate(dateValue: any): Date {
    if (dateValue instanceof Date) return dateValue;
    if (dateValue?.toDate) return dateValue.toDate(); // Firestore Timestamp
    if (typeof dateValue === 'string') return new Date(dateValue);
    return new Date(); // Fallback
  }
  
  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  
  updateRendezVous(id: string, data: Partial<RendezVous>) {
    return this.firestoreService.updateDocument(this.collectionName, id, data);
  }

  deleteRendezVous(id: string) {
    return this.firestoreService.deleteDocument(this.collectionName, id);
  }
}
