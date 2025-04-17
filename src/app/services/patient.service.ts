import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Patient } from '../models/patient';
import { Observable, from, of } from 'rxjs';
import { serverTimestamp } from '@angular/fire/firestore';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly collectionName = 'patients';

  constructor(private firestoreService: FirestoreService) {}

  // Récupère tous les patients
  getAllPatients(): Observable<Patient[]> {
    return this.firestoreService.getDocuments(this.collectionName).pipe(
      catchError(error => {
        console.error('Error fetching patients:', error);
        return of([]);
      })
    );
  }


  searchPatients(searchTerm: string): Observable<Patient[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return of([]);
    }

    const term = searchTerm.toLowerCase();
    
    return this.firestoreService.getDocuments(this.collectionName).pipe(
      map(patients => 
        patients.filter(patient => 
          patient.nom.toLowerCase().includes(term) ||
          patient.prenom.toLowerCase().includes(term) ||
          patient.telephone.includes(term)
      ),
      catchError(error => {
        console.error('Search error:', error);
        return of([]);
      })
    ))
  }

  // Recherche réactive pour l'autocomplétion
  reactiveSearch(search$: Observable<string>): Observable<Patient[]> {
    return search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.searchPatients(term))
    );
  }

  // Ajoute un nouveau patient
  addPatient(patient: Omit<Patient, 'id' | 'dateCreation'>): Observable<string> {
    const patientToAdd = {
      ...patient,
      dateCreation: serverTimestamp()
    };
    
    return from(this.firestoreService.addDocument(this.collectionName, patientToAdd)).pipe(
      map(ref => ref.id),
      catchError(error => {
        console.error('Error adding patient:', error);
        throw error;
      })
    );
  }

  // Récupère un patient par ID (version Observable)
  getPatient(id: string): Observable<Patient | null> {
    return this.firestoreService.getDocument(this.collectionName, id).pipe(
      catchError(error => {
        console.error(`Error fetching patient ${id}:`, error);
        return of(null);
      })
    );
  }

  // Alias pour getPatient (à supprimer si redondant)
  getPatientById(patientId: string): Observable<Patient | null> {
    return this.getPatient(patientId);
  }

  // Met à jour un patient existant
  updatePatient(patientId: string, patientData: Partial<Patient>): Observable<void> {
    return from(this.firestoreService.updateDocument(this.collectionName, patientId, patientData)).pipe(
      catchError(error => {
        console.error(`Error updating patient ${patientId}:`, error);
        throw error;
      })
    );
  }

  // Supprime un patient
  deletePatient(patientId: string): Observable<void> {
    return from(this.firestoreService.deleteDocument(this.collectionName, patientId)).pipe(
      catchError(error => {
        console.error(`Error deleting patient ${patientId}:`, error);
        throw error;
      })
    );
  }
}