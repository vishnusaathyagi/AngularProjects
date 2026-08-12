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

}
