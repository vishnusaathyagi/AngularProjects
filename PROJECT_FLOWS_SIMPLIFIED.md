# Dynamic Forms - Function Flow Guide (Simplified)

## 🗄️ Database Tables

### `forms` Table
```sql
id | form_name | description | fields (JSON) | created_at
```

### `form_submissions` Table
```sql
id | form_id | submission_data (JSON) | submitted_at
```

---

## � FLOW 0: Authentication & Login (New!)

### Data Flow
```
User visits /login
    ↓
Enters username & password
    ↓
POST /api/auth/login (Backend)
    ↓
Backend verifies password hash
    ↓
Generate JWT token
    ↓
Frontend stores in localStorage
    ↓
Interceptor adds token to all API requests
    ↓
Protected routes now accessible
```

### Key Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `isLoading` | Boolean | Show loading spinner while verifying |
| `errorMessage` | String | Show "Invalid credentials" if login fails |
| `token` | String | JWT stored in localStorage |
| `currentUser` | Object | {id, username, role} |

### Role-Based Access

- **Admin**: Can create/edit/delete any form
- **Form Creator**: Can create/edit own forms
- **User**: Can only fill forms

### Template Bindings

```html
<!-- Login form -->
<form [formGroup]="loginForm" (ngSubmit)="onLogin()">
  <input formControlName="username" placeholder="Username">
  <input formControlName="password" type="password" placeholder="Password">
  <button type="submit" [disabled]="isLoading">Login</button>
  <div *ngIf="errorMessage" style="color: red;">{{ errorMessage }}</div>
</form>

<!-- Show after login -->
<div *ngIf="authService.isLoggedIn()">
  Welcome, {{ (authService.currentUser$ | async)?.username }}!
  <button (click)="authService.logout()">Logout</button>
</div>
```

### Authentication Flow
1. User submits login form
2. `authService.login()` sends POST to backend
3. Backend verifies username + password
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. All future API calls include JWT in header
7. Backend middleware verifies token on protected routes

✅ **See:** [RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md) for complete details

---

## �� FLOW 1: View & Fill Form (Home Page - Route "/")

### Data Flow
```
User visits / 
    ↓
ngOnInit() loads forms
    ↓
GET /api/forms (Backend)
    ↓
Database returns all forms with submission counts
    ↓
Dropdown shows forms | User selects form
    ↓
GET /api/forms/:formName (Backend)
    ↓
Form structure returned | Form fields displayed
```

### Component Variables

| Variable | Type | Shows What | Updates When |
|----------|------|-----------|--------------|
| `availableForms` | Array | Forms in dropdown | API returns data |
| `selectedFormName` | String | Currently selected form | User changes dropdown |
| `formFields` | Array | Input fields to display | Form loaded |
| `dynamicForm` | FormGroup | Reactive form with validators | Fields loaded |
| `isLoading` | Boolean | Loading spinner | API request in progress |
| `errorMessage` | String | Error text | API fails |

### Template Bindings

```html
<!-- Dropdown: Shows forms -->
<select [value]="selectedFormName" (change)="onFormSelectChange($event)">
  <option *ngFor="let form of availableForms" [value]="form.form_name">
    {{ form.form_name }} ({{ form.submission_count || 0 }} submissions)
  </option>
</select>

<!-- Shows loading or error -->
<div *ngIf="isLoading">Loading...</div>
<div *ngIf="errorMessage">{{ errorMessage }}</div>

<!-- Form fields loop -->
<form [formGroup]="dynamicForm" (ngSubmit)="onSubmit()">
  <div *ngFor="let field of formFields">
    <label>{{ field.label }} <span *ngIf="field.required">*</span></label>
    
    <!-- Text/Email/Number inputs -->
    <input *ngIf="field.type !== 'select'" 
           [type]="field.type" 
           [formControlName]="field.name" />
    
    <!-- Dropdown -->
    <select *ngIf="field.type === 'select'" [formControlName]="field.name">
      <option *ngFor="let opt of field.options">{{ opt }}</option>
    </select>
    
    <!-- Errors show only after user touches field -->
    <div *ngIf="dynamicForm.get(field.name)?.invalid && dynamicForm.get(field.name)?.touched">
      Error message here
    </div>
  </div>
</form>
```

