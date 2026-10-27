import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null | undefined;

export function configureSupabaseBrowserClient(url?: string, publishableKey?: string) {
  if (!url || !publishableKey || typeof window === 'undefined') return;
  if (!browserClient) browserClient = createClient(url, publishableKey);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (browserClient !== undefined) return browserClient;
  browserClient = null;
  return browserClient;
}
