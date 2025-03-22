import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Patient } from '../models/patient';
import { Observable } from 'rxjs';
import { Timestamp, serverTimestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private readonly collectionName = 'patients';

  constructor(private firestoreService: FirestoreService) {}

  getAllPatients(): Observable<Patient[]> {
    return this.firestoreService.getDocuments(this.collectionName);
  }

  getPatient(id: string): Observable<Patient> {
    return this.firestoreService.getDocument(this.collectionName, id);
  }

  addPatient(patient: Patient): Promise<any> {
    return this.firestoreService.addDocument(this.collectionName, patient);
  }

  /*addPatient(patient: Omit<Patient, 'dateCreation'>) {
    const patientToAdd = {
      ...patient,
      dateCreation: serverTimestamp()
    };
    
    return this.firestoreService.addDocument(this.collectionName, patientToAdd);
  }*/

  getPatientById(patientId: string): Observable<Patient | null> {
    return this.firestoreService.getDocument(this.collectionName, patientId);
  }

  
  updatePatient(patientId: string, patientData: Partial<Patient>): Promise<void> {
    return this.firestoreService.updateDocument(this.collectionName, patientId, patientData);
  }

  
  deletePatient(patientId: string): Promise<void> {
    return this.firestoreService.deleteDocument(this.collectionName, patientId);
  }
}