### Functions Explained

| Function | File | Purpose |
|----------|------|---------|
| `loadAllForms()` | Component | Fetch all forms from backend |
| `onFormSelectChange()` | Component | Load selected form structure |
| `buildFormControls()` | Component | Create reactive form with validators |
| `getAllForms()` | Controller | Query all forms with counts (LEFT JOIN) |
| `getFormLayout()` | Controller | Get specific form by name |

---

## 🔄 FLOW 2: Submit Form (Click Submit Button)

### Data Flow
```
User fills form and clicks Submit
    ↓
onSubmit() validates form
    ↓
Create payload: {form_id, submission_data}
    ↓
POST /api/forms/submit (Backend)
    ↓
Insert into form_submissions table
    ↓
Success: Alert + Reset form + Update counts
```

### Template Binding

```html
<form [formGroup]="dynamicForm" (ngSubmit)="onSubmit()">
  <!-- Fields here -->
  <button type="submit">Submit Form</button>
</form>
```

### How It Works

1. User clicks "Submit Form" button
2. `(ngSubmit)="onSubmit()"` fires
3. Check if `dynamicForm.valid` is true
4. If false: `markAllAsTouched()` shows all errors
5. If true: Create payload with all field values
6. Send HTTP POST to backend
7. Backend inserts into database
8. Success: Alert shown, form reset, counts updated

### Component Code

```typescript
onSubmit(): void {
  if (!this.dynamicForm.valid) {
    this.dynamicForm.markAllAsTouched();  // Show errors
    return;
  }

  const payload = {
    form_id: this.selectedFormId,
    submission_data: this.dynamicForm.value  // All form answers
  };

  this.formApiService.submitFormData(payload).subscribe({
    next: (res) => {
      alert('Form submitted!');
      this.dynamicForm.reset();    // Clear form
      this.loadAllForms();           // Refresh counts
    },
    error: () => alert('Failed to submit')
  });
}
```

### Backend Function

```javascript
submitFormData(req, res) {
  // Get form_id and submission_data from request
  // Convert submission_data to JSON string
  // INSERT into form_submissions table
  // Return success
}
```

---

## 🔄 FLOW 3: Create New Form (Form Builder - Route "/builder")

### Data Flow
```
User clicks "Build New Form" button
    ↓
Navigate to /builder route
    ↓
Empty form with one blank field appears
    ↓
User adds fields and fills details
    ↓
Click "Save Form Design"
    ↓
POST /api/forms (Backend)
    ↓
Insert into forms table with fields JSON
    ↓
Redirect to home page
```

### Component Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `builderForm` | FormGroup | Main form (metadata + fields array) |
| `fields` (getter) | FormArray | Array of field configurations |
| `editingFormId` | Number | If editing, store form ID |
| `isSubmitting` | Boolean | Disable button while saving |
| `message` | String | Success/error message |

### Template Structure

```html
<form [formGroup]="builderForm" (ngSubmit)="onSaveForm()">
  
  <!-- Form metadata -->
  <input formControlName="form_name" placeholder="Form title">
  <input formControlName="description" placeholder="Description">
  
  <!-- Dynamic fields array -->
  <div formArrayName="fields">
    <div *ngFor="let field of fields.controls; let i = index" [formGroupName]="i">
      
      <input formControlName="name" placeholder="Field name (key)">
      <input formControlName="label" placeholder="Display label">
      
      <select formControlName="type">
        <option value="text">Text</option>
        <option value="email">Email</option>
        <option value="number">Number</option>
        <option value="select">Dropdown</option>
      </select>
      
      <!-- Options input shows only for select type -->
      <div *ngIf="field.get('type')?.value === 'select'">
        <input formControlName="optionsInput" placeholder="Option1, Option2, Option3">
      </div>
      
      <button type="button" (click)="removeField(i)" *ngIf="fields.length > 1">
        Remove Field
      </button>
    </div>
  </div>
  
  <button type="button" (click)="addField()">+ Add Field</button>
  <button type="submit">Save Form Design</button>
</form>

<div *ngIf="message">{{ message }}</div>
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `addField()` | Add new field to array |
| `removeField(i)` | Remove field at index i |
| `onSaveForm()` | Format and save to backend |
| `loadFormForEditing()` | Load existing form for edit mode |

----

# L🔄 lLOW34Edit Existing Form

#`### Data Flow
`
Click "Edit Form" button
      
NNavigau to /builder  with qu?ry params (eitId,, &rmName))t    
 
Detectudityalae di nnOnInitnt
)
  ↓
→→
T /api/forms/:formNa (Load existing form)me     
 
Populate fields array with existing dat    a
 
User modifies field    s
 
Click "Save Form    "
 → PUT /api/for:id (Update backend)s/    5) Redireut to home
```

