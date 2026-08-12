import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormApiService } from '../../services/form-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css']
})
export class FormBuilderComponent {
  builderForm: FormGroup;
  isSubmitting: boolean = false;
  message: string = '';

  constructor(
    private fb: FormBuilder, 
    private formApiService: FormApiService,
    private router: Router
  ) {
    // Initialize root builder form structure
    this.builderForm = this.fb.group({
      form_name: ['', Validators.required],
      description: [''],
      created_by: [1],
      fields: this.fb.array([]) // Array to hold dynamic field definitions
    });

    // Add at least one default field entry on start
    this.addField();
  }

  // Getter for easy access to fields FormArray
  get fields(): FormArray {
    return this.builderForm.get('fields') as FormArray;
  }

  /**
   * Pushes a new field configuration group into the array
   */
  addField(): void {
    const fieldGroup = this.fb.group({
      name: ['', Validators.required],
      label: ['', Validators.required],
      type: ['text', Validators.required],
      placeholder: [''],
      required: [false],
      optionsInput: [''] // Temporary raw string input for select dropdown choices (comma separated)
    });

    this.fields.push(fieldGroup);
  }

  /**
   * Removes a field from the builder list
   */
  removeField(index: number): void {
    if (this.fields.length > 1) {
      this.fields.removeAt(index);
    }
  }

  /**
   * Submits the crafted form configuration to the backend API
   */
  onSaveForm(): void {
    if (this.builderForm.invalid) {
      this.builderForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const rawValue = this.builderForm.value;

    // Transform raw form array data into clean API payload schema
    const formattedFields = rawValue.fields.map((f: any) => {
      const fieldConfig: any = {
        name: f.name,
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
        required: f.required
      };

      // If field type is 'select', parse comma-separated options string into an array
      if (f.type === 'select' && f.optionsInput) {
        fieldConfig.options = f.optionsInput.split(',').map((opt: string) => opt.trim());
      }

      return fieldConfig;
    });

    const payload = {
      form_name: rawValue.form_name,
      description: rawValue.description,
      created_by: rawValue.created_by,
      fields: formattedFields
    };

    this.formApiService.saveFormStructure(payload).subscribe({
      next: (res:any) => {
        this.isSubmitting = false;
        alert('Form configuration saved successfully to MySQL!');
        // Navigate back to view the form live
        this.router.navigate(['/']);
      },
      error: (err:any) => {
        console.error(err);
        this.message = err.error?.message || 'Error saving form configuration.';
        this.isSubmitting = false;
      }
    });
  }
}