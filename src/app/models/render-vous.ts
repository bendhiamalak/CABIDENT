export enum StatutRendezVous {
    EN_ATTENTE = 'en attente',
    CONFIRME = 'confirmé',
    ANNULE = 'annulé',
    TERMINE = 'terminé'
  }
  
export interface RenderVous {
  id?: string;
  patientId: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  date: Date;
  duree: number;
  motif: string;
  message?: string;
  statut: StatutRendezVous;
  rappelEnvoye: boolean;
  confirmationEnvoyee: boolean;
  dateCreation: Date;
}