### How It Diffcrf From Create

```typercript
// In onSaveForm() functione

ifn(this.RditingFormId) {
  // UPDATE mo.e
  thos.fohmApiSorviSe.updateFormLayout(this.ediiingFormId, payload)
} else {
  // CREATEimtde
 mt is.formApiService.saveFtrFStructurr(payload)
}r}
```

---

## 🔄 FLOW 5: View Form Submissions (Route "/submissions")

### Data Flow
```
Navigate to /submissions
    ↓
Load all forms in dropdown
    ↓
Load first form's submissions
    ↓
GET /api/forms/:formId/submissions
    ↓
Build table columns from JSON keys
    ↓
Display submissions in table
    ↓
User can search and export to Excel
```

### Component Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `availableForms` | Array | Forms dropdown |
| `allSubmissions` | Array | All submissions from API |
| `filteredSubmissions` | Array | After search filter |
| `tableHeaders` | Array | Dynamic column names |
| `searchTerm` | String | Search input |
| `isLoading` | Boolean | Loading state |

### Template Structure

```html
<!-- Form selection dropdown -->
<select [value]="selectedFormId" (change)="onFormChange($event)">
  <option *ngFor="let form of availableForms" [value]="form.id">
    {{ form.form_name }} ({{ form.submission_count }} entries)
  </option>
</select>

<!-- Export button -->
<button *ngIf="filteredSubmissions.length > 0" (click)="exportToExcel()">
  Export to Excel
</button>

<!-- Search box: Two-way binding -->
<input type="text" 
       [(ngModel)]="searchTerm" 
       (input)="filterSubmissions()" 
       placeholder="Search entries...">

<!-- Loading/Error -->
<div *ngIf="isLoading">Fetching...</div>
<div *ngIf="errorMessage">{{ errorMessage }}</div>

<!-- Dynamic Table -->
<table *ngIf="filteredSubmissions.length > 0">
  <thead>
    <tr>
      <th>ID</th>
      <!-- Dynamic headers from JSON keys -->
      <th *ngFor="let key of tableHeaders">{{ key }}</th>
      <th>Submitted At</th>
    </tr>
  </thead>
  <tbody>
    <!-- Dynamic rows -->
    <tr *ngFor="let row of filteredSubmissions; let i = index">
      <td>#{{ row.id }}</td>
      <!-- Dynamic cells -->
      <td *ngFor="let key of tableHeaders">
        {{ row.submission_data[key] || '-' }}
      </td>
      <td>{{ row.submitted_at | date:'medium' }}</td>
    </tr>
  </tbody>
</table>
```

### Search Filter Logic

```typescript
filterSubmissions(): void {
  // If search empty: show all
  if (!this.searchTerm.trim()) {
    this.filteredSubmissions = this.allSubmissions;
    return;
  }

  // Filter by search term
  this.filteredSubmissions = this.allSubmissions.filter(row => {
    const term = this.searchTerm.toLowerCase();
    
    // Check ID
    if (String(row.id).includes(term)) return true;
    
    // Check date
    if (new Date(row.submitted_at).toLocaleString().includes(term)) return true;
    
    // Check all field values
    return Object.values(row.submission_data || {}).some(val =>
      String(val).toLowerCase().includes(term)
    );
  });
}
```

---

## 🔄 FLOW 6: Delete Form

