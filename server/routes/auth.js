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

  const { data: dbUser } = await supabaseAdmin
    .from('usuarios')
    .select('*, roles(nombre)')
    .eq('id', data.user.id)
    .single();

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

module.exports = router;
