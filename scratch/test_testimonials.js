const supabaseUrl = 'https://bmtqeiwqokpieehdcycb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdHFlaXdxb2twaWVlaGRjeWNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk1Nzg1MSwiZXhwIjoyMDk3NTMzODUxfQ.f0_YLxYesCHk6nLkIBaVRMrLfycENmgfGxR23zbwEpA';

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function testTestimonials() {
  const dummyTestimonial = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test',
    role: 'Test Role',
    image: 'test.jpg',
    text: 'Test review',
    rating: 5
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/testimonials`, {
    method: 'POST',
    headers,
    body: JSON.stringify(dummyTestimonial)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Testimonials Insert Failed! Error:", errorText);
  } else {
    console.log("Testimonials Insert Succeeded!");
    // Cleanup
    await fetch(`${supabaseUrl}/rest/v1/testimonials?id=eq.123e4567-e89b-12d3-a456-426614174000`, {
      method: 'DELETE',
      headers
    });
  }
}

testTestimonials();
