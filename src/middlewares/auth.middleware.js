export const requireAuthView = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'No tiene permisos para acceder a este recurso',
      });
    }
    next();
  };
};
