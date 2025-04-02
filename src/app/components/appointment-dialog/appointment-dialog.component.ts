import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Patient } from '../../models/patient';
import { RendezVous, StatutRendezVous } from '../../models/rendez-vous';
import { RendezVousService } from '../../services/rendez-vous.service';
import { PatientService } from '../../services/patient.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CalendarService } from '../../services/calendar.service';

declare var $: any;

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [DatePipe],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.css']
})
export class AppointmentDialogComponent implements OnInit {
  @ViewChild('appointmentModal') modal!: ElementRef;

  appointmentForm: FormGroup;
  filteredPatients: Patient[] = [];
  showPatientForm = false;
  isPatientFound = false;
  isSubmitting = false;
  
  selectedDate: Date = new Date();
  patient: Patient | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private rdvService: RendezVousService,
    private calendarService: CalendarService,
    private datePipe: DatePipe
  ) {
    this.appointmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupPatientSearch();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      date: [this.formatDate(this.selectedDate), Validators.required],
      heure: [this.formatTime(this.selectedDate), Validators.required],
      patientSearch: [''],
      patientId: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^([259347]{1}[0-9]{7})$/)]],
      email: ['', Validators.email],
      duree: [30, [Validators.required, Validators.min(15), Validators.max(120)]],
      notes: ['']
    });
  }

  private setupPatientSearch(): void {
    this.appointmentForm.get('patientSearch')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term && term.length > 2) {
          return this.patientService.searchPatients(term).pipe(
            catchError(() => of([]))
          );
        }
        return of([]);
      })
    ).subscribe(patients => {
      this.filteredPatients = patients;
    });
  }

  searchPatients(): void {
    const searchTerm = this.appointmentForm.get('patientSearch')?.value;
    if (searchTerm && searchTerm.length > 2) {
      this.patientService.searchPatients(searchTerm).subscribe({
        next: (patients) => {
          this.filteredPatients = patients;
        },
        error: () => {
          this.filteredPatients = [];
        }
      });
    } else {
      this.filteredPatients = [];
    }
  }

  private formatDate(date: Date): string {
    return this.datePipe.transform(date, 'EEEE d MMMM yyyy', 'fr-FR') || '';
  }
  
  private formatTime(date: Date): string {
    return this.datePipe.transform(date, 'HH:mm', 'fr-FR') || '';
  }

  openModal(date: Date, patient: Patient | null = null): void {
    this.selectedDate = date;
    this.patient = patient;
    this.resetForm();
    $('#appointmentModal').modal('show');
  }

  closeModal(): void {
    $('#appointmentModal').modal('hide');
  }

  private resetForm(): void {
    this.appointmentForm = this.createForm();
    this.showPatientForm = false;
    this.isPatientFound = false;
    this.filteredPatients = [];
    
    if (this.patient) {
      this.prepopulatePatient(this.patient);
      this.isPatientFound = true;
    }
  }

  selectPatient(patient: Patient): void {
    this.patient = patient;
    this.prepopulatePatient(patient);
    this.isPatientFound = true;
    this.showPatientForm = false;
    this.appointmentForm.get('patientSearch')?.setValue(`${patient.prenom} ${patient.nom}`);
    this.filteredPatients = [];
  }

  private prepopulatePatient(patient: Patient): void {
    this.appointmentForm.patchValue({
      patientId: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      telephone: patient.telephone,
      email: patient.email || ''
    });
  }

  togglePatientForm(): void {
    this.showPatientForm = !this.showPatientForm;
    this.isPatientFound = false;
    this.filteredPatients = [];
    
    const patientSearchControl = this.appointmentForm.get('patientSearch');
    if (patientSearchControl) {
      this.showPatientForm ? patientSearchControl.disable() : patientSearchControl.enable();
    }

    if (this.showPatientForm) {
      this.appointmentForm.patchValue({
        patientId: 'new',
        nom: '',
        prenom: '',
        telephone: '',
        email: ''
      });
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched(this.appointmentForm);
      return;
    }
  
    this.isSubmitting = true;
    const formValue = this.appointmentForm.value;

    try {
      const [hours, minutes] = formValue.heure.split(':');
      const appointmentDate = new Date(this.selectedDate);
      appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      // Si c'est un nouveau patient, il faut d'abord le créer
      if (formValue.patientId === 'new') {
        const newPatient: Omit<Patient, 'id' | 'dateCreation'> = {
          nom: formValue.nom,
          prenom: formValue.prenom,
          telephone: formValue.telephone,
          email: formValue.email || undefined
        };

        this.patientService.addPatient(newPatient).subscribe({
          next: (patientId) => {
            this.createAppointment(appointmentDate, formValue, patientId);
          },
          error: (error) => {
            console.error('Erreur lors de la création du patient:', error);
            this.isSubmitting = false;
          }
        });
      } else {
        this.createAppointment(appointmentDate, formValue, formValue.patientId);
      }
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      this.isSubmitting = false;
    }
  }

  private createAppointment(appointmentDate: Date, formValue: any, patientId: string): void {
    const newRdv: RendezVous = {
      patientId: patientId,
      nom: formValue.nom,
      prenom: formValue.prenom,
      telephone: formValue.telephone,
      email: formValue.email || '',
      date: appointmentDate,
      duree: formValue.duree,
      message: formValue.notes || '',
      statut: StatutRendezVous.EN_ATTENTE,
      rappelEnvoye: false,
      confirmationEnvoyee: false
    };

    this.rdvService.addRendezVous(newRdv).then(() => {
      this.closeModal();
      this.calendarService.triggerRefreshCalendar();
      this.isSubmitting = false;
      console.log("rendezVous added successfully !")
    }).catch((error) => {
      console.error('Erreur lors de la création du rendez-vous:', error);
      this.isSubmitting = false;
    });
    
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}