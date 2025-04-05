import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { RendezVousService } from '../../services/rendez-vous.service';
import { RendezVous, StatutRendezVous } from '../../models/rendez-vous';
import { map, takeUntil } from 'rxjs/operators';
import { CalendarService } from '../../services/calendar.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
registerLocaleData(localeFr);
declare var $: any;

@Component({
  selector: 'app-calendar',
  standalone: true,
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' }
  ],
  imports: [FullCalendarModule, AppointmentDialogComponent, CommonModule,FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  private destroy=new Subject<void>();

  rendezVousList: RendezVous[] = [];
  selectedViewDate: Date = new Date();
  searchTerm: string = '';

  constructor(
    private rdvService: RendezVousService,
    private calendarService:CalendarService
  ) {}


  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '17:00:00',
    allDaySlot: false,
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
    events: [],
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    dateClick: this.handleDateClick.bind(this)
  };
  selectedDate: Date = new Date();



  ngAfterViewInit(): void {
    this.calendarService.registerCalendar(this.calendarComponent);
    this.loadAppointments();
    this.chargerRdvsDuJour(); // Charge les RDV du jour actuel par défaut
    
    this.calendarService.refreshCalendar
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.loadAppointments();
        this.chargerRdvsDuJour(this.selectedViewDate); // Recharge pour la date actuelle
      });
  }

  
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }


  loadAppointments(): void {
    this.rdvService.getRendezVous().pipe(
      map(rdvs => rdvs.map(rdv => this.createCalendarEvent(rdv))),
      takeUntil(this.destroy)
    ).subscribe({
      next: (events) => {
        this.calendarOptions.events = events;
        this.calendarComponent?.getApi().refetchEvents();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous:', error);
      }
    });
  }

  private createCalendarEvent(rdv: any): EventInput {
    // Conversion sécurisée de la date
    const startDate = this.convertToDate(rdv.date);
    const endDate = new Date(startDate.getTime() + (rdv.duree || 30) * 60000);

    return {
      id: rdv.id,
      title: `${rdv.prenom} ${rdv.nom}`,
      start: startDate,
      end: endDate,
      extendedProps: {
        telephone: rdv.telephone,
        status: rdv.statut
      },
      backgroundColor: this.getEventColor(rdv.statut)
    };
  }

  convertToDate(dateValue: any): Date {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    if (dateValue?.toDate) { // Si c'est un Timestamp Firestore
      return dateValue.toDate();
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    return new Date(dateValue.toISOString().slice(0, -1));
  }

  private getEventColor(status: StatutRendezVous): string {
    switch(status) {
      case StatutRendezVous.CONFIRME: return '#4EB7CD';
      case StatutRendezVous.ANNULE: return '#FFC241';
      case StatutRendezVous.TERMINE: return '#FFC241';
      default: return '#4EB7CD';
    }
  }


  handleDateClick(info: { date: Date }): void {
    if (this.calendarService.isDateInPast(info.date)) {
      alert('Impossible de prendre un rendez-vous dans le passé !');
      return;
    }
  
    if (!this.calendarService.isWithinBusinessHours(info.date)) {
      alert('Hors des heures de travail !');
      return;
    }
  
    const calendarApi = this.calendarComponent.getApi();
    const events = calendarApi.getEvents();
    
    const isSlotAvailable = !events.some(event => {
      return info.date >= event.start! && info.date < event.end!;
    });
    
    if (isSlotAvailable) {
      this.calendarService.openAppointmentDialog(info.date);
    } else {
      alert('Ce créneau est déjà occupé !');
    }
    this.chargerRdvsDuJour(info.date);
  }

  chargerRdvsDuJour(date: Date = new Date()): void {
    console.log('Chargement RDV pour:', date); // Debug
    this.selectedViewDate = date;
    
    this.rdvService.getRendezVousDuJour(date).subscribe({
      next: (rdvs) => {
        console.log('RDV trouvés:', rdvs); // Debug
        this.rendezVousList = rdvs;
      },
      error: (err) => {
        //console.error('Erreur:', err);
        this.rendezVousList = [];
      }
    });
  }
  
  onDateChange(): void {
    this.chargerRdvsDuJour(this.selectedDate);
  }
  
  openAddDialog(): void {
    this.calendarService.openAppointmentDialog(this.selectedDate);
  }
  
  editAppointment(rdv: RendezVous, mode: 'time' | 'date' | 'full' = 'full') {
    const editMode = `edit-${mode}` as const;
    /*this.calendarService.openAppointmentDialog(
      this.convertToDate(rdv.date), 
      {
        rendezVous: rdv,
        mode: editMode
      }
    );*/
  }
  
  async deleteAppointment(id: string): Promise<void> {
    if (confirm('Voulez-vous vraiment supprimer ce rendez-vous ?')) {
      try {
        await this.rdvService.deleteRendezVous(id);
        this.chargerRdvsDuJour(this.selectedDate);
        this.calendarService.triggerRefresh();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  }

}