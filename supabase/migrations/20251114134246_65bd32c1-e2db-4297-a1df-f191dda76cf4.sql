-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'host', 'partner');
CREATE TYPE public.persona_type AS ENUM ('amal', 'mehdi', 'youssef', 'fatma', 'hatem', 'sana');
CREATE TYPE public.session_status AS ENUM ('available', 'reserved', 'active', 'completed', 'cancelled');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- Users roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  persona persona_type,
  zone TEXT,
  phone TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  tutorial_completed BOOLEAN DEFAULT FALSE,
  credits_kwh DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Hosts table
CREATE TABLE public.hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  zone TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  capacity_kw DECIMAL(10,2) NOT NULL,
  base_price_per_kwh DECIMAL(10,4) NOT NULL,
  auto_pricing_on BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hosts"
  ON public.hosts FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can manage their own hosts"
  ON public.hosts FOR ALL
  USING (auth.uid() = user_id);

-- Sessions table (charging slots)
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  available_kw DECIMAL(10,2) NOT NULL,
  price_per_kwh DECIMAL(10,4) NOT NULL,
  status session_status DEFAULT 'available',
  reserved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reserved_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_host_time ON public.sessions(host_id, start_time);
CREATE INDEX idx_sessions_status ON public.sessions(status);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available sessions"
  ON public.sessions FOR SELECT
  USING (status = 'available' OR auth.uid() = reserved_by OR auth.uid() IN (SELECT user_id FROM public.hosts WHERE id = host_id));

CREATE POLICY "Host owners can manage sessions"
  ON public.sessions FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.hosts WHERE id = host_id));

-- Reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kwh_requested DECIMAL(10,2) NOT NULL,
  price_per_kwh DECIMAL(10,4) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  credits_used DECIMAL(10,2) DEFAULT 0,
  status reservation_status DEFAULT 'pending',
  is_priority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_reservations_user ON public.reservations(user_id);
CREATE INDEX idx_reservations_session ON public.reservations(session_id);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reservations"
  ON public.reservations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT h.user_id FROM public.hosts h 
    JOIN public.sessions s ON s.host_id = h.id 
    WHERE s.id = session_id
  ));

CREATE POLICY "Users can create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  referrer_credited BOOLEAN DEFAULT FALSE,
  referred_credited BOOLEAN DEFAULT FALSE,
  first_session_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_referrals_code ON public.referrals(code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Events table (analytics)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_data JSONB,
  persona persona_type,
  zone TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_user ON public.events(user_id);
CREATE INDEX idx_events_name ON public.events(event_name);
CREATE INDEX idx_events_created ON public.events(created_at);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all events"
  ON public.events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Costs table (CAC tracking)
CREATE TABLE public.costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  total_cost DECIMAL(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage costs"
  ON public.costs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Feature flags table
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0,
  zone_filter TEXT[],
  persona_filter persona_type[],
  config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active feature flags"
  ON public.feature_flags FOR SELECT
  USING (enabled = TRUE);

-- Auto-update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hosts_updated_at BEFORE UPDATE ON public.hosts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, created_at)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();