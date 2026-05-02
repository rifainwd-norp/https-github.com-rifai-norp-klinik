"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getServices() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("services").select("*").order("category", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createService(data: any) {
  const supabase = createAdminClient();
  const { data: service, error } = await supabase.from("services").insert([data]).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/services");
  revalidatePath("/booking");
  return service;
}

export async function updateService(id: string, data: any) {
  const supabase = createAdminClient();
  const { data: service, error } = await supabase.from("services").update(data).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/services");
  revalidatePath("/booking");
  return service;
}

export async function deleteService(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/services");
  revalidatePath("/booking");
}
