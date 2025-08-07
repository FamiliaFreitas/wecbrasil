import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";
serve(async (req)=>{
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }
  const supabaseUrl = import.meta.env.VERCEL_SUPABASE_URL;
  const supabaseServiceRoleKey = import.meta.env.VERCEL_SUPABASE_SERVICE_ROLE_KEY;
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
