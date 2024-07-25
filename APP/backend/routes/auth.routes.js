import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const router = Router();

// Asegúrate de que esto venga de una variable de entorno en producción
const JWT_SECRET = process.env.JWT_SECRET || 'aguantecolocolo';

// En auth.routes.js

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comparación directa de contraseñas
    if (password !== user.password) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Si la autenticación es exitosa, genera y envía el token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;