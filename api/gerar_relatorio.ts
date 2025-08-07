import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const supabaseUrl = Deno.env.get("PROJECT_URL");
  const supabaseServiceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(JSON.stringify({
      error: "Environment variables not set"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { dataInicial, dataFinal } = await req.json();

    if (!dataInicial || !dataFinal) {
      return new Response(JSON.stringify({
        error: "Datas inválidas"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Buscar nomes dos usuários
    const { data: usuariosRaw, error: erroUsuarios } = await supabase
      .from("usuarios")
      .select("user_id, nome");

    if (erroUsuarios) {
      return new Response(JSON.stringify({
        error: "Erro ao buscar usuários",
        detalhe: erroUsuarios.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const usuariosMap: Record<string, string> = {};
    usuariosRaw?.forEach((u) => {
      usuariosMap[u.user_id] = u.nome || u.user_id;
    });

    // Buscar registros no período
    const { data: registrosRaw, error: erroRegistros } = await supabase
      .from("registros")
      .select("*")
      .gte("data", dataInicial)
      .lte("data", dataFinal);

    if (erroRegistros) {
      return new Response(JSON.stringify({
        error: "Erro ao buscar registros",
        detalhe: erroRegistros.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Substituir user_id por nome no resultado
    const registrosComNomes = (registrosRaw || []).map((reg) => ({
      ...reg,
      nome: usuariosMap[reg.user_id] || reg.user_id
    }));

    return new Response(JSON.stringify({
      registros: registrosComNomes
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({
      error: "Erro no corpo da requisição",
      detalhe: e.message
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
});
