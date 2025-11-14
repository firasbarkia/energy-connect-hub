import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Helper to track events
export async function trackEvent(
  eventName: string,
  eventData?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('persona, zone')
    .eq('id', user.id)
    .single();

  await supabase.from('events').insert({
    user_id: user.id,
    event_name: eventName,
    event_data: eventData || {},
    persona: profile?.persona,
    zone: profile?.zone,
  });
}

// Helper to detect persona from keywords
export function detectPersona(input: string): string | null {
  const lower = input.toLowerCase();
  
  if (lower.includes('pro') || lower.includes('chauffeur') || lower.includes('vtc') || lower.includes('taxi')) {
    return 'youssef';
  }
  if (lower.includes('campus') || lower.includes('étudiant') || lower.includes('student') || lower.includes('école')) {
    return 'mehdi';
  }
  if (lower.includes('livraison') || lower.includes('livreur') || lower.includes('delivery')) {
    return 'amal';
  }
  if (lower.includes('installateur') || lower.includes('install') || lower.includes('partenaire')) {
    return 'hatem';
  }
  if (lower.includes('entreprise') || lower.includes('pme') || lower.includes('business')) {
    return 'sana';
  }
  if (lower.includes('hôte') || lower.includes('host') || lower.includes('particulier')) {
    return 'fatma';
  }
  if (lower.includes('station') || lower.includes('borne') || lower.includes('charging')) {
    return 'station_owner';
  }
  
  return null;
}
