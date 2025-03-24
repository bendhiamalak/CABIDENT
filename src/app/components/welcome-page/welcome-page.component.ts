import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RendezVous } from '../../models/rendez-vous';
import { RendezVousService } from '../../services/rendez-vous.service';
import { StatutRendezVous } from '../../models/rendez-vous';
@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.css'
})
export class WelcomePageComponent  implements OnInit {
  appointmentForm!: FormGroup;
  rendezVous!:RendezVous

  constructor(private fb: FormBuilder, private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      nom: ['', Validators.required ],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^([259347]{1}[0-9]{7})$/)]],// Validation téléphone FR
      email: ['', [Validators.required, Validators.email]],
      date: ['', [Validators.required, this.validateDate]],
      heure: ['', [Validators.required, this.validateHeure]],
      message: ['']
    });
  }

  // Validateur personnalisé pour la date (lundi à vendredi)
  validateDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
  
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Supprime l'heure pour comparer uniquement la date
  
    const dayOfWeek = selectedDate.getDay(); // 0 (dimanche) à 6 (samedi)
  
    if (selectedDate < today) {
      return { pastDate: true }; 
    }
  
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { invalidDay: true }; 
    }
  
    return null; 
  }


  validateHeure(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const selectedTime = control.value; // Format "HH:MM"
    const [hours, minutes] = selectedTime.split(':').map(Number);

    const isMorning = hours >= 8 && (hours < 11 || (hours === 11 && minutes <= 30));
    const isAfternoon = hours >= 14 && hours < 17;

    if (!isMorning && !isAfternoon) {
      return { invalidTime: true }; // Retourne une erreur si l'heure est invalide
    }
    return null; // Pas d'erreur
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formData = this.appointmentForm.value;
      const rendezVous: RendezVous = {
        patientId: '12345', 
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        email: formData.email,
        date: new Date(formData.date + 'T' + formData.heure), // Fusion de la date et de l'heure
        duree: 30, 
        motif: 'Consultation', 
        message: formData.message,
        statut: StatutRendezVous.EN_ATTENTE,
        rappelEnvoye: false,
        confirmationEnvoyee: false,
        dateCreation: new Date()
      };

      this.rendezVousService.addRendezVous(rendezVous)
        .then(() => {
          console.log(' Rendez-vous enregistré avec succès !');
          this.appointmentForm.reset();
        })
        .catch(error => console.error('Erreur lors de l’enregistrement :', error));
    } else {
      console.log('Formulaire invalide');
    }
  }
}
