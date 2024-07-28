import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const router = Router();

// Asegúrate de que esto venga de una variable de entorno en producción
const JWT_SECRET = process.env.JWT_SECRET || 'aguantecolocolo';

// Ruta para iniciar sesión
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }



    // Comparación directa de contraseñas (deberías usar bcrypt en producción)

    if (password !== user.password) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Si la autenticación es exitosa, genera y envía el token
    const token = jwt.sign(

      { id: user._id, username: user.username, email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Mostrar en consola los datos del usuario autenticado
    console.log(`Usuario autenticado: ${user.username}, Email: ${user.email}, Roles: ${user.roles}`);
    
    // Asegúrate de incluir todos los datos en la respuesta
    res.json({ 
      token, 
      username: user.username, 
      email: user.email, 
      roles: user.roles 
    });

  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;
