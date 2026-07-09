const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bmtqeiwqokpieehdcycb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdHFlaXdxb2twaWVlaGRjeWNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk1Nzg1MSwiZXhwIjoyMDk3NTMzODUxfQ.f0_YLxYesCHk6nLkIBaVRMrLfycENmgfGxR23zbwEpA'; // Using service role key to bypass RLS

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Updating products from Plus to Pro...");
  const { data: pData, error: pError } = await supabase
    .from('products')
    .update({ plan: 'Pro' })
    .eq('plan', 'Plus')
    .select();
    
  if (pError) console.error("Error updating products:", pError);
  else console.log(`Successfully updated ${pData.length} products.`);

  console.log("Updating customers from Plus to Pro...");
  const { data: cData, error: cError } = await supabase
    .from('customers')
    .update({ plan: 'Pro' })
    .eq('plan', 'Plus')
    .select();
    
  if (cError) console.error("Error updating customers:", cError);
  else console.log(`Successfully updated ${cData.length} customers.`);

  // Let's test inserting "Paid"
  const dummyProduct = {
    id: 'dummy-test-1234',
    name: 'Dummy Test',
    slug: 'dummy-test',
    price: '0',
    category: 'Test',
    status: 'Draft',
    plan: 'Paid'
  };

  console.log("Testing if 'Paid' plan is allowed by the database schema...");
  const { error: insertError } = await supabase.from('products').insert([dummyProduct]);
  if (insertError) {
    console.error("Insert failed for 'Paid'! Error:", insertError.message, insertError.details, insertError.hint);
  } else {
    console.log("Insert succeeded for 'Paid'! No database schema changes are needed for Paid.");
    await supabase.from('products').delete().eq('id', 'dummy-test-1234');
  }
}

run();
