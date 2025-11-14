import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, Info } from "lucide-react";

interface Station {
  id: string;
  name: string;
  auto_pricing_on: boolean;
  base_price_per_kwh: number;
}

interface AutoPricingSettingsProps {
  userId?: string;
}

export function AutoPricingSettings({ userId }: AutoPricingSettingsProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadStations();
    }
  }, [userId]);

  const loadStations = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('id, name, auto_pricing_on, base_price_per_kwh')
        .eq('owner_id', userId)
        .order('name');

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error loading stations:', error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoPricing = async (stationId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('stations')
        .update({ auto_pricing_on: enabled })
        .eq('id', stationId);

      if (error) throw error;

      setStations(prev => prev.map(s => 
        s.id === stationId ? { ...s, auto_pricing_on: enabled } : s
      ));

      toast.success(
        enabled 
          ? "Auto-pricing activé" 
          : "Auto-pricing désactivé"
      );

      // Track event
      await supabase.from('events').insert({
        event_name: 'auto_pricing_toggle',
        event_data: { station_id: stationId, enabled }
      });
    } catch (error) {
      console.error('Error toggling auto-pricing:', error);
      toast.error("Erreur lors de la modification");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Zap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune station</h3>
          <p className="text-muted-foreground">
            Ajoutez d'abord une station pour configurer l'auto-pricing
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Comment fonctionne l'auto-pricing ?
          </CardTitle>
          <CardDescription>
            Le prix dynamique ajuste automatiquement vos tarifs en fonction de la demande locale,
            du taux d'occupation et des sessions des dernières 24h. Vous maximisez ainsi vos revenus
            tout en restant compétitif.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {stations.map((station) => (
          <Card key={station.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{station.name}</CardTitle>
                  <CardDescription>
                    Prix de base: {station.base_price_per_kwh} €/kWh
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`auto-pricing-${station.id}`}
                    checked={station.auto_pricing_on}
                    onCheckedChange={(checked) => toggleAutoPricing(station.id, checked)}
                  />
                  <Label htmlFor={`auto-pricing-${station.id}`}>
                    {station.auto_pricing_on ? 'Actif' : 'Inactif'}
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {station.auto_pricing_on && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Les prix s'ajustent automatiquement selon la demande</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">
                      Le prix peut varier de ±30% par rapport au prix de base pour optimiser
                      vos revenus tout en restant attractif.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
