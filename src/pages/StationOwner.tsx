import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Battery,
  DollarSign,
  TrendingUp,
  Zap,
  Plus,
  Settings,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { StationList } from "@/components/station-owner/StationList";
import { RevenueChart } from "@/components/station-owner/RevenueChart";
import { SessionsLive } from "@/components/station-owner/SessionsLive";
import { AutoPricingSettings } from "@/components/station-owner/AutoPricingSettings";
import { AddStationDialog } from "@/components/station-owner/AddStationDialog";

export default function StationOwner() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStations: 0,
    activeStations: 0,
    todayRevenue: 0,
    todaySessions: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      // Get stations count
      const { data: stations, error: stationsError } = await supabase
        .from('stations')
        .select('id, status')
        .eq('owner_id', user?.id);

      if (stationsError) throw stationsError;

      const totalStations = stations?.length || 0;
      const activeStations = stations?.filter(s => s.status === 'active').length || 0;

      // Get today's revenue
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData, error: todayError } = await supabase
        .from('station_revenue')
        .select('total_revenue, sessions_count')
        .gte('period_start', today)
        .in('station_id', stations?.map(s => s.id) || []);

      if (todayError) throw todayError;

      const todayRevenue = todayData?.reduce((sum, r) => sum + Number(r.total_revenue), 0) || 0;
      const todaySessions = todayData?.reduce((sum, r) => sum + r.sessions_count, 0) || 0;

      // Get total revenue
      const { data: totalData, error: totalError } = await supabase
        .from('station_revenue')
        .select('total_revenue')
        .in('station_id', stations?.map(s => s.id) || []);

      if (totalError) throw totalError;

      const totalRevenue = totalData?.reduce((sum, r) => sum + Number(r.total_revenue), 0) || 0;

      setStats({
        totalStations,
        activeStations,
        todayRevenue,
        todaySessions,
        totalRevenue
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Station Owner Dashboard</h1>
          <p className="text-muted-foreground">Gérez vos bornes et suivez vos revenus</p>
        </div>
        <AddStationDialog onStationAdded={loadStats} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stations actives</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStations}/{stats.totalStations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalStations} stations au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du jour</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayRevenue.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              {stats.todaySessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              Tous les temps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-pricing</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStations}</div>
            <p className="text-xs text-muted-foreground">
              Stations avec pricing dynamique
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="mr-2 h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="stations">
            <Battery className="mr-2 h-4 w-4" />
            Stations
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <Settings className="mr-2 h-4 w-4" />
            Auto-pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <RevenueChart userId={user?.id} />
            <SessionsLive userId={user?.id} />
          </div>
        </TabsContent>

        <TabsContent value="stations">
          <StationList userId={user?.id} onUpdate={loadStats} />
        </TabsContent>

        <TabsContent value="pricing">
          <AutoPricingSettings userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
