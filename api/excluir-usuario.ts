import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Pega as variáveis do ambiente via Deno.env.toObject()
    const env = Deno.env.toObject();
    const supabaseUrl = env.PROJECT_URL;
    const supabaseServiceRoleKey = env.SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response("Environment variables not set", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { user_id } = await req.json();

    if (!user_id || typeof user_id !== "string") {
      return new Response("Missing or invalid user_id", { status: 400 });
    }

    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("user_id", user_id);

    if (error) {
      return new Response("Error: " + error.message, { status: 500 });
    }

    return new Response("Usuário excluído com sucesso", { status: 200 });
  } catch (e) {
    console.error("Erro ao excluir usuário:", e);
    return new Response("Erro na requisição", { status: 400 });
  }
});
