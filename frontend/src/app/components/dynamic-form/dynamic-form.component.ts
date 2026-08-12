import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormApiService } from '../../services/form-api.service';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit {
  formId: number | null = null; // Store form_id here
  formTitle: string = '';
  formDescription: string = '';
  formFields: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  
  dynamicForm!: FormGroup;

  constructor(private formApiService: FormApiService) {}

  ngOnInit(): void {
    const targetFormName = 'User Registration Form';

    this.formApiService.getFormStructure(targetFormName).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.formId = response.data.id; // Save database ID
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
        console.error('[Angular Integration Error]:', err);
        this.errorMessage = 'Failed to load form architecture layout from server context.';
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

  onSubmit(): void {
    if (this.dynamicForm.valid && this.formId) {
      this.isSubmitting = true;

      // Submit user responses to MySQL
      this.formApiService.submitFormResponse(this.formId, this.dynamicForm.value).subscribe({
        next: (res:any) => {
          this.isSubmitting = false;
          alert('Form submission saved successfully to MySQL database!');
          this.dynamicForm.reset(); // Clear form after submission
        },
        error: (err:any) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Failed to submit form responses.');
        }
      });

    } else {
      this.dynamicForm.markAllAsTouched();
    }
  }
}