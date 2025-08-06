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
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response("Missing user_id", {
        status: 400
      });
    }
    const { error } = await supabase.from("usuarios").delete().eq("user_id", user_id);
    if (error) {
      return new Response("Error: " + error.message, {
        status: 500
      });
    }
    return new Response("Usuário excluído com sucesso", {
      status: 200
    });
  } catch (e) {
    return new Response("Erro na requisição", {
      status: 400
    });
  }
});
