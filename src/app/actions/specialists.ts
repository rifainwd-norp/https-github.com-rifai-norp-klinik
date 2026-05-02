"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSpecialists() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("specialists").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createSpecialist(data: any) {
  const supabase = createAdminClient();
  const { data: specialist, error } = await supabase.from("specialists").insert([data]).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/specialists");
  revalidatePath("/booking");
  return specialist;
}

export async function updateSpecialist(id: string, data: any) {
  const supabase = createAdminClient();
  const { data: specialist, error } = await supabase.from("specialists").update(data).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/specialists");
  revalidatePath("/booking");
  return specialist;
}

export async function deleteSpecialist(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("specialists").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/specialists");
  revalidatePath("/booking");
}
