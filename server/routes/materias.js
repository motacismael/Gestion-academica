const express = require('express');
const { createAuthClient } = require('../supabase');
const { verifyTokenAndRole } = require('../middleware/auth');
const router = express.Router();

// Get materias (RLS applies)
router.get('/', verifyTokenAndRole(), async (req, res) => {
  const authClient = createAuthClient(req.token);
  const { data, error } = await authClient
    .from('materias')
    .select('*, usuarios!profesor_id(nombre, apellido)');
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create materia
router.post('/', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { nombre, descripcion, profesor_id } = req.body;
  const authClient = createAuthClient(req.token);
  
  const finalProfesorId = req.user.role === 'profesor' ? req.user.id : (profesor_id || req.user.id);

  const { data, error } = await authClient
    .from('materias')
    .insert([{ nombre, descripcion, profesor_id: finalProfesorId }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;
