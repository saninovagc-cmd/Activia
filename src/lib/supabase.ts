import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bkwspibjypklsrbvyfrn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Tdk6wZWQ6S5HrDVeho3boQ_vmtwP6LZ';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey &&
    !supabaseUrl.includes('mock-supabase')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  url: string;
  hasTables: boolean;
  latencyMs?: number;
  message: string;
  error?: string;
}

export const testSupabaseConnection = async (): Promise<SupabaseConnectionStatus> => {
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      isConnected: false,
      url: supabaseUrl,
      hasTables: false,
      message: 'Supabase n’est pas configuré. Veuillez définir les variables d’environnement.',
    };
  }

  const start = Date.now();
  try {
    // 1. Test Auth / Core endpoint health
    const healthRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    const latencyMs = Date.now() - start;

    if (!healthRes.ok) {
      return {
        isConfigured: true,
        isConnected: false,
        url: supabaseUrl,
        hasTables: false,
        latencyMs,
        message: `Erreur de connexion à Supabase (${healthRes.status}: ${healthRes.statusText})`,
      };
    }

    // 2. Check if tables exist (e.g. activities or profiles)
    let hasTables = false;
    try {
      const { data, error } = await supabase.from('activities').select('id').limit(1);
      if (!error) {
        hasTables = true;
      }
    } catch {
      hasTables = false;
    }

    return {
      isConfigured: true,
      isConnected: true,
      url: supabaseUrl,
      hasTables,
      latencyMs,
      message: hasTables 
        ? 'Connexion active à Supabase et tables opérationnelles.' 
        : 'Connexion active à Supabase. Le schéma SQL complet est prêt à être appliqué.',
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      isConfigured: true,
      isConnected: false,
      url: supabaseUrl,
      hasTables: false,
      latencyMs,
      message: 'Échec de connexion réseau vers l’instance Supabase.',
      error: errorMsg,
    };
  }
};
