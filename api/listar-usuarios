import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
serve(async (req)=>{
  if (req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405
    });
  }
  const supabaseUrl = Deno.env.get("PROJECT_URL");
  const supabaseServiceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data, error } = await supabase.from("usuarios").select("id, user_id, nome, tipo");
  if (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500
    });
  }
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json"
    },
    status: 200
  });
});
