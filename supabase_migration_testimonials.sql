-- 1. Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    image text NOT NULL,
    text text NOT NULL,
    rating integer DEFAULT 5,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Allow public read-only access for testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Allow all access to authenticated users for testimonials" ON public.testimonials FOR ALL USING (auth.role() = 'authenticated');

-- Insert default testimonials if empty
INSERT INTO public.testimonials (name, role, image, text, rating)
SELECT 'Priya Sharma', 'Founder, Bloom Decor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', 'Design Walla transformed our brand identity completely. The quality of the interior 3D renders was beyond our expectations. Absolute professionals!', 5
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials);

INSERT INTO public.testimonials (name, role, image, text, rating)
SELECT 'Rahul Verma', 'CEO, TechLaunch', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', 'The website template we purchased was so easy to customize. It looks premium and runs incredibly fast. I highly recommend their digital products.', 5
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE name = 'Rahul Verma');

INSERT INTO public.testimonials (name, role, image, text, rating)
SELECT 'Anita Desai', 'Marketing Director', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', 'We used their motion graphics for our ad campaign and the engagement doubled! The attention to detail and aesthetic sense is top-notch.', 5
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE name = 'Anita Desai');

INSERT INTO public.testimonials (name, role, image, text, rating)
SELECT 'Vikram Singh', 'Restaurateur', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', 'The food cart design they created for us is a crowd magnet. It''s functional, beautiful, and exactly what we envisioned. Brilliant team!', 5
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE name = 'Vikram Singh');

INSERT INTO public.testimonials (name, role, image, text, rating)
SELECT 'Neha Gupta', 'Creative Head', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', 'I regularly buy their 3D models and brand kits. It saves me hours of work, and the quality is consistently premium. A must-have resource.', 5
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE name = 'Neha Gupta');

-- 2. Clear and seed services table
DELETE FROM public.services;

INSERT INTO public.services (id, category, title, tagline, image, description, includes)
VALUES 
  ('s1', 'Interior / Exterior Design and Work', 'Interior / Exterior Design and Work', 'Spaces that speak. Structures that stay.', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200', 'End-to-end interior and exterior design & execution for homes, offices, retail, and hospitality. From concept mood-boards to on-site turnkey delivery — we craft spaces that carry your brand''s soul.', '["Residential & Commercial Interiors","Exterior Facade & Landscape","3D Walkthroughs & Renders","Turnkey Execution & Site Handover","Modular Furniture & Fit-outs","Vastu / Feng-shui Aligned Planning"]'::jsonb),
  ('s2', '3D Model & Product Design', '3D Modeling & Product Design', 'Bringing concepts to life in 3D.', 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=1200', 'High-fidelity 3D modeling for products, architectural visualization, and gaming assets. We deliver photorealistic renders and optimized geometries ready for production.', '["Photorealistic Product Rendering","Low-poly & High-poly Modeling","Texturing & Material Creation","3D Animation & Rigging","AR/VR Ready Assets"]'::jsonb),
  ('s3', 'Digital Marketing', 'Digital Marketing', 'Data-driven growth strategies.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200', 'Comprehensive digital marketing campaigns designed to scale your business. We combine creative storytelling with rigorous data analysis to maximize your ROI.', '["SEO & Content Marketing","Social Media Management","PPC & Paid Social Campaigns","Email & Retention Strategies","Conversion Rate Optimization"]'::jsonb),
  ('s4', 'Advertisement', 'Strategic Advertisement', 'Maximize your reach and impact.', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1200', 'Targeted advertising campaigns across digital and traditional platforms to maximize your brand''s visibility and conversion.', '["Media Planning & Buying","Print & Outdoor Advertising","Display & Programmatic Ads","Campaign Management","Ad Copy & Creatives"]'::jsonb),
  ('s5', 'Company Branding', 'Company Branding', 'Crafting memorable brand stories.', 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200', 'Strategic brand development from the ground up. We create cohesive visual identities, brand guidelines, and positioning strategies that resonate with your target audience.', '["Logo Design & Visual Identity","Brand Guidelines & Typography","Packaging Design","Brand Voice & Messaging","Stationery & Corporate Assets"]'::jsonb),
  ('s6', 'Website / Apps / Software', 'Website / Apps / Software', 'Building scalable digital experiences.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200', 'End-to-end development of high-performance websites, web applications, and mobile apps. We focus on intuitive UX, modern tech stacks, and scalable architectures.', '["UI/UX Design & Prototyping","Full-stack Web Development","iOS & Android Apps","E-commerce Solutions","Custom Software & SaaS"]'::jsonb),
  ('s7', 'Animation', '2D & 3D Animation', 'Bringing stories to life.', 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?auto=format&fit=crop&q=80&w=1200', 'Captivating animations that explain, entertain, and engage. We produce high-quality 2D and 3D animated content for various industries.', '["Explainer Videos","Character Animation","Product Animation","Whiteboard Animation","Storyboarding"]'::jsonb),
  ('s8', 'Motion Graphic', 'Motion Graphics', 'Movement that captures attention.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200', 'Sleek and modern motion graphics to enhance your digital presence. Perfect for social media, presentations, and broadcast.', '["Title Sequences","Logo Animation","UI/UX Animation","Promotional Videos","Lottie Animations"]'::jsonb),
  ('s9', 'Graphic Design', 'Graphic Design', 'Visuals that communicate powerfully.', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1200', 'Custom graphic design solutions that elevate your brand''s aesthetics across all touchpoints, from digital to print.', '["Social Media Creatives","Brochure & Flyer Design","Infographics","Poster Design","Illustration"]'::jsonb),
  ('s10', 'Video Editing', 'Video Editing', 'Crafting cinematic experiences.', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=1200', 'High-end post-production services. We seamlessly cut, color, and polish your raw footage into compelling video content.', '["Color Grading","Audio Mixing & Mastering","VFX & Compositing","Corporate Video Editing","Social Media Reels"]'::jsonb),
  ('s11', 'Printing Work', 'Printing Work', 'Tangible quality you can feel.', 'https://images.unsplash.com/photo-1563968743333-044cef800120?auto=format&fit=crop&q=80&w=1200', 'High-quality offset and digital printing services for all your marketing and corporate needs. We ensure vibrant colors and premium finishes.', '["Business Cards & Stationery","Brochures & Catalogs","Large Format Printing","Packaging Printing","Merchandise Printing"]'::jsonb);
