import { Component, OnInit } from '@angular/core';
import { Patient } from '../../models/patient';
import { PatientService } from '../../services/patient.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
declare var $: any;
import { Router } from '@angular/router';
@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchTerm = '';
  isLoading = true;
  errorMessage = '';
  patientToDelete: string | null = null;

  isEditMode = false;
  currentPatientId: string | null = null;
  patientForm: FormGroup;

  constructor(private patientService: PatientService, private fb: FormBuilder,private router: Router) {
    this.patientForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^([259347]{1}[0-9]{7})$/)]],
      email: ['', Validators.email],
      dateNaissance: ['', Validators.required],
      adresse: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.patientService.getAllPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.filteredPatients = [...patients];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des patients:', error);
        this.errorMessage = 'Impossible de charger la liste des patients';
        this.isLoading = false;
      }
    });
  }

  filterPatients(): void {
    if (!this.searchTerm) {
      this.filteredPatients = [...this.patients];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(patient =>
      (patient.nom?.toLowerCase().includes(term) || '') ||
      (patient.prenom?.toLowerCase().includes(term) || '') ||
      (patient.telephone?.includes(term) || '')
    );
  }

  

  editPatient(patient: Patient): void {
    this.isEditMode = true;
    this.currentPatientId = patient.id || null;
    this.patientForm.patchValue({
      nom: patient.nom,
      prenom: patient.prenom,
      telephone: patient.telephone,
      email: patient.email || '',
      dateNaissance: patient.dateNaissance || '',
      adresse: patient.adresse || '',
      notes: patient.notes || ''
    });
    $('#patientModal').modal('show');
  }

  confirmDelete(patientId: string): void {
    this.patientToDelete = patientId;
    $('#confirmDeleteModal').modal('show');
  }

  deletePatient(): void {
    if (!this.patientToDelete) return;

    this.patientService.deletePatient(this.patientToDelete).subscribe({
      next: () => {
        $('#confirmDeleteModal').modal('hide');
        this.loadPatients();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.errorMessage = 'Erreur lors de la suppression du patient';
        $('#confirmDeleteModal').modal('hide');
      }
    });
  }

  openAddPatientModal(): void {
    this.isEditMode = false;
    this.currentPatientId = null;
    this.patientForm.reset();
    $('#patientModal').modal('show');
  }
  
  addPatient(): void {
    if (this.patientForm.invalid) return;

    const newPatient: Omit<Patient, 'id' | 'dateCreation'> = {
      ...this.patientForm.value
    };

    this.patientService.addPatient(newPatient).subscribe({
      next: (id) => {
        $('#patientModal').modal('hide');
        this.loadPatients();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout:', error);
        this.errorMessage = 'Erreur lors de l\'ajout du patient';
      }
    });
  }

  updatePatient(): void {
    if (this.patientForm.invalid || !this.currentPatientId) return;

    const updatedPatient: Partial<Patient> = {
      ...this.patientForm.value
    };

    this.patientService.updatePatient(this.currentPatientId, updatedPatient).subscribe({
      next: () => {
        $('#patientModal').modal('hide');
        this.loadPatients();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.errorMessage = 'Erreur lors de la mise à jour du patient';
      }
    });
  }

  resetForm(): void {
    this.patientForm.reset();
    this.currentPatientId = null;
    this.isEditMode = false;
  }

  saveOrUpdatePatient(): void {
    if (this.isEditMode) {
      this.updatePatient();
    } else {
      this.addPatient();
    }
  }

  navigateToConsultation(patientId: string): void {
    if (!patientId) {
      console.error('No patient ID provided');
      return;
    }
    this.router.navigate(['/admin/consultations', patientId]);
  }
}