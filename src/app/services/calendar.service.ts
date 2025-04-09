import { Injectable } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Subject } from 'rxjs';
import { RendezVous } from '../models/rendez-vous';
@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private refreshCalendarSubject = new Subject<void>();
  private openDialogSubject = new Subject<{date: Date, options?: any}>();
  private calendarComponent?: FullCalendarComponent;


  refreshCalendar = this.refreshCalendarSubject.asObservable();
  openDialog = this.openDialogSubject.asObservable();

  registerCalendar(calendar: FullCalendarComponent) {
    this.calendarComponent = calendar;
  }

  triggerRefresh() {
    this.refreshCalendarSubject.next();
  }

  // Dans CalendarService
openAppointmentDialog(date: Date, options: {
  rendezVous?: RendezVous,
  mode?: 'create' | 'edit-time' | 'edit-date' | 'edit-full'
} = {}) {
  this.openDialogSubject.next({ 
    date,
    options
  });
}

isSlotAvailable(startDate: Date, duration: number, excludedRdvId?: string): boolean {
  if (!this.calendarComponent) return false;
  
  const calendarApi = this.calendarComponent.getApi();
  const endDate = new Date(startDate.getTime() + duration * 60000);
  const events = calendarApi.getEvents();
  
  return !events.some(event => {
    // Exclure l'événement avec l'ID spécifié (pour les modifications)
    if (excludedRdvId && event.id === excludedRdvId) {
      return false;
    }
    
    const eventStart = event.start!;
    const eventEnd = event.end || eventStart;
    
    // Vérifier le chevauchement
    return (startDate < eventEnd && endDate > eventStart);
  });
}

  isWithinBusinessHours(date: Date): boolean {
    if (!this.calendarComponent) return false;
    
    const calendarApi = this.calendarComponent.getApi();
    const dayOfWeek = date.getDay(); // 0 (dimanche) à 6 (samedi)
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const businessHours = calendarApi.getOption('businessHours');
    if (!businessHours || !Array.isArray(businessHours)) return true;

    return businessHours.some((period: any) => {
      if (!period.daysOfWeek.includes(dayOfWeek)) return false;
      
      const [startHour, startMinute] = period.startTime.split(':').map(Number);
      const [endHour, endMinute] = period.endTime.split(':').map(Number);
      
      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;
      
      return totalMinutes >= startTotal && totalMinutes <= endTotal;
    });
  }

  isDateInPast(date: Date): boolean {
    return date < new Date();
  }

  private editDialogSubject = new Subject<RendezVous>();
editDialog = this.editDialogSubject.asObservable();

openEditDialog(rdv: RendezVous): void {
  this.editDialogSubject.next(rdv);
}
}
