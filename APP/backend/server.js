import express from 'express';
import mongoose from 'mongoose';
import config from './config.js';
import authRoutes from './routes/auth.routes.js'; // Importa las rutas de autenticación
import bodyParser from 'body-parser';

const app = express();
const PORT = config.PORT || 4000; // Usa el puerto de config o 3000 por defecto

// Middleware
app.use(bodyParser.json()); // Para manejar datos en formato JSON

// Rutas
app.use('/api/auth', authRoutes);

// Conectar a MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('No se pudo conectar a MongoDB', err));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
