import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';

// Registro de usuario
export const signUp = async (req, res) => {
  const { username, email, password } = req.body;

  // Crea un nuevo usuario
  const newUser = new User({
    username,
    email,
    password: await User.encryptPassword(password)
  });

  const savedUser = await newUser.save();

  // Genera un token
  const token = jwt.sign({ id: savedUser._id }, config.SECRET, {
    expiresIn: 86400 // 24 horas
  });

  res.status(200).json({ token });
};

// Inicio de sesión
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  const userFound = await User.findOne({ email });
  if (!userFound) return res.status(400).json({ message: "User Not Found" });

  const matchPassword = await User.comparePassword(password, userFound.password);
  if (!matchPassword) return res.status(401).json({ token: null, message: "Invalid Password" });

  const token = jwt.sign({ id: userFound._id }, config.SECRET, {
    expiresIn: 86400 // 24 horas
  });

  res.json({ token });
};
