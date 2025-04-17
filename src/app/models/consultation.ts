export interface Consultation {
  id?: string;
  patientId: string;
  rendezVousId?:string;
  date: Date;
  notes: string;
  dateCreation?: Date;
}
