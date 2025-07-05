import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.error('🔐 Error: Cabecera Authorization no encontrada');
      return res.status(401).json({ message: 'Cabecera Authorization requerida' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('🔐 Error: Token no presente en la cabecera Authorization');
      return res.status(401).json({ message: 'Token requerido' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Verificar que tenantId esté presente en el token
    if (!decoded.tenantId) {
      console.warn('🔐 Token inválido: falta tenantId');
      return res.status(401).json({ message: 'Token inválido: tenantId requerido' });
    }
    req.user = decoded; // id, rol, tenantId
    next();
  } catch (error) {
    console.error('🔐 Error al verificar token:', error.message);
    res.status(401).json({ message: 'Token inválido o expirado', error: error.message });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.user?.rol === 'admin') {
      return next();
    } else {
      console.warn('⛔ Acceso denegado: el rol del usuario no es admin');
      return res.status(403).json({ message: 'Acceso denegado: Se requiere rol de administrador' });
    }
  } catch (error) {
    console.error('⛔ Error al verificar rol del usuario:', error.message);
    res.status(500).json({ message: 'Error interno al verificar el rol', error: error.message });
  }
};
