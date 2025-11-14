-- Add station_owner to persona_type enum
ALTER TYPE persona_type ADD VALUE IF NOT EXISTS 'station_owner';

-- Create stations table
CREATE TABLE public.stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  base_price_per_kwh NUMERIC NOT NULL,
  auto_pricing_on BOOLEAN DEFAULT false,
  power_kw NUMERIC NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create charging_points table
CREATE TABLE public.charging_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  connector_type TEXT NOT NULL,
  availability TEXT NOT NULL DEFAULT 'available',
  last_session_at TIMESTAMP WITH TIME ZONE,
  firmware_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create station_revenue table
CREATE TABLE public.station_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  total_kwh NUMERIC NOT NULL DEFAULT 0,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  auto_pricing_events INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(station_id, period_start, period_end)
);

-- Add station and charging point references to sessions
ALTER TABLE public.sessions
  ADD COLUMN station_id UUID REFERENCES public.stations(id),
  ADD COLUMN charging_point_id UUID REFERENCES public.charging_points(id),
  ADD COLUMN dynamic_price_per_kwh NUMERIC;

-- Enable RLS
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charging_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_revenue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stations
CREATE POLICY "Station owners can manage their own stations"
  ON public.stations
  FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view active stations"
  ON public.stations
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage all stations"
  ON public.stations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for charging_points
CREATE POLICY "Station owners can manage their charging points"
  ON public.charging_points
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stations
      WHERE stations.id = charging_points.station_id
      AND stations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view available charging points"
  ON public.charging_points
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stations
      WHERE stations.id = charging_points.station_id
      AND stations.status = 'active'
    )
  );

-- RLS Policies for station_revenue
CREATE POLICY "Station owners can view their revenue"
  ON public.station_revenue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stations
      WHERE stations.id = station_revenue.station_id
      AND stations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all revenue"
  ON public.station_revenue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_stations_updated_at
  BEFORE UPDATE ON public.stations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_charging_points_updated_at
  BEFORE UPDATE ON public.charging_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create materialized view for station daily revenue
CREATE MATERIALIZED VIEW public.station_daily_revenue AS
SELECT 
  s.id as station_id,
  s.name as station_name,
  DATE(r.created_at) as date,
  COUNT(r.id) as sessions_count,
  SUM(r.kwh_requested) as total_kwh,
  SUM(r.total_price) as total_revenue,
  AVG(r.price_per_kwh) as avg_price_per_kwh
FROM public.stations s
LEFT JOIN public.sessions ses ON ses.station_id = s.id
LEFT JOIN public.reservations r ON r.session_id = ses.id
WHERE r.status = 'completed'
GROUP BY s.id, s.name, DATE(r.created_at);

-- Create index for better performance
CREATE INDEX idx_stations_owner_id ON public.stations(owner_id);
CREATE INDEX idx_charging_points_station_id ON public.charging_points(station_id);
CREATE INDEX idx_sessions_station_id ON public.sessions(station_id);
CREATE INDEX idx_sessions_charging_point_id ON public.sessions(charging_point_id);
CREATE INDEX idx_station_revenue_station_id ON public.station_revenue(station_id);