const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../supabase');

const verifyTokenAndRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'No token provided' });
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
      
      // Fetch user role from DB
      const { data: user, error } = await supabaseAdmin
        .from('usuarios')
        .select('*, roles(nombre)')
        .eq('id', decoded.sub)
        .single();
        
      if (error || !user) return res.status(401).json({ error: 'User not found in DB' });
      
      const userRole = user.roles.nombre;
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }
      
      req.user = { id: decoded.sub, email: decoded.email, role: userRole, dbUser: user };
      req.token = token; // Passed to createAuthClient later
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = { verifyTokenAndRole };
