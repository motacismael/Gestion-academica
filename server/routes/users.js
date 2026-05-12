const express = require('express');
const { supabaseAdmin, createAuthClient } = require('../supabase');
const { verifyTokenAndRole } = require('../middleware/auth');
const router = express.Router();

// Get all users (RLS applies)
router.get('/', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const authClient = createAuthClient(req.token);
  const { data, error } = await authClient
    .from('usuarios')
    .select('*, roles(nombre)');
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create user
router.post('/', verifyTokenAndRole(['superadmin', 'profesor']), async (req, res) => {
  const { nombre, apellido, email, matricula, password, roleName } = req.body;
  
  // Validation
  if (req.user.role === 'profesor' && roleName !== 'estudiante') {
    return res.status(403).json({ error: 'Profesor solo puede crear estudiantes' });
  }

  try {
    // Get role ID
    const { data: roleData } = await supabaseAdmin.from('roles').select('id').eq('nombre', roleName).single();
    if (!roleData) return res.status(400).json({ error: 'Rol no válido' });

    const emailToUse = roleName === 'estudiante' ? `${matricula}@estudiante.local` : email;

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      password: password,
      email_confirm: true
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // Insert into DB using caller's auth client (RLS applies)
    const authClient = createAuthClient(req.token);
    const { data: userData, error: dbError } = await authClient.from('usuarios').insert([{
      id: authData.user.id,
      nombre,
      apellido,
      email: emailToUse,
      matricula,
      rol_id: roleData.id
    }]).select().single();

    if (dbError) {
      // Rollback auth creation if DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: dbError.message });
    }

    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
