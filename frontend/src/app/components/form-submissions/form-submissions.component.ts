/* Developer note: Submissions dashboard component.
  Purpose: load and display user submissions for a selected form, with export support.
  Layers: initialization (ngOnInit), data fetching, filtering, export, navigation helpers.
  Inline comments below explain implementation details where helpful. */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormApiService } from '../../services/form-api.service';
import { Router } from '@angular/router';
import * as Workbook from 'exceljs';

@Component({
  selector: 'app-form-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-submissions.component.html',
  styleUrls: ['./form-submissions.component.css']
})
export class FormSubmissionsComponent implements OnInit {
  // Array of forms loaded with total submission counts
  availableForms: any[] = [];
  selectedFormId: number | null = null;
  
  // Holds full submission datasets and filtered view for instant searching
  allSubmissions: any[] = [];
  filteredSubmissions: any[] = [];
  
  tableHeaders: string[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Search bar input model
  searchTerm: string = '';

  constructor(
    private formApiService: FormApiService,
    private router: Router
  ) {}

  // Loads form metadata list on component load
  ngOnInit(): void {
    this.formApiService.getAllForms().subscribe({
      next: (res: any) => {
        if (res.success && res.data.length > 0) {
          this.availableForms = res.data;
          this.selectedFormId = res.data[0].id;
          this.fetchSubmissions(this.selectedFormId!);
        } else {
          this.errorMessage = 'No forms available in database.';
        }
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Failed to load forms list.';
      }
    });
  }

  // Switches displayed responses table when dropdown form selection changes
  onFormChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedFormId = Number(select.value);
    if (this.selectedFormId) {
      this.fetchSubmissions(this.selectedFormId);
    }
  }

  // Fetches submission data from backend and computes dynamic grid table headers
  fetchSubmissions(formId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.allSubmissions = [];
    this.filteredSubmissions = [];
    this.tableHeaders = [];
    this.searchTerm = '';

    this.formApiService.getFormSubmissions(formId).subscribe({
      next: (res: any) => {
        if (res.success && res.data.length > 0) {
          this.allSubmissions = res.data;
          this.filteredSubmissions = res.data;
          
          // Identify unique JSON data keys to build dynamic grid columns
          const keysSet = new Set<string>();
          res.data.forEach((row: any) => {
            if (row.submission_data && typeof row.submission_data === 'object') {
              Object.keys(row.submission_data).forEach(k => keysSet.add(k));
            }
          });
          this.tableHeaders = Array.from(keysSet);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch submissions for selected form.';
        this.isLoading = false;
      }
    });
  }

  // Real-time keyword filter across submission values and IDs
  filterSubmissions(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSubmissions = this.allSubmissions;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredSubmissions = this.allSubmissions.filter(row => {
      // Check ID match
      if (String(row.id).includes(term)) return true;

      // Check submitted date match
      const dateStr = new Date(row.submitted_at).toLocaleString().toLowerCase();
      if (dateStr.includes(term)) return true;

      // Check dynamic submission fields
      if (row.submission_data && typeof row.submission_data === 'object') {
        return Object.values(row.submission_data).some(val => 
          String(val || '').toLowerCase().includes(term)
        );
      }

      return false;
    });
  }

  // Formats data and triggers styled Excel download via ExcelJS
  async exportToExcel(): Promise<void> {
    if (this.filteredSubmissions.length === 0) return;

    // 1. Initialize Excel Workbook & Worksheet
    const workbook = new Workbook.Workbook();
    const worksheet = workbook.addWorksheet('Form Submissions');

    // 2. Define Headers
    const headers = ['Submission ID', ...this.tableHeaders, 'Submitted At'];

    // 3. Configure column headers & layout widths
    worksheet.columns = headers.map(header => ({
      header: header,
      key: header,
      width: Math.max(header.length + 5, 18)
    }));

    // 4. Style Header Row with Bold Font and Light Background Fill
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE9ECEF' }
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
    headerRow.height = 24;

    // 5. Populate rows with filtered submissions dataset
    this.filteredSubmissions.forEach(row => {
      const rowData: any = {
        'Submission ID': `#${row.id}`
      };

      this.tableHeaders.forEach(key => {
        const val = row.submission_data ? row.submission_data[key] : '';
        rowData[key] = val !== undefined && val !== null ? String(val) : '-';
      });

      rowData['Submitted At'] = new Date(row.submitted_at).toLocaleString();

      worksheet.addRow(rowData);
    });

    // 6. Generate buffer and trigger browser download
    const selectedForm = this.availableForms.find(f => f.id === this.selectedFormId);
    const fileName = selectedForm 
      ? `${selectedForm.form_name.toLowerCase().replace(/\s+/g, '_')}_submissions.xlsx` 
      : `form_${this.selectedFormId}_submissions.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Returns back to dynamic form homepage
  goBack(): void {
    this.router.navigate(['/']);
  }
}