/* Developer note: Dynamic form renderer component.
  Purpose: fetch form schema from backend and build a reactive form at runtime.
  Layers: form list loading, schema parsing, reactive control construction, submit handler.
  Most methods already contain inline comments; this header is for quick orientation. */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormApiService } from '../../services/form-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit {
  // Array of available forms along with submission counts
  availableForms: any[] = [];
  selectedFormName: string = '';
  
  selectedFormId: number | null = null;
  formTitle: string = '';
  formDescription: string = '';
  formFields: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  
  // Reactive form instance dynamically created from database JSON rules
  dynamicForm!: FormGroup;

  constructor(
    private formApiService: FormApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllForms();
  }

  // Fetches list of forms from backend including total submission counts
  loadAllForms(): void {
    this.formApiService.getAllForms().subscribe({
      next: (res: any) => {
        if (res.success && res.data.length > 0) {
          this.availableForms = res.data;
          
          // Default to the first form if no selection exists
          if (!this.selectedFormName) {
            this.selectedFormName = res.data[0].form_name;
          }
          this.loadSelectedForm(this.selectedFormName);
        } else {
          this.availableForms = [];
          this.errorMessage = 'No dynamic forms found in database. Create one first!';
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Failed to load form list from database.';
        this.isLoading = false;
      }
    });
  }

  // Switches displayed form design when user selects a different form from dropdown
  onFormSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedFormName = selectElement.value;
    if (this.selectedFormName) {
      this.loadSelectedForm(this.selectedFormName);
    }
  }

  // Loads form layout structure from MySQL by form name
  loadSelectedForm(formName: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.formApiService.getFormStructure(formName).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.selectedFormId = response.data.id;
          this.formTitle = response.data.form_name;
          this.formDescription = response.data.description;
          
          this.formFields = typeof response.data.fields === 'string' 
            ? JSON.parse(response.data.fields) 
            : response.data.fields;

          this.buildFormControls(this.formFields);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Failed to load selected form configuration.';
        this.isLoading = false;
      }
    });
  }

  // Dynamically constructs Reactive Form controls and attaches validation rules
  buildFormControls(fields: any[]): void {
    const formGroupConfig: any = {};

    fields.forEach(field => {
      const validations = [];

      // Required check
      if (field.required) {
        validations.push(Validators.required);
      }

      // Email check
      if (field.type === 'email') {
        validations.push(Validators.email);
      }

      // Character Length (for text, tel, email, or number input digits)
      if (field.minLength !== undefined && field.minLength !== null && field.minLength !== '') {
        validations.push(Validators.minLength(Number(field.minLength)));
      }
      if (field.maxLength !== undefined && field.maxLength !== null && field.maxLength !== '') {
        validations.push(Validators.maxLength(Number(field.maxLength)));
      }

      // Numeric Bounds (ONLY for actual number comparisons like Age, Quantity)
      if (field.type === 'number') {
        if (field.min !== undefined && field.min !== null && field.min !== '') {
          validations.push(Validators.min(Number(field.min)));
        }
        if (field.max !== undefined && field.max !== null && field.max !== '') {
          validations.push(Validators.max(Number(field.max)));
        }
      }

      // Custom Regex Pattern (Best for Phone Numbers, e.g., ^[0-9]{10}$)
      if (field.pattern) {
        validations.push(Validators.pattern(field.pattern));
      }

      formGroupConfig[field.name] = new FormControl('', validations);
    });

    this.dynamicForm = new FormGroup(formGroupConfig);
  }

  // Navigates user to Form Builder screen
  navigateToBuilder(): void {
    this.router.navigate(['/builder']);
  }

  // Validates form input and submits entry payload to MySQL database
  onSubmit(): void {
    if (this.dynamicForm.valid && this.selectedFormId) {
      const payload = {
        form_id: this.selectedFormId,
        submission_data: this.dynamicForm.value
      };

      this.formApiService.submitFormData(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            alert('Form submitted and saved to database successfully!');
            this.dynamicForm.reset();
            // Refresh form metrics counts
            this.loadAllForms();
          }
        },
        error: (err: any) => {
          console.error(err);
          alert('Failed to submit form data to database.');
        }
      });
    } else {
      this.dynamicForm.markAllAsTouched();
    }
  }

  // Navigates user to Submissions Dashboard
  navigateToSubmissions(): void {
    this.router.navigate(['/submissions']);
  }

  // Opens selected form in builder mode for layout modification
  editCurrentForm(): void {
    if (this.selectedFormId && this.selectedFormName) {
      this.router.navigate(['/builder'], { 
        queryParams: { editId: this.selectedFormId, formName: this.selectedFormName } 
      });
    }
  }

  // Deletes currently active form along with all related responses
  deleteCurrentForm(): void {
    if (!this.selectedFormId) return;

    const confirmDelete = confirm(`Are you sure you want to delete "${this.selectedFormName}"? This will also remove all its submissions.`);
    if (confirmDelete) {
      this.formApiService.deleteForm(this.selectedFormId).subscribe({
        next: (res: any) => {
          if (res.success) {
            alert('Form deleted successfully.');
            this.selectedFormName = '';
            this.selectedFormId = null;
            this.loadAllForms();
          }
        },
        error: (err: any) => {
          console.error('Delete failed:', err);
          alert('Failed to delete form from database.');
        }
      });
    }
  }
}