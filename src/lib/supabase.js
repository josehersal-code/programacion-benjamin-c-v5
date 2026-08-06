import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const TEAM_ID =
  import.meta.env.VITE_TEAM_ID || "11111111-1111-1111-1111-111111111111";

export const configured = Boolean(url && key);
export const supabase = configured ? createClient(url, key) : null;
