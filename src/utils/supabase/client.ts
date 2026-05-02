"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 🔥 validasi dulu
  if (!url || !key) {
    throw new Error("Supabase ENV tidak terbaca di client");
  }

  return createBrowserClient(url, key);
}