require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PREMIUM_FALLBACKS = [
  '/portfolio-carousel/1.jpg',
  '/portfolio-carousel/2.jpg',
  '/portfolio-carousel/3.jpg',
  '/portfolio-carousel/4.jpg',
  '/portfolio-carousel/5.jpg',
  '/portfolio-carousel/6.jpg',
  '/portfolio-carousel/7.jpg',
  '/portfolio-carousel/8.jpg',
  '/portfolio-carousel/9.jpg',
  '/portfolio-carousel/10.jpg',
  '/portfolio-carousel/11.jpg',
  '/portfolio-carousel/12.jpg',
];

const DEFAULT_ITEMS = [
  { title: 'Project 1', image_url: PREMIUM_FALLBACKS[0], sort_order: 1 },
  { title: 'Project 2', image_url: PREMIUM_FALLBACKS[1], sort_order: 2 },
  { title: 'Project 3', image_url: PREMIUM_FALLBACKS[2], sort_order: 3 },
  { title: 'Project 4', image_url: PREMIUM_FALLBACKS[3], sort_order: 4 },
  { title: 'Project 5', image_url: PREMIUM_FALLBACKS[4], sort_order: 5 },
  { title: 'Project 6', image_url: PREMIUM_FALLBACKS[5], sort_order: 6 },
  { title: 'Project 7', image_url: PREMIUM_FALLBACKS[6], sort_order: 7 },
  { title: 'Project 8', image_url: PREMIUM_FALLBACKS[7], sort_order: 8 },
  { title: 'Project 9', image_url: PREMIUM_FALLBACKS[8], sort_order: 9 },
  { title: 'Project 10', image_url: PREMIUM_FALLBACKS[9], sort_order: 10 },
  { title: 'Project 11', image_url: PREMIUM_FALLBACKS[10], sort_order: 11 },
  { title: 'Project 12', image_url: PREMIUM_FALLBACKS[11], sort_order: 12 },
];

async function run() {
  console.log('Deleting existing portfolio items...');
  const { error: delError } = await supabase.from('portfolio_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) console.error('Delete error:', delError);

  console.log('Inserting 12 new items...');
  const items = DEFAULT_ITEMS.map(i => ({ ...i, id: crypto.randomUUID() }));
  const { error: insError } = await supabase.from('portfolio_items').insert(items);
  if (insError) console.error('Insert error:', insError);
  
  console.log('Done!');
}
run();
