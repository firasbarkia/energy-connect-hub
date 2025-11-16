import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Zap, 
  TrendingDown, 
  MapPin, 
  DollarSign,
  Clock,
  Star,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import energizeLogo from "@/assets/energize-chain-logo.png";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('events').insert({
        event_name: 'newsletter_signup',
        event_data: { email }
      });

      if (error) throw error;

      toast.success("Merci ! Vous êtes inscrit à notre newsletter.");
      setEmail("");
    } catch (error) {
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const personas = [
    {
      name: "Youssef",
      role: "Chauffeur VTC",
      description: "Recharge prioritaire pour ne jamais manquer une course",
      icon: "🚗",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Mehdi",
      role: "Étudiant",
      description: "Tarifs préférentiels et recharge sur campus",
      icon: "🎓",
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Fatma",
      role: "Hôte PV",
      description: "Partagez votre énergie solaire et gagnez",
      icon: "☀️",
      color: "from-yellow-500 to-orange-500"
    },
    {
      name: "Station Owner",
      role: "Propriétaire",
      description: "Gérez vos bornes et maximisez vos revenus",
      icon: "⚡",
      color: "from-green-500 to-emerald-600"
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: "Onboarding intelligent",
      description: "Détection automatique de votre profil pour une expérience personnalisée"
    },
    {
      icon: Clock,
      title: "Soft-lock 5 minutes",
      description: "Réservez votre borne et arrivez en toute tranquillité"
    },
    {
      icon: TrendingDown,
      title: "Auto-pricing dynamique",
      description: "Prix optimisés selon l'offre et la demande locale"
    },
    {
      icon: Award,
      title: "1er kWh offert",
      description: "Parrainez vos amis et gagnez tous deux 1 kWh gratuit"
    },
    {
      icon: Star,
      title: "Packs semaine/pro",
      description: "Économisez encore plus avec nos abonnements"
    },
    {
      icon: DollarSign,
      title: "Dashboard analytics",
      description: "Suivez vos économies et revenus en temps réel"
    }
  ];

  const benefits = [
    {
      title: "Gagnez de l'argent",
      description: "Partagez votre borne de recharge et générez des revenus passifs",
      icon: DollarSign
    },
    {
      title: "Réduisez vos coûts",
      description: "Jusqu'à 30% d'économie avec les prix dynamiques et packs",
      icon: TrendingDown
    },
    {
      title: "Trouvez facilement",
      description: "Carte interactive montrant la disponibilité en temps réel",
      icon: MapPin
    },
    {
      title: "Rechargez plus vite",
      description: "File prioritaire pour les professionnels (VTC, livreurs)",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={energizeLogo} alt="Energize Chain" className="h-10 w-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Energize Chain
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-primary transition-colors">Features</a>
            <a href="#personas" className="text-sm hover:text-primary transition-colors">Personas</a>
            <a href="#benefits" className="text-sm hover:text-primary transition-colors">Avantages</a>
            {user ? (
              <Link to="/home">
                <Button size="sm">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">Se connecter</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Marketplace énergétique nouvelle génération</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Rechargez. Partagez.{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Économisez.
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Marketplace énergétique locale avec prix dynamique, parrainage et priorité Pro.
              Rejoignez la révolution de l'énergie partagée.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Voir la démo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>1er kWh offert</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Économie garantie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Fonctionnalités puissantes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour une expérience de recharge optimale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Pourquoi Energize Chain ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des avantages concrets pour tous les utilisateurs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section id="personas" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Pour tous les profils</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une solution adaptée à vos besoins spécifiques
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, i) => (
              <Card key={i} className="overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <div className={`h-32 bg-gradient-to-br ${persona.color} flex items-center justify-center text-6xl`}>
                  {persona.icon}
                </div>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-bold text-lg">{persona.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{persona.role}</p>
                  <p className="text-sm text-muted-foreground">{persona.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="container">
          <Card className="max-w-2xl mx-auto border-2">
            <CardContent className="p-8 md:p-12 space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold">Restez informé</h2>
                <p className="text-muted-foreground">
                  Recevez les dernières nouvelles et offres exclusives
                </p>
              </div>
              
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={energizeLogo} alt="Energize Chain" className="h-8 w-8" />
                <span className="font-bold">Energize Chain</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La marketplace de l'énergie locale
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Entreprise</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Energize Chain. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
