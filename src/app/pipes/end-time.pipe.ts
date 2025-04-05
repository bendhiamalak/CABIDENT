import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'endTime',
  standalone: true
})
export class EndTimePipe implements PipeTransform {

  transform(date: Date, duration: number): string {
    const endDate = new Date(date.getTime() + duration * 60000);
    return endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

}
