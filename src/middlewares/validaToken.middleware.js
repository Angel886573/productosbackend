import { TOKEN_SECRET } from '../config.js';
import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      message: ['No token. Autorización denegada']
    });
  }

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error('Token inválido:', err.message);
      return res.status(403).json({
        message: ['Token inválido']
      });
    }

    if (!user?.id) {
      return res.status(401).json({
        message: ['Usuario no válido en el token']
      });
    }

    req.user = user; // Aquí se habilita req.user.id
    next();
  });
};
