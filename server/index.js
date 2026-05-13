const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const { supabaseAdmin } = require('./supabase'); // Importar cliente de Supabase

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const materiaRoutes = require('./routes/materias');
const estudianteMateriaRoutes = require('./routes/estudiante_materia');

const app = express();
app.use(cors());
app.use(express.json());

// --- Endpoint de prueba solicitado ---
app.get('/datos', async (req, res) => {
  // Usamos supabaseAdmin (que usa la SERVICE_KEY) para saltarnos el RLS y poder leer los usuarios
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('*');

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});
// -------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/estudiante-materia', estudianteMateriaRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
