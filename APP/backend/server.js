import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware de logging para solicitudes
app.use((req, res, next) => {
  console.log(`Solicitud: ${req.method} ${req.url}`);
  console.log('Cuerpo:', req.body);
  console.log('Cabeceras:', req.headers);
  next();
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Conexión a MongoDB
mongoose.connect('mongodb+srv://admin2:qsk51KtuThvJ41TF@bdd-app.1d5eqkc.mongodb.net/?retryWrites=true&w=majority&appName=BDD-APP', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Ruta predeterminada
app.get('/', (req, res) => {
  res.send('Conectado con el backend de pana');
});

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
