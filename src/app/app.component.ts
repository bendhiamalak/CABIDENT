import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirestoreService } from './services/firestore.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule , RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  documents: any[] = [];

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {}

  /*
  addDocument() {
    const data = { name: 'Test', timestamp: new Date() };
    this.firestoreService.addDocument('testCollection', data)
      .then(() => console.log('Document ajouté'))
      .catch((error) => console.error('Erreur :', error));
  }

  
  getDocuments() {
    this.firestoreService.getDocuments('testCollection').subscribe((docs) => {
      this.documents = docs;
    });
  }

  updateDocument(documentId: string) {
    const updatedData = { name: 'Test modifié', updatedAt: new Date() };
    this.firestoreService.updateDocument('testCollection', documentId, updatedData)
      .then(() => console.log('Document mis à jour'))
      .catch((error) => console.error('Erreur :', error));
  }

  deleteDocument(documentId: string) {
    this.firestoreService.deleteDocument('testCollection', documentId)
      .then(() => console.log('Document supprimé'))
      .catch((error) => console.error('Erreur :', error));
  }*/
}