/* Developer note: Form Builder component integrated with RBAC service.
  Purpose: visually compose form layouts and validation rules, then save to backend.
  Layers: reactive builder form setup, dynamic FormArray of fields, persistence calls, RBAC authorization checks. */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormApiService } from '../../services/form-api.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css']
})
export class FormBuilderComponent implements OnInit {
  // Main reactive form containing form metadata and array of field rules
  builderForm!: FormGroup;
  isSubmitting: boolean = false;
  message: string = '';
  editingFormId: number | null = null; // Tracks form ID when editing an existing layout

  constructor(
    private fb: FormBuilder, 
    private formApiService: FormApiService,
    public authService: AuthService, // PUBLIC access required for template *ngIf="authService.hasRole(...)"
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // Initializes the screen structure and checks user permissions & query params
  ngOnInit(): void {
    // RBAC check: restrict builder access to Admin and Manager roles
    if (!this.authService.hasRole(['Admin', 'Manager'])) {
      alert('Access Denied: Only Admins and Managers can access the Form Builder.');
      this.router.navigate(['/']);
      return;
    }

    this.builderForm = this.fb.group({
      form_name: ['', Validators.required],
      description: [''],
      created_by: [1],
      fields: this.fb.array([])
    });

    // Read URL query parameters to determine if we are editing an existing form
    this.route.queryParams.subscribe(params => {
      if (params['editId'] && params['formName']) {
        // Editing layout is reserved exclusively for Admin role
        if (!this.authService.hasRole(['Admin'])) {
          alert('Access Denied: Only Admins are permitted to edit existing form layouts.');
          this.router.navigate(['/']);
          return;
        }

        this.editingFormId = Number(params['editId']);
        this.loadFormForEditing(params['formName']);
      } else {
        // Start with one blank input field for new forms
        this.addField();
      }
    });
  }

  // Easy getter to access the dynamic fields array in the reactive form
  get fields(): FormArray {
    return this.builderForm.get('fields') as FormArray;
  }

  // Creates a field configuration group with validation rules (Min/Max length, Min/Max value, Regex)
  createFieldGroup(data: any = {}): FormGroup {
    let optionsString = '';
    if (data.options && Array.isArray(data.options)) {
      optionsString = data.options.join(', ');
    }

    return this.fb.group({
      name: [data.name || '', Validators.required],
      label: [data.label || '', Validators.required],
      type: [data.type || 'text', Validators.required],
      placeholder: [data.placeholder || ''],
      required: [data.required || false],
      optionsInput: [optionsString],
      // Phase 1 Advanced Validation Properties
      minLength: [data.minLength ?? null],
      maxLength: [data.maxLength ?? null],
      min: [data.min ?? null],
      max: [data.max ?? null],
      pattern: [data.pattern || '']
    });
  }

  // Adds a new field card to the form design builder
  addField(): void {
    this.fields.push(this.createFieldGroup());
  }

  // Removes a field card from the form designer (keeps at least one field)
  removeField(index: number): void {
    if (this.fields.length > 1) {
      this.fields.removeAt(index);
    }
  }

  // Fetches existing form configuration from MySQL when in edit mode
  loadFormForEditing(formName: string): void {
    this.formApiService.getFormStructure(formName).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const parsedFields = typeof res.data.fields === 'string' 
            ? JSON.parse(res.data.fields) 
            : res.data.fields;

          this.builderForm.patchValue({
            form_name: res.data.form_name,
            description: res.data.description,
            created_by: res.data.created_by || 1
          });

          this.fields.clear();
          parsedFields.forEach((f: any) => {
            this.fields.push(this.createFieldGroup(f));
          });
        }
      },
      error: (err) => {
        console.error('Failed to load schema for editing:', err);
      }
    });
  }

  // Validates the designer form and sends structure to Node backend
  onSaveForm(): void {
    // RBAC validation checks before persistence logic
    if (this.editingFormId && !this.authService.hasRole(['Admin'])) {
      alert('Access Denied: Only Admins can modify existing form layouts.');
      return;
    }

    if (!this.authService.hasRole(['Admin', 'Manager'])) {
      alert('Access Denied: Only Admins and Managers can save form designs.');
      return;
    }

    if (this.builderForm.invalid) {
      this.builderForm.markAllAsTouched();
      this.message = 'Please fill in all required fields (Form Title, Field Name, and Field Label) before saving.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';
    const rawValue = this.builderForm.value;

    const formattedFields = rawValue.fields.map((f: any) => {
      const fieldConfig: any = {
        name: f.name,
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
        required: f.required
      };

      if (f.type === 'select' && f.optionsInput) {
        fieldConfig.options = f.optionsInput.split(',').map((opt: string) => opt.trim());
      }

      // Include 'password' alongside text, email, and tel
      if (['text', 'password', 'email', 'tel'].includes(f.type)) {
        if (f.minLength !== null && f.minLength !== '') fieldConfig.minLength = Number(f.minLength);
        if (f.maxLength !== null && f.maxLength !== '') fieldConfig.maxLength = Number(f.maxLength);
        if (f.pattern) fieldConfig.pattern = f.pattern;
      }

      if (f.type === 'number') {
        if (f.min !== null && f.min !== '') fieldConfig.min = Number(f.min);
        if (f.max !== null && f.max !== '') fieldConfig.max = Number(f.max);
      }

      return fieldConfig;
    });

    const payload = {
      form_name: rawValue.form_name,
      description: rawValue.description,
      created_by: rawValue.created_by,
      fields: formattedFields
    };

    if (this.editingFormId) {
      this.formApiService.updateFormLayout(this.editingFormId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Form design updated successfully!');
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          console.error(err);
          this.message = err.error?.message || 'Error updating form configuration.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.formApiService.saveFormStructure(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Form design saved successfully!');
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          console.error(err);
          this.message = err.error?.message || 'Error saving form configuration.';
          this.isSubmitting = false;
        }
      });
    }
  }

  // Returns back to home screen
  goBack(): void {
    this.router.navigate(['/']);
  }
}