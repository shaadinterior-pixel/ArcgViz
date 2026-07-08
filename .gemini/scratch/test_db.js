const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\n\r]+)/);

const url = urlMatch[1].trim() + '/rest/v1/products?select=*&limit=1';
const key = keyMatch[1].trim();

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
}).then(r => r.json()).then(data => {
  if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No data');
  }
});
