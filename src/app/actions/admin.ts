"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAllAppointments() {
  const supabase = createAdminClient();

  // Query semua data secara paralel
  const [apptsRes, servicesRes, specialistsRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, user_id, appointment_date, appointment_time, status, notes, guest_name, guest_email, service_id, specialist_id")
      .order("appointment_date", { ascending: false }),
    supabase.from("services").select("id, name, price, materials_used"),
    supabase.from("specialists").select("id, name"),
  ]);

  if (apptsRes.error) throw new Error(apptsRes.error.message);

  const appointments = apptsRes.data || [];

  // Ambil profiles untuk semua user_id yang ada
  const userIds = [...new Set(appointments.filter(a => a.user_id).map(a => a.user_id))] as string[];
  let profilesMap: Record<string, any> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, member_id, skin_type, allergies, phone, loyalty_points, member_status")
      .in("id", userIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    }
  }

  const servicesMap = Object.fromEntries((servicesRes.data || []).map(s => [s.id, s]));
  const specialistsMap = Object.fromEntries((specialistsRes.data || []).map(s => [s.id, s]));

  // Gabungkan data
  return appointments.map(appt => ({
    ...appt,
    profiles:    appt.user_id      ? (profilesMap[appt.user_id]        || null) : null,
    services:    appt.service_id   ? (servicesMap[appt.service_id]     || null) : null,
    specialists: appt.specialist_id ? (specialistsMap[appt.specialist_id] || null) : null,
  }));
}


