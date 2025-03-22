import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query as firestoreQuery , getDocs ,doc,
  deleteDoc,
  updateDoc,
  getDoc} from '@angular/fire/firestore';
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


  updateDocument(collectionName: string, documentId: string, data: any) {
    const docRef = doc(this.firestore, collectionName, documentId);
    return updateDoc(docRef, data);
  }

  
  deleteDocument(collectionName: string, documentId: string) {
    const docRef = doc(this.firestore, collectionName, documentId);
    return deleteDoc(docRef);
  }
}
