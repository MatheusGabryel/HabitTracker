import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private apiUrl = 'https://sendcontactemail-45j5zxrrta-uc.a.run.app';

  constructor(private http: HttpClient) { }

  sendEmail(data: { name: string; email: string; subject: string; message: string }) {
    return this.http.post(this.apiUrl, data, { responseType: 'text' });
  }
}
