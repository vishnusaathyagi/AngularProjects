import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormApiService {
  private baseUrl = 'http://localhost:5000/api/forms';

  constructor(private http: HttpClient) {}

  /**
   * Fetches summary details for all forms in MySQL
   */
  getAllForms(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  /**
   * Fetches specific dynamic form structure by name
   */
  getFormStructure(formName: string): Observable<any> {
    const safeName = encodeURIComponent(formName);
    return this.http.get(`${this.baseUrl}/${safeName}`);
  }

  /**
   * Saves a newly created dynamic form layout schema
   */
  saveFormStructure(formData: any): Observable<any> {
    return this.http.post(this.baseUrl, formData);
  }
}