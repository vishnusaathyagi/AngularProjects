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
  availableForms: any[] = [];
  selectedFormName: string = '';
  
  formTitle: string = '';
  formDescription: string = '';
  formFields: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  
  dynamicForm!: FormGroup;

  constructor(
    private formApiService: FormApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Fetch all available forms first
    this.formApiService.getAllForms().subscribe({
      next: (res:any) => {
        if (res.success && res.data.length > 0) {
          this.availableForms = res.data;
          // Default to the first form in the list
          this.selectedFormName = res.data[0].form_name;
          this.loadSelectedForm(this.selectedFormName);
        } else {
          this.errorMessage = 'No dynamic forms found in database. Create one first!';
          this.isLoading = false;
        }
      },
      error: (err:any) => {
        console.error(err);
        this.errorMessage = 'Failed to load form list from database.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Triggers whenever a user switches forms in the dropdown selector
   */
  onFormSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedFormName = selectElement.value;
    if (this.selectedFormName) {
      this.loadSelectedForm(this.selectedFormName);
    }
  }

  /**
   * Fetches specific layout and builds reactive controls dynamically
   */
  loadSelectedForm(formName: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.formApiService.getFormStructure(formName).subscribe({
      next: (response:any) => {
        if (response.success && response.data) {
          this.formTitle = response.data.form_name;
          this.formDescription = response.data.description;
          
          this.formFields = typeof response.data.fields === 'string' 
            ? JSON.parse(response.data.fields) 
            : response.data.fields;

          this.buildFormControls(this.formFields);
        }
        this.isLoading = false;
      },
      error: (err:any) => {
        console.error(err);
        this.errorMessage = 'Failed to load selected form configuration.';
        this.isLoading = false;
      }
    });
  }

  buildFormControls(fields: any[]): void {
    const formGroupConfig: any = {};

    fields.forEach(field => {
      const validations = [];
      if (field.required) validations.push(Validators.required);
      if (field.type === 'email') validations.push(Validators.email);

      formGroupConfig[field.name] = new FormControl('', validations);
    });

    this.dynamicForm = new FormGroup(formGroupConfig);
  }

  navigateToBuilder(): void {
    this.router.navigate(['/builder']);
  }

  onSubmit(): void {
    if (this.dynamicForm.valid) {
      console.log('Form Submission Values:', this.dynamicForm.value);
      alert('Form submission printed in console logs!');
    } else {
      this.dynamicForm.markAllAsTouched();
    }
  }
}