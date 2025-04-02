import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor() { }
  private refreshCalendarSubject = new Subject<void>();
  refreshCalendar$ = this.refreshCalendarSubject.asObservable();

  triggerRefreshCalendar() {
    this.refreshCalendarSubject.next();
  }
}
