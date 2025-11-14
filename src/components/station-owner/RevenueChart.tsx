import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RevenueChartProps {
  userId?: string;
}

export function RevenueChart({ userId }: RevenueChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadRevenueData();
    }
  }, [userId]);

  const loadRevenueData = async () => {
    try {
      // Get last 7 days of revenue
      const { data: stations } = await supabase
        .from('stations')
        .select('id')
        .eq('owner_id', userId);

      if (!stations || stations.length === 0) {
        setLoading(false);
        return;
      }

      const stationIds = stations.map(s => s.id);
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const { data: revenueData } = await supabase
        .from('station_revenue')
        .select('period_start, total_revenue')
        .in('station_id', stationIds)
        .gte('period_start', last7Days[0])
        .order('period_start', { ascending: true });

      // Group by date
      const grouped = last7Days.map(date => {
        const dayRevenue = revenueData?.filter(r => r.period_start === date)
          .reduce((sum, r) => sum + Number(r.total_revenue), 0) || 0;
        
        return {
          date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
          revenue: dayRevenue
        };
      });

      setData(grouped);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenus (7 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenus (7 derniers jours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
