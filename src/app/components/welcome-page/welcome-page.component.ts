import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RendezVous } from '../../models/rendez-vous';
import { RendezVousService } from '../../services/rendez-vous.service';
import { StatutRendezVous } from '../../models/rendez-vous';
import { Router } from '@angular/router';
@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.css'
})
export class WelcomePageComponent  implements OnInit {
  showSuccessModal: boolean = false;
successMessage: string = '';
private modalTimeout: any;
  appointmentForm!: FormGroup;
  rendezVous!:RendezVous
  rendezVousList!:RendezVous[]
  creneauxDisponibles: string[] = [];
  selectedViewDate!:Date
  constructor(private fb: FormBuilder, private rendezVousService: RendezVousService , private router: Router) { }

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      nom: ['', Validators.required ],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^([259347]{1}[0-9]{7})$/)]],// Validation téléphone FR
      email: ['', [ Validators.email]],
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

  // Ajoutez cette méthode pour charger les créneaux disponibles
chargerCreneauxDisponibles(date: Date): void {
  console.log('Chargement des créneaux pour:', date);
  this.selectedViewDate = date;
  
  this.rendezVousService.getRendezVousDuJour(date).subscribe({
    next: (rdvs) => {
      console.log('RDV trouvés:', rdvs);
      this.rendezVousList = rdvs;
      this.genererCreneauxDisponibles(date, rdvs);
    },
    error: (err) => {
      console.error('Erreur:', err);
      this.rendezVousList = [];
      this.creneauxDisponibles = [];
    }
  });
}

// Méthode pour générer les créneaux disponibles
genererCreneauxDisponibles(date: Date, rdvs: RendezVous[]): void {
  // Heures d'ouverture (à adapter selon vos besoins)
  const heuresDebutMatin = 8;
  const heuresFinMatin = 11;
  const heuresDebutApresMidi = 14;
  const heuresFinApresMidi = 17;
  const dureeCreneau = 30; // en minutes

  // Récupérer tous les créneaux occupés
  const creneauxOccupes = rdvs.map(rdv => {
    const rdvDate = new Date(rdv.date);
    return rdvDate.getHours() + ':' + (rdvDate.getMinutes() < 10 ? '0' : '') + rdvDate.getMinutes();
  });

  // Générer tous les créneaux possibles
  const tousCreneaux: string[] = [];
  
  // Créneaux du matin
  for (let h = heuresDebutMatin; h <= heuresFinMatin; h++) {
    for (let m = 0; m < 60; m += dureeCreneau) {
      const heure = h + ':' + (m < 10 ? '0' : '') + m;
      tousCreneaux.push(heure);
    }
  }

  // Créneaux de l'après-midi
  for (let h = heuresDebutApresMidi; h <= heuresFinApresMidi; h++) {
    for (let m = 0; m < 60; m += dureeCreneau) {
      const heure = h + ':' + (m < 10 ? '0' : '') + m;
      tousCreneaux.push(heure);
    }
  }

  // Filtrer pour garder seulement les créneaux disponibles
  this.creneauxDisponibles = tousCreneaux.filter(creneau => 
    !creneauxOccupes.includes(creneau)
  );
}

// Modifiez onSubmit pour utiliser l'heure sélectionnée
onSubmit(): void {
  if (this.appointmentForm.valid) {
    const formData = this.appointmentForm.value;
    const [heures, minutes] = formData.heure.split(':');
    const dateRdv = new Date(formData.date);
    dateRdv.setHours(parseInt(heures), parseInt(minutes));

    const rendezVous: RendezVous = {
      patientId: '12345', 
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      email: formData.email,
      date: dateRdv,
      duree: 30, // ou la durée que vous souhaitez
      message: formData.message,
      statut: StatutRendezVous.EN_ATTENTE,
      rappelEnvoye: false,
      confirmationEnvoyee: false,
      dateCreation: new Date()
    };

    this.rendezVousService.addRendezVous(rendezVous)
      .then(() => {
        console.log('Rendez-vous enregistré avec succès !');
        this.appointmentForm.reset();
        this.creneauxDisponibles = [];
        
        // Afficher le popup
        this.successMessage = `
          <h4>Rendez-vous confirmé !</h4>
          <p>Votre rendez-vous a été pris avec succès pour le 
          <strong>${dateRdv.toLocaleDateString('fr-FR')} à ${heures}:${minutes}</strong></p>
        `;
        this.showSuccessModal = true;
        
        // Fermer automatiquement après 5 secondes
        this.setModalTimeout();
      })
      .catch(error => {
        console.error("Erreur lors de l'enregistrement :", error);
        
      });
  }
}

  /*onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formData = this.appointmentForm.value;
      const rendezVous: RendezVous = {
        patientId: '12345', 
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        email: formData.email,
        date: new Date(formData.date + 'T' + formData.heure), // Fusion de la date et de l'heure
        duree: 120,  
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
  }*/
    private setModalTimeout(): void {
      // Annuler tout timeout existant
      if (this.modalTimeout) {
        clearTimeout(this.modalTimeout);
      }
      
      // Définir un nouveau timeout
      this.modalTimeout = setTimeout(() => {
        this.showSuccessModal = false;
      }, 3000); 
    }
    
    // Nettoyage quand le composant est détruit
    ngOnDestroy(): void {
      if (this.modalTimeout) {
        clearTimeout(this.modalTimeout);
      }
    }

  goToLogin(){
    this.router.navigate(['/login']);
  }
}
