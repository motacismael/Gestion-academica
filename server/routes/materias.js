const express = require('express');
const { supabaseAdmin, createAuthClient } = require('../supabase');
const { verifyTokenAndRole } = require('../middleware/auth');
const router = express.Router();

// Get materias
router.get('/', verifyTokenAndRole(), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('materias')
    .select('*, usuarios!profesor_id(id, nombre, apellido)');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create materia
router.post('/', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { nombre, descripcion, profesor_id } = req.body;
  const finalProfesorId = req.user.role === 'profesor' ? req.user.id : (profesor_id || req.user.id);

  const { data, error } = await supabaseAdmin
    .from('materias')
    .insert([{ nombre, descripcion, profesor_id: finalProfesorId }])
    .select('*, usuarios!profesor_id(id, nombre, apellido)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Update materia
router.put('/:id', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { nombre, descripcion } = req.body;
  const { id } = req.params;

  if (req.user.role === 'profesor') {
    const { data: materia } = await supabaseAdmin.from('materias').select('profesor_id').eq('id', id).single();
    if (!materia || materia.profesor_id !== req.user.id) {
      return res.status(403).json({ error: 'No puedes editar materia de otro profesor' });
    }
  }

  const { data, error } = await supabaseAdmin
    .from('materias')
    .update({ nombre, descripcion })
    .eq('id', id)
    .select('*, usuarios!profesor_id(id, nombre, apellido)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete materia
router.delete('/:id', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { id } = req.params;

  if (req.user.role === 'profesor') {
    const { data: materia } = await supabaseAdmin.from('materias').select('profesor_id').eq('id', id).single();
    if (!materia || materia.profesor_id !== req.user.id) {
      return res.status(403).json({ error: 'No puedes eliminar materia de otro profesor' });
    }
  }

  const { error } = await supabaseAdmin.from('materias').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Materia eliminada' });
});

module.exports = router;
