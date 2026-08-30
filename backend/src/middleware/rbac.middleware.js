// Middleware to verify active user role against allowed roles
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    // Read user role from request headers (sent by Angular HttpInterceptor)
    const userRole = req.headers['x-user-role'];

    if (!userRole) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Missing user role header' 
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Role '${userRole}' does not have access to this resource` 
      });
    }

    next();
  };
};

module.exports = { checkRole };