import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormApiService } from '../../services/form-api.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent {
  formTitle: string = '';
  formDescription: string = '';
  formFields: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  // Dynamic form tracking object instance
  dynamicForm!: FormGroup;

  constructor(private formApiService: FormApiService) {}

  ngOnInit(): void {
    // Attempting to pull the specific template layout we generated in Postman
    const targetFormName = 'User Registration Form';

    this.formApiService.getFormStructure(targetFormName).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.formTitle = response.data.form_name;
          this.formDescription = response.data.description;
          
          // If your MySQL driver returns the JSON column as a stringified block, 
          // parse it back into a native JavaScript Array cleanly.
          this.formFields = typeof response.data.fields === 'string' 
            ? JSON.parse(response.data.fields) : response.data.fields;

          // Build out form tracking mechanics reactively
          this.buildFormControls(this.formFields);

        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[Angular Integration Error]:', err);
        this.errorMessage = 'Failed to load form architecture layout from server context.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Loops over fields array metadata configuration blocks to inject validation keys
   */
  buildFormControls(fields: any[]): void {
    const formGroupConfig: any = {};

    fields.forEach(field => {
      const validations = [];
      
      // Inject required constraint conditionally
      if (field.required) {
        validations.push(Validators.required);
      }
      
      // Inject email parsing validation if type matches
      if (field.type === 'email') {
        validations.push(Validators.email);
      }

      // Map new tracking slot to form object map
      formGroupConfig[field.name] = new FormControl('', validations);
    });

    this.dynamicForm = new FormGroup(formGroupConfig);
  }

  /**
   * Triggers on submission actions safely
   */
  onSubmit(): void {
    if (this.dynamicForm.valid) {
      console.log('Successfully Compiled Dynamic Data Object:', this.dynamicForm.value);
      alert('Form submission data printed successfully in browser console console logs!');
    } else {
      // Highlights validation failure zones
      this.dynamicForm.markAllAsTouched();
    }
  }

}
