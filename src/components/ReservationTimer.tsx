import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ReservationTimerProps {
  sessionId: string;
  reservedUntil: string;
  onExpire?: () => void;
}

export function ReservationTimer({ sessionId, reservedUntil, onExpire }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(reservedUntil).getTime();
      const left = Math.max(0, end - now);
      const total = 5 * 60 * 1000; // 5 minutes
      
      setTimeLeft(left);
      setPercentage((left / total) * 100);

      if (left === 0) {
        handleExpire();
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [reservedUntil]);

  const handleExpire = async () => {
    try {
      await supabase
        .from('sessions')
        .update({
          status: 'available',
          reserved_by: null,
          reserved_until: null,
        })
        .eq('id', sessionId);

      toast.error("Réservation expirée", {
        description: "Le soft-lock de 5 minutes est terminé",
      });
      
      onExpire?.();
    } catch (error) {
      console.error('Error expiring reservation:', error);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`border-2 ${timeLeft < 60000 ? 'border-destructive' : 'border-primary'}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {timeLeft < 60000 ? (
                <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
              ) : (
                <Clock className="h-5 w-5 text-primary" />
              )}
              <span className="font-semibold">
                {timeLeft < 60000 ? "Attention !" : "Soft-lock actif"}
              </span>
            </div>
            <span className={`text-2xl font-bold ${timeLeft < 60000 ? 'text-destructive' : 'text-primary'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <Progress value={percentage} className="h-2" />
          
          <p className="text-sm text-muted-foreground">
            Confirmez votre réservation avant l'expiration du timer
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
