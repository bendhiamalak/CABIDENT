import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../models/patient';
import { Consultation } from '../../models/consultation';
import { PatientService } from '../../services/patient.service';
import { ConsultationService } from '../../services/consultation.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  providers: [DatePipe],
  templateUrl: './consultation.component.html',
  styleUrl: './consultation.component.css'
})
export class ConsultationComponent implements OnInit{
  patientId!: string;
  patient:Patient |null=null
  consultation!:Consultation
  listConsultation!:Consultation[]
  newConsultationNotes = '';
  selectedConsultation: Consultation | null = null;
  isEditing = false;
  date = new Date();
  
  constructor(private route: ActivatedRoute,private patientService: PatientService,private consultationService:ConsultationService,private datePipe: DatePipe) {}
  
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['patientId'];
      if (this.patientId) {
        this.loadPatient();
        this.loadConsultations();
      } else {
        console.error('No patient ID in route');
       
      }
    });
  }
  
  private loadPatient(): void {
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (patient) => {
        if (patient) {
          this.patient = patient;
        } else {
          console.warn('Patient non trouvé avec ID:', this.patientId);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du patient:', err);
      }
    });
  }

  private loadConsultations(): void {
    this.consultationService.getConsultationByPatientId(this.patientId).subscribe({
      next: (consultations) => this.listConsultation = consultations,
      error: (err) => console.error('Erreur chargement consultations:', err)
    });
  }

  editConsultation(consultation: Consultation): void {
    this.selectedConsultation = { ...consultation }; // Crée une copie
    this.isEditing = true;
  }
  
  addConsultation(): void {
    if (!this.newConsultationNotes.trim()) return;
  
    // Prépare les données sans id et dateCreation
    const consultationData: Omit<Consultation, 'id' | 'dateCreation'> = {
      patientId: this.patientId,
      rendezVousId: '', // À remplacer par la logique appropriée
      notes: this.newConsultationNotes,
      date: new Date() // Sera écrasé par serverTimestamp()
    };
  
    this.consultationService.addConsultation(consultationData).subscribe({
      next: (newId) => {
        console.log('Consultation ajoutée avec ID:', newId);
        this.newConsultationNotes = '';
        this.loadConsultations();
      },
      error: (err) => {
        console.error('Erreur:', err);
        // Gestion d'erreur UI
      }
    });
  }
  
  viewConsultation(consultation: Consultation): void {
    this.selectedConsultation = consultation;
    this.isEditing = false;
  }

  updateConsultation(): void {
    if (!this.selectedConsultation?.id) return;

    this.consultationService.updateConsultation(
      this.selectedConsultation.id,
      { notes: this.selectedConsultation.notes }
    ).subscribe({
      next: () => {
        this.loadConsultations();
        this.cancelEdit();
      },
      error: (err) => console.error('Erreur mise à jour consultation:', err)
    });
  }

  isProcessing = false;

deleteConsultation(id: string): void {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
    this.isProcessing = true;
    this.consultationService.deleteConsultation(id).subscribe({
      next: () => {
        this.loadConsultations();
        this.isProcessing = false;
      },
      error: (err) => {
        console.error('Erreur suppression consultation:', err);
        this.isProcessing = false;
      }
    });
  }
}

  cancelEdit(): void {
    this.selectedConsultation = null;
    this.isEditing = false;
  }

  formatDate(date: any): string {
    // Gestion des dates Firebase (Timestamp ou string)
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy HH:mm') || '';
  }
  goBack(): void {
    window.history.back();
    // Or use this.router.navigate(['/calendar']) if you want specific navigation
  }
}
