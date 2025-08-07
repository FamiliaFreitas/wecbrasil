import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
serve(async (req)=>{
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }
  if (req.method !== "GET") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers
    });
  }
  // Verifica header Authorization
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({
      error: "Missing or invalid Authorization header"
    }), {
      status: 401,
      headers
    });
  }
  const token = authHeader.split(" ")[1];
  const supabaseServiceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
  if (!supabaseServiceRoleKey) {
    return new Response(JSON.stringify({
      error: "Environment variables not set"
    }), {
      status: 500,
      headers
    });
  }
  // Confere se o token enviado é o service_role
  if (token !== supabaseServiceRoleKey) {
    return new Response(JSON.stringify({
      error: "Unauthorized"
    }), {
      status: 403,
      headers
    });
  }
  const supabaseUrl = Deno.env.get("PROJECT_URL");
  if (!supabaseUrl) {
    return new Response(JSON.stringify({
      error: "Environment variables not set"
    }), {
      status: 500,
      headers
    });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data, error } = await supabase.from("usuarios").select("id, user_id, nome, tipo");
  if (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers
    });
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers
  });
});
