const express = require('express');
const router = express.Router();

// Destructure all controller functions
const { 
  createFormLayout, 
  getFormLayout, 
  getAllForms,
  submitFormData, 
  getFormSubmissions,
  updateFormLayout,
  deleteForm 
} = require('../controllers/formController');

// Import RBAC Middleware
const { checkRole } = require('../middleware/rbac.middleware');

// 1. Base routes
// Public / All Roles: View form schemas
router.get('/', getAllForms);

// Admin & Manager Only: Create new form layouts
router.post('/', checkRole(['Admin', 'Manager']), createFormLayout);

// 2. Static POST route for form submissions (All Roles / Users can submit)
router.post('/submit', submitFormData);

// 3. Dynamic parameter routes
// View form submissions (Admin & Manager Only)
router.get('/:formId/submissions', checkRole(['Admin', 'Manager']), getFormSubmissions);

// View individual form schema layout (All Roles)
router.get('/:formName', getFormLayout);

// Admin Only: Edit or Delete existing form schemas
router.put('/:id', checkRole(['Admin']), updateFormLayout);
router.delete('/:id', checkRole(['Admin']), deleteForm);

module.exports = router;