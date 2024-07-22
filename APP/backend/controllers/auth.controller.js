import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config.js'; // Asegúrate de tener un archivo de configuración para las claves secretas y otros parámetros

// Registro de usuarios
export const signUp = async (req, res) => {
  const { username, email, password, roles } = req.body;

  try {
    const newUser = new User({
      username,
      email,
      password: await User.encryptPassword(password),
      roles
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id }, config.SECRET, {
      expiresIn: 86400 // 24 horas
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Inicio de sesión
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('roles');

    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const matchPassword = await User.comparePassword(password, user.password);

    if (!matchPassword) return res.status(401).json({ token: null, message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id }, config.SECRET, {
      expiresIn: 86400 // 24 horas
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