export async function adminUpdateAppointmentStatus(id: string, status: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function adminUpdateAppointmentNotes(id: string, notes: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("appointments")
    .update({ notes })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function adminCreateInvoice(data: {
  appointment_id: string;
  total_amount: number;
  discount_amount: number;
  payment_method: string;
  payment_status: string;
}) {
  const supabase = createAdminClient();

  // Cek apakah invoice sudah ada untuk appointment ini
  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("appointment_id", data.appointment_id)
    .single();

  if (existing) {
    // Sudah ada invoice — skip, jangan error
    revalidatePath("/admin");
    return;
  }

  const { error } = await supabase.from("invoices").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
}

export async function adminIncrementPoints(userId: string, points: number) {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("loyalty_points, total_spend")
    .eq("id", userId)
    .single();

  if (profile) {
    await supabase
      .from("profiles")
      .update({
        loyalty_points: (profile.loyalty_points || 0) + points,
        total_spend: (profile.total_spend || 0) + points * 100,
      })
      .eq("id", userId);
  }
}

export async function adminDeductInventory(appointmentId: string) {
  const supabase = createAdminClient();
  // Get service_id from appointment
  const { data: appt } = await supabase
    .from("appointments")
    .select("service_id")
    .eq("id", appointmentId)
    .single();

  if (!appt) return;

  // Get all inventory relations for this service
  const { data: links } = await supabase
    .from("service_inventory")
    .select("inventory_id, qty_per_treatment")
    .eq("service_id", appt.service_id);

  if (!links || links.length === 0) return;

  // Deduct stock for each linked inventory item
  for (const link of links) {
    const { data: item } = await supabase
      .from("inventory")
      .select("stock_quantity")
      .eq("id", link.inventory_id)
      .single();

    if (item) {
      await supabase
        .from("inventory")
        .update({
          stock_quantity: Math.max(0, item.stock_quantity - link.qty_per_treatment),
        })
        .eq("id", link.inventory_id);
    }
  }
}

export async function getAllProfiles() {
  const supabase = createAdminClient();
  
  const [profilesRes, invoicesRes, apptsRes] = await Promise.all([
    supabase.from("profiles").select("*, member_id").order('full_name', { ascending: true }),
    supabase.from("invoices").select("appointment_id, total_amount"),
    supabase.from("appointments").select("id, user_id, appointment_date").order('appointment_date', { ascending: false })
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);

  const pData = profilesRes.data || [];
  const invoices = invoicesRes.data || [];
  const appts = apptsRes.data || [];

  return pData.map(p => {
    const userAppts = appts.filter(a => a.user_id === p.id);
    const pApptIds = userAppts.map(a => a.id);
    const spend = invoices.filter(i => pApptIds.includes(i.appointment_id)).reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const lastVisit = userAppts[0]?.appointment_date || null;
    return { ...p, total_spend: spend, last_visit: lastVisit };
  });
}

export async function updateMemberStatus(userId: string, newStatus: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ member_status: newStatus })
    .eq("id", userId);
  
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function getFinancialReport() {
  const supabase = createAdminClient();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`
      *,
      appointments:appointment_id (
        id,
        appointment_date,
        guest_name,
        user_id,
        services:service_id (id, name, category)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Ambil service IDs unik
  const serviceIds = [...new Set(invoices.map(i => i.appointments?.services?.id).filter(Boolean))] as string[];
  
  // Ambil relasi inventory untuk semua service tersebut
  const { data: materials } = await supabase
    .from("service_inventory")
    .select(`
      service_id,
      qty_per_treatment,
      unit,
      inventory:inventory_id ( name )
    `)
    .in("service_id", serviceIds);

  const materialsMap: Record<string, any[]> = {};
  materials?.forEach(m => {
    if (!materialsMap[m.service_id]) materialsMap[m.service_id] = [];
    
    // Fix: Handle cases where inventory might be returned as an array or object
    const inventoryData = Array.isArray(m.inventory) ? m.inventory[0] : m.inventory;
    
    materialsMap[m.service_id].push({
      name: inventoryData?.name,
      qty: m.qty_per_treatment,
      unit: m.unit
    });
  });

  // Ambil profiles untuk join manual jika diperlukan
  const userIds = [...new Set(invoices.filter(i => i.appointments?.user_id).map(i => i.appointments.user_id))] as string[];
  let profilesMap: Record<string, any> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
    if (profiles) profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  }

  return invoices.map(inv => ({
    ...inv,
    patient_name: inv.appointments?.guest_name || profilesMap[inv.appointments?.user_id]?.full_name || "Unknown Patient",
    materials: materialsMap[inv.appointments?.services?.id] || []
  }));
}

export async function getInventoryReport() {
  const supabase = createAdminClient();
  const { data: items, error } = await supabase
    .from("inventory")
    .select(`
      *,
      service_inventory (
        services ( name )
      )
    `)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  
  // Transform data to flatten service names
  return items.map((item: any) => ({
    ...item,
    related_services: item.service_inventory?.map((si: any) => si.services?.name).filter(Boolean) || []
  }));
}

export async function adminSaveInventory(data: any) {
  const supabase = createAdminClient();
  const { id, stock_quantity, ...payload } = data;
  
  console.log("Admin Save Inventory - ID:", id, "Adjustment:", stock_quantity, "Payload:", payload);

  let result;
  if (id) {
    // 1. Ambil stok saat ini
    const { data: current } = await supabase.from("inventory").select("stock_quantity").eq("id", id).single();
    const newQty = (Number(current?.stock_quantity) || 0) + (Number(stock_quantity) || 0);

    // 2. Update dengan stok baru yang sudah ditambah
    result = await supabase
      .from("inventory")
      .update({ ...payload, stock_quantity: newQty })
      .eq("id", id)
      .select();
  } else {
    // Insert new
    result = await supabase
      .from("inventory")
      .insert([{ ...payload, stock_quantity: stock_quantity || 0 }])
      .select();
  }

  if (result.error) {
    console.error("Database Error:", result.error);
    throw new Error(result.error.message);
  }
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/inventory/report");
  return result.data;
}

export async function adminDeleteInventory(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("inventory")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/inventory");
}

export async function adminSaveRelation(data: any) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("service_inventory")
    .upsert(data);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/inventory");
}

export async function adminDeleteRelation(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("service_inventory")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/inventory");
}

export async function getInventoryData() {
  const supabase = createAdminClient();
  
  const [invRes, svcRes, linkRes] = await Promise.all([
    supabase.from("inventory").select("*").order("name"),
    supabase.from("services").select("id, name, category").order("name"),
    supabase.from("service_inventory").select(`
      *,
      services:service_id ( name ),
      inventory:inventory_id ( name, unit )
    `).order("created_at", { ascending: false })
  ]);

  return {
    items: (invRes.data || []) as any[],
    services: (svcRes.data || []) as any[],
    links: (linkRes.data || []) as any[]
  };
}export async function getClinicSettings() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("clinic_settings").select("*");
  if (error) throw new Error(error.message);
  return data;
}

export async function updateClinicSetting(id: string, value: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("clinic_settings").update({ value }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}

