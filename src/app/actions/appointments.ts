"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAppointments(userId?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("appointments")
    .select(`*, service:services(*), specialist:specialists(*)`)
    .order("created_at", { ascending: false });

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function createAppointment(data: any) {
  const supabase = createAdminClient();
  const { data: appointment, error } = await supabase.from("appointments").insert([data]).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/admin/appointments");
  return appointment;
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = createAdminClient();
  const { data: appointment, error } = await supabase.from("appointments").update({ status }).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/admin/appointments");
  return appointment;
}

export async function deleteAppointment(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/admin/appointments");
}
