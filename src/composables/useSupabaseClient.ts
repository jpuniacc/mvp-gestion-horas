import { supabase } from '@/lib/supabase'

export function useSupabaseClient() {
  return {
    supabase,
  }
}

