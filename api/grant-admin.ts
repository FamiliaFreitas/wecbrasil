import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
serve(async (req)=>{
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }
  const supabaseUrl = Deno.env.get("PROJECT_URL");
  const supabaseServiceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response("Environment variables not set", {
      status: 500
    });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  try {
    const body = await req.json();
    const user_id = body.user_id;
    if (!user_id || typeof user_id !== "string") {
      return new Response("Missing or invalid user_id", {
        status: 400
      });
    }
    const { error } = await supabase.from("usuarios").update({
      tipo: "admin"
    }).eq("user_id", user_id);
    if (error) {
      return new Response("Error updating user: " + error.message, {
        status: 500
      });
    }
    return new Response("User promoted to admin", {
      status: 200
    });
  } catch (e) {
    return new Response("Invalid request body", {
      status: 400
    });
  }
});
