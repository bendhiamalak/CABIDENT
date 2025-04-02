

export interface Patient {
  id?: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  dateNaissance?: string; // Format 'jj/mm/aaaa' pour faciliter le stockage et la manipulation
  adresse?: string;
  notes?: string;
  dateCreation: Date;
}

