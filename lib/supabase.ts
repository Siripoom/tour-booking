import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const SUPABASE_BUCKET = "tour-images";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function getPublicImageUrl(path?: string | null) {
  if (!supabase || !path) {
    return "";
  }

  const safePath = path.trim();
  if (!safePath) {
    return "";
  }

  const { data } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(safePath);
  return data.publicUrl ?? "";
}
