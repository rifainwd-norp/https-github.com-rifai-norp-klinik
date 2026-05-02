"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function updateProfile(id: string, data: any) {
  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert({ id, ...data, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/admin/users");
  return profile;
}

export async function getAllProfiles() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("profiles").select("*").order("full_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}
