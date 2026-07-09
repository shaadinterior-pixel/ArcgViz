require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // Query the information_schema using a raw SQL approach if possible, but via Supabase we might not have access.
  // Alternatively, try inserting a test product with 'Paid' plan and see the error.
  
  // Let's just do a select limit 1 to see the structure
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error("Error fetching product:", error);
  } else {
    console.log("Product columns:", Object.keys(data[0] || {}));
  }

  // To test if 'Paid' is valid, we can try to do a dry-run insert or just insert and delete a dummy record.
  const dummyProduct = {
    id: 'dummy-test-1234',
    name: 'Dummy Test',
    slug: 'dummy-test',
    price: '0',
    category: 'Test',
    status: 'Draft',
    plan: 'Paid'
  };

  console.log("Trying to insert dummy product with plan='Paid'...");
  const { error: insertError } = await supabase.from('products').insert([dummyProduct]);
  if (insertError) {
    console.error("Insert failed! Error:", insertError.message, insertError.details, insertError.hint);
  } else {
    console.log("Insert succeeded! This means the database ACCEPTS 'Paid' as a plan.");
    // clean up
    await supabase.from('products').delete().eq('id', 'dummy-test-1234');
    console.log("Cleaned up dummy product.");
  }
}

checkSchema();
