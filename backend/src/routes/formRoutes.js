const express = require('express');
const router = express.Router();
const { createFormLayout, getFormLayout } = require('../controllers/formController');

// Definition map for form configuration endpoints
router.post('/', createFormLayout);

router.get('/:formName', getFormLayout);

module.exports = router;