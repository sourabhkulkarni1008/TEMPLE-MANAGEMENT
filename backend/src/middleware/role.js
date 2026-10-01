/**
 * Middleware to restrict route access to specific roles
 * @param {...string} allowedRoles - E.g. 'ADMIN', 'STAFF', 'PILGRIM'
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is: ${req.user.role}.`
      });
    }

    next();
  };
};
