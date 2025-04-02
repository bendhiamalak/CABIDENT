// rendez-vous.model.ts
export enum StatutRendezVous {
  EN_ATTENTE = 'en attente',
  CONFIRME = 'confirmé',
  ANNULE = 'annulé',
  TERMINE = 'terminé'
}

export interface RendezVous {
  id?: string;
  patientId: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  date: Date; // Changé de string à Date pour FullCalendar
  duree: number;
  message?: string;
  statut: StatutRendezVous;
  rappelEnvoye: boolean;
  confirmationEnvoyee: boolean;
  dateCreation?: Date;
}