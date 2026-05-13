const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { supabaseAdmin } = require('./server/supabase.js');

async function test() {
  const { data, error } = await supabaseAdmin.from('usuarios').select('*, roles(*)');
  console.log(JSON.stringify(data, null, 2));
  if (error) console.log("Error:", error);
}
test();
