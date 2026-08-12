import { Routes } from '@angular/router';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';

export const routes: Routes = [
    // Maps the empty root URL (http://localhost:4200) directly to your form component
  { path: '', component: DynamicFormComponent },
  
  // Wildcard redirect: If a user types a weird URL, send them back to the home form
  { path: '**', redirectTo: '' }
];
