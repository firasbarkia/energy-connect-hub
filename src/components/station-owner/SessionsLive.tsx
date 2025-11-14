import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface Session {
  id: string;
  status: string;
  start_time: string;
  available_kw: number;
  stations: {
    name: string;
  };
}

interface SessionsLiveProps {
  userId?: string;
}

export function SessionsLive({ userId }: SessionsLiveProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSessions();
      subscribeToSessions();
    }
  }, [userId]);

  const loadSessions = async () => {
    try {
      const { data: stations } = await supabase
        .from('stations')
        .select('id')
        .eq('owner_id', userId);

      if (!stations || stations.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          status,
          start_time,
          available_kw,
          stations (name)
        `)
        .in('station_id', stations.map(s => s.id))
        .in('status', ['active', 'reserved'])
        .order('start_time', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToSessions = () => {
    const channel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        () => {
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessions en direct</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Sessions en direct
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Aucune session active
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{session.stations?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.start_time).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{session.available_kw} kW</span>
                  <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