### Data Flow
```
Click "Delete Form" button
    ↓
Show confirmation dialog
    ↓
User confirms
    ↓
DELETE /api/forms/:id
    ↓
Backend deletes submissions first (cascade)
    ↓
Then deletes form
    ↓
Reload forms list
```

### Component Code

```typescript
deleteCurrentForm(): void {
  const confirm = window.confirm('Delete this form and all submissions?');
  
  if (confirm) {
    this.formApiService.deleteForm(this.selectedFormId).subscribe({
      next: () => {
        alert('Form deleted');
        this.loadAllForms();  // Reload list
      },
      error: () => alert('Delete failed')
    });
  }
}
```

### Backend Code

```javascript
deleteForm(req, res) {
  const { id } = req.params;
  
  // Delete submissions first
  DELETE FROM form_submissions WHERE form_id = id;
  
  // Delete form
  DELETE FROM forms WHERE id = id;
  
  return success response;
}
```

---

## 📊 Quick Reference: All Routes

| Method | URL | Controller | Purpose |
|--------|-----|-----------|---------|
| GET | /api/forms | getAllForms() | Get all forms with counts |
| POST | /api/forms | createFormLayout() | Create new form |
| GET | /api/forms/:formName | getFormLayout() | Get form structure |
| POST | /api/forms/submit | submitFormData() | Submit form response |
| GET | /api/forms/:formId/submissions | getFormSubmissions() | Get submissions |
| PUT | /api/forms/:id | updateFormLayout() | Update form |
| DELETE | /api/forms/:id | deleteForm() | Delete form |

---

## 🎯 Template Binding Cheat Sheet

### Two-Way Binding
```html
[(ngModel)]="variableName"  <!-- Input updates variable, variable updates input -->
```

### Property Binding
```html
[property]="variable"       <!-- Component → HTML (one-way) -->
```

### Event Binding
```html
(eventName)="function()"    <!-- HTML → Component (one-way) -->
```

### Structural Directives
```html
*ngIf="condition"           <!-- Show/hide based on condition -->
*ngFor="let item of array"  <!-- Loop through array -->
[formGroupName]="index"     <!-- Link FormGroup in FormArray -->
formControlName="name"      <!-- Link FormControl to form -->
```

### Conditional Styling
```html
[style.property]="condition ? 'value1' : 'value2'"
[class.className]="condition"
```

### Interpolation & Pipes
```html
{{ variable }}              <!-- Show variable value -->
{{ variable | date:'medium' }}  <!-- Format with pipe -->
{{ variable || 'default' }} <!-- Show default if null -->
```

---

## 🔑 Key Concepts

### **Reactive Forms**
- Create form structure in component code
- Strong type safety
- Easy to validate and access values
- Use `FormGroup`, `FormArray`, `FormControl`

### **FormGroup & FormArray**
```typescript
FormGroup {
  form_name: FormControl,
  description: FormControl,
  fields: FormArray [
    FormGroup { name, label, type, ... },  // Field 1
    FormGroup { name, label, type, ... }   // Field 2
  ]
}
```

### **Validation Flow**
1. User fills field
2. Validators run (required, email, min, max, pattern)
3. If invalid & touched: Error shows
4. Submit checks `form.valid` before API call

### **Two-Way vs One-Way Binding**
- `[(ngModel)]="term"` - Two-way (input ↔ component)
- `[value]="term"` - One-way (component → input)
- `(change)="func()"` - One-way (input → component)

### **Template vs Component**
- **Template (.html)**: What user sees
- **Component (.ts)**: Business logic and data
- **Binding**: Connection between them

---

## 💡 Quick Tips

✅ Use `*ngIf` to show/hide elements  
✅ Use `*ngFor` to loop and render lists  
✅ Use `[formGroupName]` to organize nested forms  
✅ Use `.valid` to check form validity  
✅ Use `.touched` to show errors only after interaction  
✅ Use `| date` pipe to format timestamps  
✅ Use `markAllAsTouched()` to show all errors at once  
✅ Use `reset()` to clear form after submit  
✅ Use `subscribe()` to handle API responses  

---

**Document Version:** 1.0 - Simplified  
**Last Updated:** 2026-08-17  
**Project:** Dynamic Forms Management System
