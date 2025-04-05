import { Pipe, PipeTransform } from '@angular/core';
import { RendezVous } from '../models/rendez-vous';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: RendezVous[], searchTerm: string): RendezVous[] {
    if (!items) return [];
    if (!searchTerm) return items;
    
    searchTerm = searchTerm.toLowerCase();
    return items.filter(rdv => 
      rdv.nom.toLowerCase().includes(searchTerm) ||
      rdv.prenom.toLowerCase().includes(searchTerm) ||
      rdv.telephone.includes(searchTerm)
    );
  }

}
