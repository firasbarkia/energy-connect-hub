import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Zap, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Station {
  id: string;
  name: string;
  address: string;
  status: string;
  base_price_per_kwh: number;
  auto_pricing_on: boolean;
  power_kw: number;
}

interface StationListProps {
  userId?: string;
  onUpdate?: () => void;
}

export function StationList({ userId, onUpdate }: StationListProps) {
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
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error loading stations:', error);
      toast.error("Erreur lors du chargement des stations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette station ?")) return;

    try {
      const { error } = await supabase
        .from('stations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Station supprimée");
      loadStations();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting station:', error);
      toast.error("Erreur lors de la suppression");
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
          <p className="text-muted-foreground mb-4">
            Commencez par ajouter votre première station de recharge
          </p>
          <Button>Ajouter une station</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stations.map((station) => (
        <Card key={station.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{station.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{station.address}</span>
                </div>
              </div>
              <Badge variant={station.status === 'active' ? 'default' : 'secondary'}>
                {station.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Puissance</p>
                <p className="font-semibold">{station.power_kw} kW</p>
              </div>
              <div>
                <p className="text-muted-foreground">Prix de base</p>
                <p className="font-semibold">{station.base_price_per_kwh} €/kWh</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className={`h-4 w-4 ${station.auto_pricing_on ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm">
                  {station.auto_pricing_on ? 'Auto-pricing actif' : 'Prix fixe'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDelete(station.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
