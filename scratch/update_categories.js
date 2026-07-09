const supabaseUrl = 'https://bmtqeiwqokpieehdcycb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdHFlaXdxb2twaWVlaGRjeWNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk1Nzg1MSwiZXhwIjoyMDk3NTMzODUxfQ.f0_YLxYesCHk6nLkIBaVRMrLfycENmgfGxR23zbwEpA';

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

function generateId(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
}

const newCategoryTitles = [
  'INTERIOR / EXTERIOR DESIGN AND WORK',
  '3D MODEL & PRODUCT DESIGN',
  'DIGITAL MARKETING',
  'ADVERTISEMENT',
  'COMPANY BRANDING',
  'WEBSITE / APPS / SOFTWARE',
  'ANIMATION',
  'MOTION GRAPHIC',
  'GRAPHIC DESIGN',
  'VIDEO EDITING',
  'PRINTING WORK'
];

async function run() {
  console.log("Deleting existing categories...");
  // Note: we can't delete without a filter unless we pass a filter that matches everything, e.g. ?id=not.is.null
  let res = await fetch(`${supabaseUrl}/rest/v1/categories?id=not.is.null`, {
    method: 'DELETE',
    headers
  });
  
  if (!res.ok) {
    console.error("Failed to delete categories:", await res.text());
    return;
  }
  
  console.log("Deleted existing categories.");

  const categoriesToInsert = newCategoryTitles.map(title => ({
    id: generateId(title),
    title,
    description: '',
    cards: [],
    subcategories: []
  }));

  console.log("Inserting new categories...");
  res = await fetch(`${supabaseUrl}/rest/v1/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify(categoriesToInsert)
  });

  if (!res.ok) {
    console.error("Failed to insert categories:", await res.text());
    return;
  }
  
  console.log(`Successfully inserted ${categoriesToInsert.length} new categories!`);
}

run();
