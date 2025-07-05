// 📁 middlewares/role.middleware.js
export const requireRole = (...ro) => (req, res, next) => {
  if (!ro.includes(req.user.rol)) {
    return res.status(403).json({
      error: 'Acceso denegado',
      requerido: ro,
      actual: req.user.rol
    });
  }
  next();
};
