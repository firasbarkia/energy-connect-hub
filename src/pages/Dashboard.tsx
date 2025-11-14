import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSignups: 0,
    activationsJ7: 0,
    activationsJ14: 0,
    totalRevenue: 0,
    averageCAC: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // This is a simplified version - in production you'd query actual analytics views
      const { count: signups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activatedJ7 } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: reservations } = await supabase
        .from('reservations')
        .select('total_price');

      const totalRevenue = reservations?.reduce((sum, r) => sum + Number(r.total_price), 0) || 0;

      setStats({
        totalSignups: signups || 0,
        activationsJ7: activatedJ7 || 0,
        activationsJ14: Math.round((activatedJ7 || 0) * 1.5), // Simulation
        totalRevenue,
        averageCAC: totalRevenue > 0 ? totalRevenue / (signups || 1) : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

        {loading ? (
          <div className="text-center py-12">Chargement des statistiques...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Inscriptions</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSignups}</div>
                <p className="text-xs text-muted-foreground">Total signups</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Activation J+7</CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activationsJ7}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalSignups > 0 
                    ? `${Math.round((stats.activationsJ7 / stats.totalSignups) * 100)}%`
                    : '0%'
                  } des inscrits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Activation J+14</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activationsJ14}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalSignups > 0 
                    ? `${Math.round((stats.activationsJ14 / stats.totalSignups) * 100)}%`
                    : '0%'
                  } des inscrits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">CAC Moyen</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageCAC.toFixed(2)}€</div>
                <p className="text-xs text-muted-foreground">Par utilisateur</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Vue d'ensemble</CardTitle>
            <CardDescription>
              Métriques clés de performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenu total</span>
                <span className="text-lg font-bold text-primary">{stats.totalRevenue.toFixed(2)}€</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taux de conversion (signup → J+7)</span>
                <span className="text-lg font-bold">
                  {stats.totalSignups > 0 
                    ? `${Math.round((stats.activationsJ7 / stats.totalSignups) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LTV estimé (3 mois)</span>
                <span className="text-lg font-bold">
                  {(stats.averageCAC * 3).toFixed(2)}€
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
