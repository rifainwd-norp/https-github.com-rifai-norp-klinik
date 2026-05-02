import { createAdminClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();

  try {
    // Jalankan SQL via RPC atau query langsung jika diizinkan
    // Karena kita tidak bisa menjalankan query DDL (CREATE TABLE) via client standard dengan mudah tanpa RPC,
    // Kita akan coba cek apakah tabel sudah ada dengan select sederhana.
    const { error: checkError } = await supabase.from("clinic_settings").select("id").limit(1);

    if (checkError && checkError.message.includes("not found")) {
      return NextResponse.json({ 
        error: "Tabel 'clinic_settings' belum ada. Silakan salin SQL di bawah ini ke Supabase SQL Editor:",
        sql: `
          CREATE TABLE IF NOT EXISTS public.clinic_settings (id TEXT PRIMARY KEY, value TEXT);
          ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Allow all for clinic_settings" ON public.clinic_settings FOR ALL USING (true);
          INSERT INTO public.clinic_settings (id, value) VALUES 
            ('discount_basic', '5'), 
            ('discount_silver', '10'), 
            ('discount_gold', '15'), 
            ('discount_platinum', '20')
          ON CONFLICT (id) DO NOTHING;
        `
      }, { status: 404 });
    }

    return NextResponse.json({ message: "Tabel sudah ada atau terjadi error lain.", detail: checkError?.message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
