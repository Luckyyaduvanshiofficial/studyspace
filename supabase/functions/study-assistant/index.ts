import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client to fetch real-time data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch current library data for context
    const now = new Date().toISOString();
    
    // Get zones
    const { data: zones } = await supabase
      .from("zones")
      .select("id, name, description, color, icon")
      .eq("is_active", true);

    // Get available seats count per zone
    const { data: seats } = await supabase
      .from("seats")
      .select("id, label, zone_id, capacity, is_active")
      .eq("is_active", true);

    // Get current bookings
    const { data: currentBookings } = await supabase
      .from("bookings")
      .select("seat_id, starts_at, ends_at, status")
      .in("status", ["CONFIRMED", "HOLD"])
      .gte("ends_at", now);

    // Get shifts
    const { data: shifts } = await supabase
      .from("shifts")
      .select("id, name, start_time, end_time")
      .eq("is_active", true);

    // Calculate availability per zone
    const bookedSeatIds = new Set(currentBookings?.map(b => b.seat_id) || []);
    const zoneAvailability = zones?.map(zone => {
      const zoneSeats = seats?.filter(s => s.zone_id === zone.id) || [];
      const availableSeats = zoneSeats.filter(s => !bookedSeatIds.has(s.id));
      return {
        zone: zone.name,
        description: zone.description,
        totalSeats: zoneSeats.length,
        availableSeats: availableSeats.length,
        availableSeatLabels: availableSeats.map(s => s.label).slice(0, 5)
      };
    }) || [];

    const systemPrompt = `You are StudySpace Assistant, a helpful AI for the StudySpace Self-Study Library Management System. You help students and members with:

1. Finding available seats in different zones
2. Understanding library rules and policies
3. Booking guidance and recommendations
4. General library information

CURRENT LIBRARY STATUS (Real-time data):
${JSON.stringify(zoneAvailability, null, 2)}

AVAILABLE SHIFTS:
${shifts?.map(s => `- ${s.name}: ${s.start_time} to ${s.end_time}`).join('\n') || 'No shifts available'}

LIBRARY POLICIES:
- Members must have an active membership to book seats
- Bookings can be made for specific shifts or full day
- Check-in is required within 15 minutes of booking start time
- Late arrivals may result in automatic cancellation
- WiFi access is available for members with active bookings

ZONES DESCRIPTION:
- Silent Zone: For focused, quiet study. No talking allowed.
- Computer Zone: Equipped with computers for digital work.
- Group Study: For collaborative work and discussions.
- Reading Area: Comfortable seating for reading and light study.

Be friendly, concise, and helpful. If asked about seat availability, provide specific zone recommendations based on the real-time data. Guide users to the booking page when they want to reserve a seat.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Study assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
