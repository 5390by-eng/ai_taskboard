import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "./env";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return supabaseClient;
}

export { isSupabaseConfigured };
