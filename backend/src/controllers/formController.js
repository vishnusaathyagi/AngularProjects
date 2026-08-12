const dbPool = require('../config/db');

/**
 * Controller to handle creating a new dynamic form layout config.
 * POST /api/forms
 */
const createFormLayout = async (req, res) => {
  try {
    const { form_name, description, fields, created_by } = req.body;

    // Validation check
    if (!form_name || !fields) {
      return res.status(400).json({ 
        success: false, 
        message: 'form_name and fields (JSON array) are required fields.' 
      });
    }

    // Insert query (Remember, MySQL handles JSON natively, but the mysql2 library 
    // requires us to pass JSON as a stringified structure or direct object depending on the driver configuration.
    // To be perfectly safe across driver updates, we stringify the JSON payload)
    const query = `
      INSERT INTO forms (form_name, description, fields, created_by) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await dbPool.query(query, [
      form_name, 
      description || null, 
      JSON.stringify(fields), 
      created_by || null
    ]);

    return res.status(201).json({
      success: true,
      message: 'Dynamic form configuration saved successfully!',
      formId: result.insertId
    });

  } catch (error) {
    console.error('[Controller Error - createFormLayout]:', error.message);
    
    // Handle duplicate key error for unique form_name field
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
 * Controller to handle fetching a dynamic form layout config by name.
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

    // Return the form configuration block safely
    return res.status(200).json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('[Controller Error - getFormLayout]:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error. Failed to fetch form layout.' 
    });
  }
};

module.exports = {
  createFormLayout,
  getFormLayout
};