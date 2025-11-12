-- Create editable_pages table
CREATE TABLE IF NOT EXISTS public.editable_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create page_blocks table
CREATE TABLE IF NOT EXISTS public.page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.editable_pages(id) ON DELETE CASCADE NOT NULL,
  block_type TEXT NOT NULL,
  block_data JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  position_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  published_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create education_tv_videos table
CREATE TABLE IF NOT EXISTS public.education_tv_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.editable_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_tv_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for editable_pages
CREATE POLICY "Anyone can view published pages" ON public.editable_pages
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage pages" ON public.editable_pages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for page_blocks
CREATE POLICY "Anyone can view blocks of published pages" ON public.page_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.editable_pages 
      WHERE id = page_blocks.page_id AND is_published = true
    )
  );

CREATE POLICY "Admins can manage blocks" ON public.page_blocks
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for team_members
CREATE POLICY "Anyone can view active team members" ON public.team_members
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for news_articles
CREATE POLICY "Anyone can view published articles" ON public.news_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage articles" ON public.news_articles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for gallery_items
CREATE POLICY "Anyone can view gallery items" ON public.gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gallery items" ON public.gallery_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for events
CREATE POLICY "Anyone can view published events" ON public.events
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for education_tv_videos
CREATE POLICY "Anyone can view published videos" ON public.education_tv_videos
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage videos" ON public.education_tv_videos
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_page_blocks_page_id ON public.page_blocks(page_id);
CREATE INDEX idx_page_blocks_position ON public.page_blocks(position);
CREATE INDEX idx_services_slug ON public.services(slug);
CREATE INDEX idx_news_articles_slug ON public.news_articles(slug);
CREATE INDEX idx_events_date ON public.events(event_date);

-- Insert initial editable pages
INSERT INTO public.editable_pages (page_key, title, slug, is_published) VALUES
  ('team', 'The Team', 'team', true),
  ('services', 'Services', 'services', true),
  ('news', 'News', 'news', true),
  ('gallery', 'Gallery', 'gallery', true),
  ('events', 'Events', 'events', true),
  ('education-tv', 'Education TV', 'education-tv', true)
ON CONFLICT (page_key) DO NOTHING;