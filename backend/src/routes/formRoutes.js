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

// 1. Base routes
router.get('/', getAllForms);
router.post('/', createFormLayout);

// 2. Static POST route for form submissions (MUST be above /:formName)
router.post('/submit', submitFormData);

// 3. Dynamic parameter routes
router.get('/:formId/submissions', getFormSubmissions);
router.get('/:formName', getFormLayout);

router.put('/:id', updateFormLayout);     // <-- Add Edit Route
router.delete('/:id', deleteForm);         // <-- Add Delete Route

module.exports = router;