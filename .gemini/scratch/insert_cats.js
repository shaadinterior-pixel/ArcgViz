const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\n\r]+)/);

const url = urlMatch[1].trim() + '/rest/v1/categories';
const key = keyMatch[1].trim();

const categories = [
  "INTERIOR / EXTERIOR DESIGN AND WORK",
  "3D MODEL & PRODUCT DESIGN",
  "DIGITAL MARKETING",
  "ADVERTISEMENT",
  "COMPANY BRANDING",
  "WEBSITE / APPS / SOFTWARE",
  "ANIMATION",
  "MOTION GRAPHIC",
  "GRAPHIC DESIGN",
  "VIDEO EDITING",
  "PRINTING WORK"
];

function generateId(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
}

const payload = categories.map(c => ({
  id: generateId(c),
  title: c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '), // Title case
  description: '',
  cards: []
}));

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates' // Handle upsert essentially
  },
  body: JSON.stringify(payload)
}).then(async r => {
  if (!r.ok) {
    console.error('Error inserting:', await r.text());
  } else {
    console.log('Categories inserted successfully!');
  }
}).catch(console.error);
