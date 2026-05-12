const { supabaseAdmin } = require('../supabase');

const verifyTokenAndRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'No token provided' });
      
      const token = authHeader.split(' ')[1];
      
      // Use Supabase to verify the token securely without needing the JWT_SECRET locally
      const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !authUser) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Fetch user role from DB
      const { data: user, error } = await supabaseAdmin
        .from('usuarios')
        .select('*, roles(nombre)')
        .eq('id', authUser.id)
        .single();
        
      if (error || !user) return res.status(401).json({ error: 'User not found in DB' });
      
      const userRole = user.roles.nombre;
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }
      
      req.user = { id: authUser.id, email: authUser.email, role: userRole, dbUser: user };
      req.token = token;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = { verifyTokenAndRole };
