export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
} as const;

export const isSupabaseConfigured =
  env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;

export const SUPABASE_CONFIG_MESSAGE =
  "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.";
