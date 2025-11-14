import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, detectPersona, trackEvent } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Zap, ArrowRight } from "lucide-react";
import { z } from "zod";

const onboardingSchema = z.object({
  first_name: z.string().trim().min(1, "Prénom requis").max(100),
  zone: z.string().trim().min(1, "Zone requise").max(100),
  description: z.string().trim().max(500),
});

export default function Onboarding() {
  const [firstName, setFirstName] = useState("");
  const [zone, setZone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = onboardingSchema.safeParse({
      first_name: firstName,
      zone,
      description,
    });

    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      // Detect persona from description
      const detectedPersona = detectPersona(description);
      const persona: 'amal' | 'mehdi' | 'youssef' | 'fatma' | 'hatem' | 'sana' = 
        (detectedPersona as any) || 'mehdi'; // Default

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          zone,
          persona,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      await trackEvent('onboarding_complete', { persona, zone });

      toast({
        title: "Profil complété !",
        description: `Bienvenue ${firstName} !`,
      });

      navigate('/tutorial');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Complétez votre profil</CardTitle>
          <CardDescription>
            Parlez-nous un peu de vous pour personnaliser votre expérience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                placeholder="Mehdi"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone">Zone / Ville</Label>
              <Input
                id="zone"
                placeholder="Tunis, Sfax, Sousse..."
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Parlez-nous de votre usage</Label>
              <Textarea
                id="description"
                placeholder="Ex: Je suis étudiant au campus, je cherche des bornes près de mon école. Ou: Je suis chauffeur VTC pro, j'ai besoin de charges rapides."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Mentionnez si vous êtes pro, étudiant, livreur, etc. pour une expérience adaptée
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 group" 
              disabled={loading}
            >
              {loading ? "Chargement..." : "Continuer"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
