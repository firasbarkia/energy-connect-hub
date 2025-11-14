import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase, trackEvent } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Zap, Clock, TrendingUp, Users, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  start_time: string;
  end_time: string;
  available_kw: number;
  price_per_kwh: number;
  status: string;
  reserved_until: string | null;
  hosts: {
    name: string;
    address: string;
    zone: string;
  };
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      setProfile(profileData);

      // Check onboarding
      if (!profileData?.onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      // Check tutorial
      if (!profileData?.tutorial_completed) {
        navigate('/tutorial');
        return;
      }

      // Load available sessions
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select(`
          *,
          hosts (name, address, zone)
        `)
        .eq('status', 'available')
        .order('start_time', { ascending: true })
        .limit(10);

      setSessions(sessionsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (sessionId: string) => {
    try {
      await trackEvent('reserve_click', { session_id: sessionId });

      // Update session to reserved
      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'reserved',
          reserved_by: user!.id,
          reserved_until: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
        })
        .eq('id', sessionId)
        .eq('status', 'available');

      if (error) throw error;

      toast({
        title: "Réservation confirmée !",
        description: "Vous avez 5 minutes pour confirmer",
      });

      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  if (!user || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Bonjour {profile?.first_name} !
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez une borne de recharge près de chez vous
          </p>

          {profile?.credits_kwh > 0 && (
            <Badge variant="secondary" className="text-lg py-2 px-4">
              <Gift className="w-4 h-4 mr-2" />
              {profile.credits_kwh} kWh offerts
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                  <p className="text-sm text-muted-foreground">Bornes disponibles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0.15€</p>
                  <p className="text-sm text-muted-foreground">Prix moyen/kWh</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5 min</p>
                  <p className="text-sm text-muted-foreground">Réservation garantie</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Créneaux disponibles</h2>
          
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Aucun créneau disponible pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{session.hosts.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4" />
                        {session.hosts.address}, {session.hosts.zone}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {session.available_kw} kW
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(session.start_time).toLocaleTimeString('fr', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {' - '}
                          {new Date(session.end_time).toLocaleTimeString('fr', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="text-sm font-semibold">
                        {session.price_per_kwh}€ / kWh
                      </div>
                    </div>

                    <Button
                      onClick={() => handleReserve(session.id)}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      Réserver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
