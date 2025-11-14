import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, trackEvent } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { PlayCircle, ArrowRight } from "lucide-react";

export default function Tutorial() {
  const [open, setOpen] = useState(true);
  const [videoWatched, setVideoWatched] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate video watch after 3 seconds
    const timer = setTimeout(() => {
      setVideoWatched(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ tutorial_completed: true })
        .eq('id', user.id);

      await trackEvent('tutorial_complete');

      setOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Comment ça marche ?</DialogTitle>
          <DialogDescription>
            Découvrez EnergyHub en 60 secondes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Placeholder */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <PlayCircle className="w-20 h-20 mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Vidéo tutoriel (60 secondes)
              </p>
              {!videoWatched && (
                <div className="w-48 h-2 bg-secondary rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-1/2"></div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Trouvez une borne</h4>
                <p className="text-sm text-muted-foreground">Recherchez près de vous</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-semibold">Réservez votre créneau</h4>
                <p className="text-sm text-muted-foreground">5 min de réservation garantie</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-semibold">Rechargez</h4>
                <p className="text-sm text-muted-foreground">Payez uniquement ce que vous consommez</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleComplete}
            disabled={!videoWatched}
            className="w-full bg-gradient-primary hover:opacity-90 group"
          >
            {videoWatched ? "C'est parti !" : "Regardez la vidéo pour continuer"}
            {videoWatched && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
