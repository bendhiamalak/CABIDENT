import { Injectable } from '@angular/core';
import {
  Firestore, collection, addDoc, query as firestoreQuery, getDocs, doc,
  deleteDoc,
  updateDoc,
  getDoc, where
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) {}

  addDocument(collectionName: string, data: any) {
    const colRef = collection(this.firestore, collectionName);
    return addDoc(colRef, data);
  }
  
  
  getDocuments(collectionName: string): Observable<any[]> {
    const colRef = collection(this.firestore, collectionName);
    const q = firestoreQuery(colRef);
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
      })
    );
  }

  getDocument(collectionName: string, documentId: string): Observable<any> {
    const docRef = doc(this.firestore, collectionName, documentId);
    
    return from(getDoc(docRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return { id: docSnapshot.id, ...docSnapshot.data() };
        } else {
          return null;
        }
      })
    );
  }

  getDocumentsByDateRange(
    collectionName: string, 
    dateField: string,
    startDate: Date,
    endDate: Date
  ): Observable<any[]> {
    const colRef = collection(this.firestore, collectionName);
    const q = firestoreQuery(
      colRef,
      where(dateField, '>=', startDate),
      where(dateField, '<=', endDate)
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })))
    );
  }

  
  updateDocument(collectionName: string, documentId: string, data: any) {
    const docRef = doc(this.firestore, collectionName, documentId);
    return updateDoc(docRef, data);
  }

  
  deleteDocument(collectionName: string, documentId: string) {
    const docRef = doc(this.firestore, collectionName, documentId);
    return deleteDoc(docRef);
  }

  // Ajoutez cette méthode à votre FirestoreService
getDocumentsWhere(
  collectionName: string,
  field: string,
  operator: any,
  value: any
): Observable<any[]> {
  const colRef = collection(this.firestore, collectionName);
  const q = firestoreQuery(
    colRef,
    where(field, operator, value)
  );
  
  return from(getDocs(q)).pipe(
    map(snapshot => snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })))
  );
}

// Méthode pour utiliser setDocument avec un ID spécifique
setDocument(collectionName: string, documentId: string, data: any) {
  const docRef = doc(this.firestore, collectionName, documentId);
  return updateDoc(docRef, data).catch(error => {
    // Si le document n'existe pas, le créer
    if (error.code === 'not-found') {
      return addDoc(collection(this.firestore, collectionName), { 
        ...data, 
        id: documentId 
      });
    }
    throw error;
  });
}
}
