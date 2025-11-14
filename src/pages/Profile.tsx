import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, Share2, CheckCircle } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Load or create referral code
      let { data: referralData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .is('referred_id', null)
        .single();

      if (!referralData) {
        // Create new referral code
        const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const { data: newReferral } = await supabase
          .from('referrals')
          .insert({
            referrer_id: user.id,
            code,
          })
          .select()
          .single();

        referralData = newReferral;
      }

      setReferralCode(referralData?.code || '');

      // Load completed referrals
      const { data: completedReferrals } = await supabase
        .from('referrals')
        .select('*, profiles!referred_id(first_name)')
        .eq('referrer_id', user.id)
        .not('referred_id', 'is', null);

      setReferrals(completedReferrals || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    
    toast({
      title: "Lien copié !",
      description: "Partagez-le avec vos amis",
    });
  };

  const shareReferral = async () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    const text = `Rejoins-moi sur EnergyHub ! Utilise mon code ${referralCode} et reçois 1 kWh offert. ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({ text, url: link });
      } catch (err) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

        {/* Profile Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Prénom</p>
                <p className="font-semibold">{profile?.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zone</p>
                <p className="font-semibold">{profile?.zone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Persona</p>
                <Badge variant="secondary">{profile?.persona}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crédits</p>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{profile?.credits_kwh || 0} kWh</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Program */}
        <Card>
          <CardHeader>
            <CardTitle>Programme de Parrainage</CardTitle>
            <CardDescription>
              Parrainez vos amis et recevez 1 kWh offert pour chaque filleul qui effectue sa première recharge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Votre code de parrainage</p>
              <div className="flex gap-2">
                <Input 
                  value={referralCode} 
                  readOnly 
                  className="font-mono text-lg"
                />
                <Button onClick={copyReferralLink} variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button onClick={shareReferral} className="bg-gradient-primary hover:opacity-90">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-primary">{referrals.length}</p>
                  <p className="text-sm text-muted-foreground">Filleuls</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {referrals.filter(r => r.first_session_completed).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {referrals.filter(r => r.referrer_credited).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Crédits reçus</p>
                </CardContent>
              </Card>
            </div>

            {/* Referral List */}
            {referrals.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Mes filleuls</p>
                <div className="space-y-2">
                  {referrals.map((ref) => (
                    <div 
                      key={ref.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {ref.profiles?.first_name?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{ref.profiles?.first_name || 'Utilisateur'}</p>
                          <p className="text-xs text-muted-foreground">
                            Inscrit le {new Date(ref.created_at).toLocaleDateString('fr')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ref.first_session_completed && (
                          <Badge variant="secondary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        )}
                        {ref.referrer_credited && (
                          <Badge className="bg-primary">
                            +1 kWh
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
