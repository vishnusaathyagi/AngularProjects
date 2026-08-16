/* Developer note: Route definitions for the single-page app.
  Purpose: map URLs to standalone components (dynamic form, builder, submissions).
  Layers: top-level routes and a fallback redirect.
  These comments are non-functional and safe to keep. */
import { Routes } from '@angular/router';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { FormBuilderComponent } from './components/form-builder/form-builder.component';
import { FormSubmissionsComponent } from './components/form-submissions/form-submissions.component';

export const routes: Routes = [
  { path: '', component: DynamicFormComponent },
  { path: 'builder', component: FormBuilderComponent },
  { path: 'submissions', component: FormSubmissionsComponent }, // <-- Add Route
  { path: '**', redirectTo: '' }
];