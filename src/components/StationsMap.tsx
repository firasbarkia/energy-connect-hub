import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Zap, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  power_kw: number;
  base_price_per_kwh: number;
  status: string;
  auto_pricing_on: boolean;
}

function ChangeView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function StationsMap() {
  const [stations, setStations] = useState<Station[]>([]);
  const [center, setCenter] = useState<LatLngExpression>([48.8566, 2.3522]); // Paris par défaut

  useEffect(() => {
    loadStations();

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }

    // Subscribe to realtime updates
    const channel = supabase
      .channel('stations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stations'
        },
        () => {
          loadStations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStations = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('status', 'active')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error loading stations:', error);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Stations disponibles
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <ChangeView center={center} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stations.map((station) => (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
              >
                <Popup>
                  <div className="space-y-2 min-w-[200px]">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      {station.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{station.address}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{station.power_kw} kW</span>
                      <Badge variant={station.auto_pricing_on ? "default" : "secondary"}>
                        {station.base_price_per_kwh} €/kWh
                      </Badge>
                    </div>
                    {station.auto_pricing_on && (
                      <Badge variant="outline" className="w-full justify-center">
                        Prix dynamique actif
                      </Badge>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
