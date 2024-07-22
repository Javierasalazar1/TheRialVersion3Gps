import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import config from './config.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Rutas
app.use('/api/auth', authRoutes);

// Inicio del servidor
const PORT = config.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});