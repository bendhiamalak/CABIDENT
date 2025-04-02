import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';
import { PatientService } from '../../services/patient.service';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { RendezVousService } from '../../services/rendez-vous.service';
import { StatutRendezVous } from '../../models/rendez-vous';
import { map } from 'rxjs/operators';
import { CalendarService } from '../../services/calendar.service';

declare var $: any;

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, AppointmentDialogComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild(AppointmentDialogComponent) appointmentDialog!: AppointmentDialogComponent;

  constructor(
    private patientService: PatientService,
    private rdvService: RendezVousService,
    private calendarService:CalendarService
  ) {
    this.calendarService.refreshCalendar$.subscribe(() => {
      this.loadAppointments();
      this.calendarComponent?.getApi().refetchEvents();
    });
  }
  calendarOptions: CalendarOptions = {
    allDaySlot: false,
    locale: frLocale,
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'timeGridWeek',
    slotMinTime: '08:00:00',
    slotMaxTime: '17:00:00',
    businessHours: [
      {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '12:00'
      },
      {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '14:00',
        endTime: '17:00'
      }
    ],
    dateClick: this.handleDateClick.bind(this),
    events: [],
    eventTimeFormat: { // Format d'heure pour les événements
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventDisplay: 'block',
    eventColor: '#3788d8',
    eventTextColor: '#ffffff',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00',
    nowIndicator: true,
    editable: false,
    selectable: true,
    selectOverlap: false,
    eventOverlap: false
  };

  selectedDate: Date = new Date();



  ngAfterViewInit() {
    this.loadAppointments();
    console.log('Calendar component initialized');
    this.calendarService.refreshCalendar$.subscribe(() => {
      this.loadAppointments();
      if (this.calendarComponent) {
        this.calendarComponent.getApi().refetchEvents();
      }
    });
  }

  loadAppointments(): void {
    this.rdvService.getRendezVous().pipe(
      map(rdvs => {
        return rdvs.map(rdv => ({
          id: rdv.id,
          title: `${rdv.prenom} ${rdv.nom}`,
          start: rdv.date instanceof Date ? rdv.date : new Date(rdv.date), // Conversion sécurisée
          end: new Date((rdv.date instanceof Date ? rdv.date : new Date(rdv.date)).getTime() + rdv.duree * 60000),
          extendedProps: {
            telephone: rdv.telephone,
            status: rdv.statut
          },
          backgroundColor: this.getEventColor(rdv.statut)
        }));
      })
    ).subscribe({
      next: (events) => {
        this.calendarOptions.events = events;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous:', error);
      }
    });
  }
  
  // Méthode optionnelle pour colorer les événements selon leur statut
  private getEventColor(status: StatutRendezVous): string {
    switch(status) {
      case StatutRendezVous.CONFIRME: return '#28a745'; // Vert
      case StatutRendezVous.ANNULE: return '#dc3545';   // Rouge
      case StatutRendezVous.TERMINE: return '#6c757d';  // Gris
      default: return '#007bff'; // Bleu (EN_ATTENTE)
    }
  }

  handleDateClick(info: { date: Date, dateStr: string }) {
    if (!this.calendarComponent) return;
    
    const calendarApi = this.calendarComponent.getApi();
    const events = calendarApi.getEvents();
    
    // Vérifier les chevauchements
    const isSlotAvailable = !events.some(event => {
      const eventStart = event.start!;
      const eventEnd = event.end!;
      const clickedDate = info.date;
      const duration = 60; // Durée par défaut en minutes
      const endDate = new Date(clickedDate.getTime() + duration * 60000);
      
      return (
        (clickedDate >= eventStart && clickedDate < eventEnd) ||
        (endDate > eventStart && endDate <= eventEnd) ||
        (clickedDate <= eventStart && endDate >= eventEnd)
      );
    });
    
    if (!isSlotAvailable) {
      alert('Ce créneau est déjà occupé !');
      return;
    }
    
    this.selectedDate = info.date;
    
    if (this.appointmentDialog) {
      this.appointmentDialog.openModal(this.selectedDate);
    }
  }

  // Ajoutez cette méthode pour rafraîchir le calendrier après ajout
  refreshCalendar(): void {
    this.loadAppointments();
    this.calendarComponent?.getApi().refetchEvents();
  }
}