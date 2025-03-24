import { Component, OnInit } from '@angular/core';
import { Patient } from '../../models/patient';
import { PatientService } from '../../services/patient.service';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [ FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent implements OnInit{
  patients: Patient[] = []; 
  newPatient: Patient = { 
    nom: '',
    prenom: '',
    telephone: '',
    dateCreation: new Date()
  };
  selectedPatient: Patient | null = null; 

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients(); 
  }


  loadPatients(): void {
    this.patientService.getAllPatients().subscribe(patients => {
      this.patients = patients;
    });
  }


  addPatient(): void {
    if (this.newPatient.nom && this.newPatient.prenom && this.newPatient.telephone) {
      this.patientService.addPatient(this.newPatient).then(() => {
        console.log('Patient ajouté avec succès !');
        this.newPatient = { nom: '', prenom: '', telephone: '', dateCreation: new Date() }; // Réinitialiser le formulaire
        this.loadPatients(); 
      });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

  
  selectPatient(patient: Patient): void {
    this.selectedPatient = { ...patient }; 
  }

  
  updatePatient(): void {
    if (this.selectedPatient && this.selectedPatient.id) {
      this.patientService.updatePatient(this.selectedPatient.id, this.selectedPatient).then(() => {
        console.log('Patient mis à jour avec succès !');
        this.selectedPatient = null; 
        this.loadPatients(); 
      });
    }
  }

  
  deletePatient(patientId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      this.patientService.deletePatient(patientId).then(() => {
        console.log('Patient supprimé avec succès !');
        this.loadPatients(); 
      });
    }
  }
}
