import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { catchError, from, map, Observable, tap } from 'rxjs';
import { Consultation } from '../models/consultation';
import { serverTimestamp } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private readonly collectionName = 'consultations';
  
  constructor(private firestoreService: FirestoreService) {}

  getConsultationByPatientId( patientId:string){
    return this.firestoreService.getDocumentsWhere(
      this.collectionName,
      'patientId',
      '==',
      patientId)
  }

  getConsultationById(id: string): Observable<Consultation | null> {
    return this.firestoreService.getDocument(this.collectionName, id);
  }
  
  addConsultation(consultation: Omit<Consultation, 'id' | 'dateCreation'>): Observable<string> {
    const consultationToAdd = {
      ...consultation,
      date: serverTimestamp(), 
      dateCreation: serverTimestamp()
    };
    
    return from(this.firestoreService.addDocument(this.collectionName, consultationToAdd)).pipe(
      map(ref => ref.id), 
      catchError(error => {
        console.error('Error adding consultation:', error);
        throw error; 
      })
    );
  }
  
  
updateConsultation(id: string, data: Partial<Consultation>): Observable<void> {
  console.log(`Tentative de mise à jour consultation ${id}`, data);
  
  return from(this.firestoreService.updateDocument(this.collectionName, id, data)).pipe(
    tap(() => console.log(`Consultation ${id} mise à jour avec succès`)),
    catchError(error => {
      console.error(`Échec mise à jour consultation ${id}:`, error);
      throw new Error('Échec de la mise à jour: ' + error.message);
    })
  );
}

deleteConsultation(id: string): Observable<void> {
  console.log(`Tentative de suppression consultation ${id}`);
  
  return from(this.firestoreService.deleteDocument(this.collectionName, id)).pipe(
    tap(() => console.log(`Consultation ${id} supprimée avec succès`)),
    catchError(error => {
      console.error(`Échec suppression consultation ${id}:`, error);
      throw new Error('Échec de la suppression: ' + error.message);
    })
  );
}

}
