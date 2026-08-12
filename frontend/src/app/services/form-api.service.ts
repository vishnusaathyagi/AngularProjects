import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormApiService {

  // Direct path referencing your active Node.js server instance port
  private baseUrl = 'http://localhost:5000/api/forms';

  constructor(private http: HttpClient) { }

  /**
   * Fetches a dynamic form structure configuration by name from the database.
   */
  getFormStructure(formName: string): Observable<any> {
    // Encodes characters like spaces safely into %20 format automatically
    const safeName = encodeURIComponent(formName);
    return this.http.get(`${this.baseUrl}/${safeName}`);
  }

  /**
   * Saves a newly created dynamic form layout schema to the MySQL database.
   */
  saveFormStructure(formData: any): Observable<any> {
    return this.http.post(this.baseUrl, formData);
  }

  // Inside FormApiService class:

  /**
   * Sends user entry data to be stored in form_submissions table
   */
  submitFormResponse(formId: number, submissionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/submit`, {
      form_id: formId,
      submission_data: submissionData
    });
  }



}
