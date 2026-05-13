const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { supabaseAdmin } = require('./server/supabase.js');

async function fixRole() {
  const { data, error } = await supabaseAdmin
    .from('roles')
    .update({ nombre: 'superadmin' })
    .eq('nombre', 'admin');
    
  console.log("Update result:", error ? error : "Success!");
}
fixRole();
