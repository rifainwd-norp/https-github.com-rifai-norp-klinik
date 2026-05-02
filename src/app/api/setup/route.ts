import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = createAdminClient();

  try {
    // 1. Seed Initial Services (only if empty)
    const { data: existingServices } = await supabase.from("services").select("id").limit(1);
    if (!existingServices || existingServices.length === 0) {
      await supabase.from("services").insert([
        { name: "Facial Treatment", category: "Facial", price: "250000", description: "Deep cleaning facial for glowing skin", duration_minutes: 60 },
        { name: "Chemical Peeling", category: "Peeling", price: "450000", description: "Skin rejuvenation through gentle exfoliation", duration_minutes: 90, materials_used: "Tidak disarankan untuk kulit sensitif dan ibu hamil" },
        { name: "Laser Hair Removal", category: "Hair Removal", price: "750000", description: "Permanent hair reduction treatment", duration_minutes: 45, materials_used: "Hindari paparan sinar matahari 48 jam sebelum & sesudah treatment" },
        { name: "Body Spa Package", category: "Body Spa", price: "550000", description: "Full body relaxation and skin care", duration_minutes: 120 },
        { name: "Hydrafacial", category: "Facial", price: "650000", description: "Advanced hydration and deep cleansing facial", duration_minutes: 75 },
        { name: "Microneedling", category: "Skincare", price: "850000", description: "Collagen induction therapy for skin rejuvenation", duration_minutes: 60, materials_used: "Tidak untuk kulit yang sedang meradang atau jerawat aktif parah" },
      ]);
    }

    // 2. Seed Initial Specialists (only if empty)
    const { data: existingSpecialists } = await supabase.from("specialists").select("id").limit(1);
    if (!existingSpecialists || existingSpecialists.length === 0) {
      await supabase.from("specialists").insert([
        { name: "Dr. Sarah Amelia", role: "Dermatologist", bio: "Expert in medical skin treatments with 8 years experience" },
        { name: "Siska Putri", role: "Senior Beautician", bio: "Certified beautician specializing in facial and body care" },
        { name: "Dr. Kevin Hartanto", role: "Aesthetic Doctor", bio: "Specialist in non-surgical aesthetic procedures" },
        { name: "Rania Dewi", role: "Spa Therapist", bio: "Licensed therapist with expertise in body treatments and relaxation" },
      ]);
    }

    // 3. Seed Initial Inventory (only if empty)
    const { data: existingInventory } = await supabase.from("inventory").select("id").limit(1);
    if (!existingInventory || existingInventory.length === 0) {
      await supabase.from("inventory").insert([
        // Skincare
        { name: "Hyaluronic Acid Serum", category: "Skincare", stock_quantity: 48, min_threshold: 10, unit: "botol", price_per_unit: 85000 },
        { name: "Vitamin C Brightening Serum", category: "Skincare", stock_quantity: 36, min_threshold: 8, unit: "botol", price_per_unit: 95000 },
        { name: "Chemical Peel Solution (AHA 30%)", category: "Skincare", stock_quantity: 12, min_threshold: 3, unit: "botol", price_per_unit: 320000 },
        { name: "Hydrating Gel Mask", category: "Skincare", stock_quantity: 60, min_threshold: 15, unit: "sachet", price_per_unit: 25000 },
        { name: "Retinol Night Cream", category: "Skincare", stock_quantity: 24, min_threshold: 5, unit: "tube", price_per_unit: 135000 },
        { name: "SPF 50 Sunblock", category: "Skincare", stock_quantity: 30, min_threshold: 8, unit: "tube", price_per_unit: 65000 },
        // Consumables
        { name: "Disposable Face Mask", category: "Consumables", stock_quantity: 200, min_threshold: 50, unit: "pcs", price_per_unit: 2500 },
        { name: "Cotton Pad", category: "Consumables", stock_quantity: 500, min_threshold: 100, unit: "pcs", price_per_unit: 500 },
        { name: "Sterile Gloves (M)", category: "Consumables", stock_quantity: 100, min_threshold: 20, unit: "pasang", price_per_unit: 3500 },
        { name: "Microneedle Cartridge (0.5mm)", category: "Consumables", stock_quantity: 20, min_threshold: 5, unit: "pcs", price_per_unit: 75000 },
        { name: "Alcohol Swab", category: "Consumables", stock_quantity: 300, min_threshold: 50, unit: "pcs", price_per_unit: 800 },
        // Tools
        { name: "Ultrasonic Facial Device", category: "Tools", stock_quantity: 3, min_threshold: 1, unit: "unit", price_per_unit: 2500000 },
        { name: "LED Light Therapy Panel", category: "Tools", stock_quantity: 2, min_threshold: 1, unit: "unit", price_per_unit: 4500000 },
        { name: "Steamer Machine", category: "Tools", stock_quantity: 4, min_threshold: 1, unit: "unit", price_per_unit: 1200000 },
        // Supplies
        { name: "Massage Oil (Lavender)", category: "Supplies", stock_quantity: 15, min_threshold: 3, unit: "botol", price_per_unit: 120000 },
        { name: "Body Scrub (Coffee)", category: "Supplies", stock_quantity: 20, min_threshold: 5, unit: "jar", price_per_unit: 85000 },
        { name: "Hot Towel Set", category: "Supplies", stock_quantity: 40, min_threshold: 10, unit: "set", price_per_unit: 45000 },
      ]);
    }

    return NextResponse.json({ message: "Setup selesai! Services, specialists, dan inventory berhasil di-seed." });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}