const express = require('express');
const router = express.Router();
const { createFormLayout } = require('../controllers/formController');

// Definition map for form configuration endpoints
router.post('/', createFormLayout);

module.exports = router;