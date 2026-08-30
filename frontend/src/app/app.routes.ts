/* Developer note: Route definitions for the single-page app with RBAC route guards. */
import { Routes } from '@angular/router';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { FormBuilderComponent } from './components/form-builder/form-builder.component';
import { FormSubmissionsComponent } from './components/form-submissions/form-submissions.component';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: DynamicFormComponent },
  { 
    path: 'builder', 
    component: FormBuilderComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['Admin', 'Manager'] } 
  },
  { 
    path: 'submissions', 
    component: FormSubmissionsComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['Admin', 'Manager'] } 
  },
  { path: '**', redirectTo: '' }
];