const dbPool = require('../config/db');

/**
 * Creates a new dynamic form layout configuration in the MySQL database.
 * POST /api/forms
 */
const createFormLayout = async (req, res) => {
  try {
    const { form_name, description, fields, created_by } = req.body;

    if (!form_name || !fields) {
      return res.status(400).json({ 
        success: false, 
        message: 'form_name and fields are required.' 
      });
    }

    const fieldsJson = typeof fields === 'string' ? fields : JSON.stringify(fields);

    const query = `
      INSERT INTO forms (form_name, description, fields, created_by) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await dbPool.query(query, [
      form_name, 
      description || null, 
      fieldsJson, 
      created_by || null
    ]);

    return res.status(201).json({
      success: true,
      message: 'Dynamic form configuration saved successfully!',
      formId: result.insertId
    });

  } catch (error) {
    console.error('[Controller Error - createFormLayout]:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false, 
        message: 'A form layout with this name already exists.' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error. Failed to store form layout.' 
    });
  }
};

/**
 * Fetches a single dynamic form layout structure by form name.
 * GET /api/forms/:formName
 */
const getFormLayout = async (req, res) => {
  try {
    const { formName } = req.params;

    const query = `SELECT * FROM forms WHERE form_name = ? LIMIT 1`;
    const [rows] = await dbPool.query(query, [formName]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Form layout configuration not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('[Controller Error - getFormLayout]:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error. Failed to fetch form layout.' 
    });
  }
};

/**
 * Saves dynamic form entry responses into the form_submissions table.
 * POST /api/forms/submit
 */
const submitFormData = async (req, res) => {
  try {
    const { form_id, submission_data } = req.body;

    if (!form_id || !submission_data) {
      return res.status(400).json({
        success: false,
        message: 'form_id and submission_data are required.'
      });
    }

    const submissionJson = typeof submission_data === 'string' 
      ? submission_data 
      : JSON.stringify(submission_data);

    const query = `INSERT INTO form_submissions (form_id, submission_data) VALUES (?, ?)`;
    await dbPool.query(query, [form_id, submissionJson]);

    return res.status(201).json({
      success: true,
      message: 'Form submission saved successfully!'
    });

  } catch (error) {
    console.error('[Controller Error - submitFormData]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save form submission.'
    });
  }
};

/**
 * Fetches all available forms alongside total response submission counts.
 * GET /api/forms
 */
const getAllForms = async (req, res) => {
  try {
    // Left Join with form_submissions to aggregate live response metrics
    const query = `
      SELECT 
        f.id, 
        f.form_name, 
        f.description, 
        f.created_at,
        COUNT(s.id) AS submission_count
      FROM forms f
      LEFT JOIN form_submissions s ON f.id = s.form_id
      GROUP BY f.id
      ORDER BY f.id DESC
    `;
    const [rows] = await dbPool.query(query);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('[Controller Error - getAllForms]:', error);
    return res.status(500).json({
      success: true,
      message: 'Failed to fetch form list.'
    });
  }
};

/**
 * Fetches all user submissions for a specific form ID.
 * GET /api/forms/:formId/submissions
 */
const getFormSubmissions = async (req, res) => {
  try {
    const { formId } = req.params;

    const query = `
      SELECT id, form_id, submission_data, submitted_at 
      FROM form_submissions 
      WHERE form_id = ? 
      ORDER BY submitted_at DESC
    `;
    const [rows] = await dbPool.query(query, [formId]);

    const formattedRows = rows.map(row => ({
      ...row,
      submission_data: typeof row.submission_data === 'string' 
        ? JSON.parse(row.submission_data) 
        : row.submission_data
    }));

    return res.status(200).json({
      success: true,
      data: formattedRows
    });
  } catch (error) {
    console.error('[Controller Error - getFormSubmissions]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch form submissions.'
    });
  }
};

/**
 * Updates an existing form schema layout in MySQL.
 * PUT /api/forms/:id
 */
const updateFormLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { form_name, description, fields } = req.body;

    if (!form_name || !fields) {
      return res.status(400).json({
        success: false,
        message: 'form_name and fields are required.'
      });
    }

    const fieldsJson = typeof fields === 'string' ? fields : JSON.stringify(fields);

    const query = `
      UPDATE forms 
      SET form_name = ?, description = ?, fields = ? 
      WHERE id = ?
    `;

    const [result] = await dbPool.query(query, [
      form_name,
      description || null,
      fieldsJson,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Form structure updated successfully!'
    });
  } catch (error) {
    console.error('[Controller Error - updateFormLayout]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update form layout.' });
  }
};

/**
 * Deletes a form configuration and all associated submission records.
 * DELETE /api/forms/:id
 */
const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete associated entries first to keep MySQL relational integrity clean
    await dbPool.query(`DELETE FROM form_submissions WHERE form_id = ?`, [id]);
    
    const [result] = await dbPool.query(`DELETE FROM forms WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Form deleted successfully!'
    });
  } catch (error) {
    console.error('[Controller Error - deleteForm]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete form.' });
  }
};

module.exports = {
  createFormLayout,
  getFormLayout,
  getAllForms,
  submitFormData,
  getFormSubmissions,
  updateFormLayout,
  deleteForm
};