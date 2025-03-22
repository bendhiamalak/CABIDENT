export enum TypeSMS {
    CONFIRMATION = 'confirmation',
    RAPPEL = 'rappel'
  }
  
export interface SMS {
  id?: string;
  rendezVousId: string;
  patientId: string;
  telephone: string;
  message: string;
  type: TypeSMS;
  envoye: boolean;
  dateEnvoi: Date;
}