const express = require('express');
const { createAuthClient } = require('../supabase');
const { verifyTokenAndRole } = require('../middleware/auth');
const router = express.Router();

// Get assigned materias (RLS applies)
router.get('/', verifyTokenAndRole(), async (req, res) => {
  const authClient = createAuthClient(req.token);
  const { data, error } = await authClient
    .from('estudiante_materia')
    .select('*, materias(nombre, descripcion), usuarios!estudiante_id(nombre, apellido, matricula)');
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Assign materia to estudiante
router.post('/', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { estudiante_id, materia_id } = req.body;
  const authClient = createAuthClient(req.token);

  const { data, error } = await authClient
    .from('estudiante_materia')
    .insert([{ estudiante_id, materia_id }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Assign grade
router.put('/:id', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { calificacion } = req.body;
  const { id } = req.params;
  const authClient = createAuthClient(req.token);

  const { data, error } = await authClient
    .from('estudiante_materia')
    .update({ calificacion })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
