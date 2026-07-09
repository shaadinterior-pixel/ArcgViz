const supabaseUrl = 'https://bmtqeiwqokpieehdcycb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdHFlaXdxb2twaWVlaGRjeWNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk1Nzg1MSwiZXhwIjoyMDk3NTMzODUxfQ.f0_YLxYesCHk6nLkIBaVRMrLfycENmgfGxR23zbwEpA';

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function updateTable(table, oldPlan, newPlan) {
  console.log(`Updating ${table} from ${oldPlan} to ${newPlan}...`);
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?plan=eq.${oldPlan}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ plan: newPlan })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Error updating ${table}:`, errorText);
  } else {
    const data = await res.json();
    console.log(`Successfully updated ${data.length} records in ${table}.`);
  }
}

async function testInsertPaid() {
  console.log("Testing if 'Paid' plan is allowed by the database schema...");
  const dummyProduct = {
    id: 'dummy-test-1234',
    name: 'Dummy Test',
    slug: 'dummy-test',
    price: '0',
    category: 'Test',
    status: 'Draft',
    plan: 'Paid'
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(dummyProduct)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Insert failed for 'Paid'! Error:", errorText);
  } else {
    console.log("Insert succeeded for 'Paid'! No database schema changes are needed for Paid.");
    // Cleanup
    await fetch(`${supabaseUrl}/rest/v1/products?id=eq.dummy-test-1234`, {
      method: 'DELETE',
      headers
    });
    console.log("Cleaned up dummy product.");
  }
}

async function run() {
  await updateTable('products', 'Plus', 'Pro');
  await updateTable('customers', 'Plus', 'Pro');
  await testInsertPaid();
}

run();
