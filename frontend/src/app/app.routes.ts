import { Routes } from '@angular/router';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { FormBuilderComponent } from './components/form-builder/form-builder.component';

export const routes: Routes = [
    // Maps the empty root URL (http://localhost:4200) directly to your form component
  { path: '', component: DynamicFormComponent },
  
  { path: 'builder', component: FormBuilderComponent }, // <-- Add Form Builder Route!

  // Wildcard redirect: If a user types a weird URL, send them back to the home form
  { path: '**', redirectTo: '' }
];
