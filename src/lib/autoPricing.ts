import { supabase } from "./supabase";

interface AutoPricingParams {
  stationId: string;
  basePrice: number;
  currentHour: number;
}

interface DemandData {
  hour: number;
  avgSessions: number;
  avgRevenue: number;
}

/**
 * Algorithme d'auto-pricing dynamique basé sur:
 * - Taux d'occupation par heure
 * - Demande des dernières 24h
 * - Demande locale historique
 */
export async function calculateDynamicPrice({
  stationId,
  basePrice,
  currentHour,
}: AutoPricingParams): Promise<number> {
  try {
    // 1. Récupérer les sessions des 24 dernières heures
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('created_at, status')
      .eq('station_id', stationId)
      .gte('created_at', oneDayAgo);

    if (sessionsError) throw sessionsError;

    // 2. Calculer le taux d'occupation actuel
    const totalSessions = recentSessions?.length || 0;
    const completedSessions = recentSessions?.filter(s => s.status === 'completed').length || 0;
    const occupationRate = totalSessions > 0 ? completedSessions / totalSessions : 0;

    // 3. Récupérer les données historiques pour cette heure
    const { data: revenue, error: revenueError } = await supabase
      .from('station_revenue')
      .select('sessions_count, total_revenue')
      .eq('station_id', stationId)
      .order('period_start', { ascending: false })
      .limit(30); // 30 derniers jours

    if (revenueError) throw revenueError;

    // 4. Analyser la demande par heure
    const hourlyDemand = analyzeHourlyDemand(revenue || []);
    const currentHourDemand = hourlyDemand.find(d => d.hour === currentHour);
    const avgDemand = hourlyDemand.reduce((sum, d) => sum + d.avgSessions, 0) / hourlyDemand.length || 1;

    // 5. Calculer le multiplicateur de prix
    let priceMultiplier = 1.0;

    // Ajustement basé sur le taux d'occupation (±20%)
    if (occupationRate > 0.8) {
      priceMultiplier += 0.2; // +20% si occupation > 80%
    } else if (occupationRate > 0.6) {
      priceMultiplier += 0.1; // +10% si occupation > 60%
    } else if (occupationRate < 0.3) {
      priceMultiplier -= 0.15; // -15% si occupation < 30%
    }

    // Ajustement basé sur la demande horaire (±15%)
    if (currentHourDemand && avgDemand > 0) {
      const demandRatio = currentHourDemand.avgSessions / avgDemand;
      if (demandRatio > 1.5) {
        priceMultiplier += 0.15; // +15% si demande > 150% de la moyenne
      } else if (demandRatio < 0.7) {
        priceMultiplier -= 0.1; // -10% si demande < 70% de la moyenne
      }
    }

    // 6. Heures de pointe (7-9h et 17-20h) : +10%
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 20)) {
      priceMultiplier += 0.1;
    }

    // 7. Heures creuses (22h-6h) : -20%
    if (currentHour >= 22 || currentHour <= 6) {
      priceMultiplier -= 0.2;
    }

    // 8. Limiter les variations entre -30% et +40%
    priceMultiplier = Math.max(0.7, Math.min(1.4, priceMultiplier));

    // 9. Calculer le prix final arrondi à 2 décimales
    const dynamicPrice = Math.round(basePrice * priceMultiplier * 100) / 100;

    // 10. Logger l'événement d'auto-pricing
    await supabase.from('station_revenue').upsert({
      station_id: stationId,
      period_start: new Date().toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      auto_pricing_events: 1,
    });

    return dynamicPrice;
  } catch (error) {
    console.error('Error calculating dynamic price:', error);
    return basePrice;
  }
}

function analyzeHourlyDemand(revenueData: any[]): DemandData[] {
  const hourlyData: { [hour: number]: { sessions: number[]; revenue: number[] } } = {};

  // Initialiser pour chaque heure
  for (let h = 0; h < 24; h++) {
    hourlyData[h] = { sessions: [], revenue: [] };
  }

  // Agréger les données (simplifié - en production, parser les timestamps)
  revenueData.forEach(day => {
    const hour = new Date().getHours(); // Simplification
    if (hourlyData[hour]) {
      hourlyData[hour].sessions.push(day.sessions_count || 0);
      hourlyData[hour].revenue.push(day.total_revenue || 0);
    }
  });

  // Calculer les moyennes
  return Object.entries(hourlyData).map(([hour, data]) => ({
    hour: parseInt(hour),
    avgSessions: data.sessions.length > 0 
      ? data.sessions.reduce((a, b) => a + b, 0) / data.sessions.length 
      : 0,
    avgRevenue: data.revenue.length > 0 
      ? data.revenue.reduce((a, b) => a + b, 0) / data.revenue.length 
      : 0,
  }));
}
