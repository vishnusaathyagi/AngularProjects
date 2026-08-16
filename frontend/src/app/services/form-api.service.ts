/* Developer note: HTTP API service for forms backend.
  Purpose: encapsulate all HTTP calls to `/api/forms` (CRUD + submissions).
  Layers: helper methods used by components to load/save/update/delete data.
  Keep method-level JSDoc comments here; this header is for quick discovery. */
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

  /**
   * Fetches all user submissions for a given form database ID
   */
  getFormSubmissions(formId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${formId}/submissions`);
  }

  /**
 * Submits dynamic user response payload to backend
 */
submitFormData(payload: { form_id: number; submission_data: any }): Observable<any> {
  return this.http.post(`${this.baseUrl}/submit`, payload);
}

/**
 * Updates an existing form schema
 */
updateFormLayout(id: number, payload: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/${id}`, payload);
}

/**
 * Deletes a form and its entries by ID
 */
deleteForm(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${id}`);
}

}