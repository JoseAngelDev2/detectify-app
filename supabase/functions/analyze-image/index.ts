import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const AZURE_ENDPOINT =
  "https://fastfoodcustomai-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/44f0b41a-112f-4f04-a982-467316e5b209/detect/iterations/Iteration2/image";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const azureKey = Deno.env.get("AZURE_PREDICTION_KEY");
    if (!azureKey) {
      console.error("AZURE_PREDICTION_KEY no configurada");
      return new Response(
        JSON.stringify({ error: "Servicio no disponible." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const buffer = await req.arrayBuffer();
    if (!buffer.byteLength) {
      return new Response(
        JSON.stringify({ error: "Imagen vacía." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const azureRes = await fetch(AZURE_ENDPOINT, {
      method: "POST",
      headers: {
        "Prediction-Key": azureKey,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!azureRes.ok) {
      const text = await azureRes.text().catch(() => "");
      console.error("Azure error", azureRes.status, text);
      return new Response(
        JSON.stringify({ error: "No se pudo analizar la imagen. Intenta de nuevo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await azureRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-image error", err);
    return new Response(
      JSON.stringify({ error: "Error inesperado al procesar la imagen." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
