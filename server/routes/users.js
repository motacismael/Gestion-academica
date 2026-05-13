const express = require('express');
const { supabaseAdmin, createAuthClient } = require('../supabase');
const { verifyTokenAndRole } = require('../middleware/auth');
const router = express.Router();

// Get all users (RLS applies)
router.get('/', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('*, roles(nombre)');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create user
router.post('/', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { nombre, apellido, email, matricula, password, roleName } = req.body;

  if (req.user.role === 'profesor' && roleName !== 'estudiante') {
    return res.status(403).json({ error: 'Profesor solo puede crear estudiantes' });
  }

  try {
    const { data: roleData } = await supabaseAdmin.from('roles').select('id').eq('nombre', roleName).single();
    if (!roleData) return res.status(400).json({ error: 'Rol no válido' });

    const emailToUse = roleName === 'estudiante' ? `${matricula}@estudiante.local` : email;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      password,
      email_confirm: true
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const finalMatricula = (roleName === 'estudiante' && matricula) ? matricula : null;

    const { data: userData, error: dbError } = await supabaseAdmin.from('usuarios').insert([{
      id: authData.user.id,
      nombre,
      apellido,
      email: emailToUse,
      matricula: finalMatricula,
      rol_id: roleData.id
    }]).select('*, roles(nombre)').single();

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: dbError.message });
    }

    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Update user (nombre, apellido only)
router.put('/:id', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { nombre, apellido, password } = req.body;
  const { id } = req.params;

  // Profesor only edits estudiantes
  if (req.user.role === 'profesor') {
    const { data: target } = await supabaseAdmin.from('usuarios').select('*, roles(nombre)').eq('id', id).single();
    if (!target || target.roles.nombre !== 'estudiante') {
      return res.status(403).json({ error: 'Solo puedes editar estudiantes' });
    }
  }

  const updates = {};
  if (nombre) updates.nombre = nombre;
  if (apellido) updates.apellido = apellido;

  const { data, error } = await supabaseAdmin.from('usuarios').update(updates).eq('id', id).select('*, roles(nombre)').single();
  if (error) return res.status(400).json({ error: error.message });

  // Password reset if provided
  if (password && password.length >= 8) {
    await supabaseAdmin.auth.admin.updateUserById(id, { password });
  }

  res.json(data);
});

// Delete user
router.delete('/:id', verifyTokenAndRole(['superadmin']), async (req, res) => {
  const { id } = req.params;
  await supabaseAdmin.from('usuarios').delete().eq('id', id);
  await supabaseAdmin.auth.admin.deleteUser(id);
  res.json({ message: 'Usuario eliminado' });
});

module.exports = router;
