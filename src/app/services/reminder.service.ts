import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private baseUrl='https://cabident-api.onrender.com'
  constructor(private http:HttpClient) { }

  getAppointments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/test`);
  }

  // Appel du endpoint GET /sendReminders
  sendAllReminders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sendReminders`);
  }

  // Appel du endpoint POST /sendReminder/:id
  sendReminderById(appointmentId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/sendReminder/${appointmentId}`, {});
  }
}
