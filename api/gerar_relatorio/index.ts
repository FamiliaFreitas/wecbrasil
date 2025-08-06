import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";
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
    const { dataInicial, dataFinal } = await req.json();
    if (!dataInicial || !dataFinal) {
      return new Response("Datas inválidas", {
        status: 400
      });
    }
    // Buscar todos os usuários
    const { data: usuariosRaw, error: erroUsuarios } = await supabase.from("usuarios").select("user_id, nome");
    if (erroUsuarios) {
      return new Response("Erro ao buscar usuários: " + erroUsuarios.message, {
        status: 500
      });
    }
    const usuariosMap = {};
    usuariosRaw?.forEach((u)=>{
      usuariosMap[u.user_id] = u.nome;
    });
    // Buscar registros no período
    const { data: registros, error: erroRegistros } = await supabase.from("registros").select("*").gte("data", dataInicial).lte("data", dataFinal);
    if (erroRegistros) {
      return new Response("Erro ao buscar registros: " + erroRegistros.message, {
        status: 500
      });
    }
    return new Response(JSON.stringify({
      usuarios: usuariosMap,
      registros: registros || []
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (e) {
    return new Response("Erro no corpo da requisição", {
      status: 400
    });
  }
});
