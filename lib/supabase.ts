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
    if (!path) {
      return "";
    }
  }

  const safePath = path.trim().replace(/^["']|["']$/g, "");
  if (!safePath) {
    return "";
  }

  if (/^https?:\/\//i.test(safePath) || safePath.startsWith("/")) {
    return safePath;
  }

  if (!supabase) {
    if (!supabaseUrl) {
      return "";
    }
    const encodedPath = safePath
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
    return `${supabaseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodedPath}`;
  }

  const { data } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(safePath);
  return data.publicUrl ?? "";
}
