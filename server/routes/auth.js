const express = require('express');
const { supabaseAdmin, createAuthClient } = require('../supabase');
const { verifyTokenAndRole } = require('../middleware/auth');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { identificador, password } = req.body;
  if (!identificador || !password) return res.status(400).json({ error: 'Faltan credenciales' });

  const isMatricula = /^\d{9}$/.test(identificador);
  let emailToLogin = identificador;

  if (isMatricula) {
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('email')
      .eq('matricula', identificador)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    emailToLogin = user.email;
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email: emailToLogin,
    password
  });

  if (error || !data.user) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const { data: dbUser, error: dbError } = await supabaseAdmin
    .from('usuarios')
    .select('*, roles(nombre)')
    .eq('id', data.user.id)
    .single();

  if (dbError || !dbUser) {
    return res.status(401).json({ error: 'Usuario autenticado pero sin registro en la tabla de usuarios' });
  }

  res.json({
    token: data.session.access_token,
    user: {
      id: dbUser.id,
      nombre: dbUser.nombre,
      apellido: dbUser.apellido,
      rol: dbUser.roles.nombre,
      email: dbUser.email,
      matricula: dbUser.matricula
    }
  });
});

router.post('/change-password', verifyTokenAndRole(), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  // Verify current password by trying to log in
  const { error: loginError } = await supabaseAdmin.auth.signInWithPassword({
    email: req.user.email,
    password: currentPassword
  });

  if (loginError) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

  // Update password using the auth client instantiated with user token
  const authClient = createAuthClient(req.token);
  const { error: updateError } = await authClient.auth.updateUser({ password: newPassword });

  if (updateError) return res.status(500).json({ error: 'Error al cambiar contraseña' });

  res.json({ message: 'Contraseña actualizada' });
});

router.post('/register', async (req, res) => {
  const { nombre, apellido, matricula, password } = req.body;
  
  if (!nombre || !apellido || !matricula || !password) return res.status(400).json({ error: 'Faltan datos' });
  if (!/^\d{9}$/.test(matricula)) return res.status(400).json({ error: 'Matrícula debe tener 9 dígitos' });

  try {
    const emailToUse = `${matricula}@estudiante.local`;

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      password: password,
      email_confirm: true
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // Get role ID
    const { data: roleData } = await supabaseAdmin.from('roles').select('id').eq('nombre', 'estudiante').single();

    // Insert into DB
    const { error: dbError } = await supabaseAdmin.from('usuarios').insert([{
      id: authData.user.id,
      nombre,
      apellido,
      email: emailToUse,
      matricula,
      rol_id: roleData.id
    }]);

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: dbError.message });
    }

    res.status(201).json({ message: 'Registro exitoso' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
