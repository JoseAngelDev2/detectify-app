import { supabase } from "@/integrations/supabase/client";

export interface AzurePrediction {
  tagName: string;
  probability: number;
  boundingBox?: { left: number; top: number; width: number; height: number };
}

export interface AzureResponse {
  id?: string;
  project?: string;
  iteration?: string;
  created?: string;
  predictions: AzurePrediction[];
}

export interface AnalysisResult {
  topBrand: AzurePrediction | null;
  predictions: AzurePrediction[];
  raw: AzureResponse;
}

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const buffer = await file.arrayBuffer();

  const { data, error } = await supabase.functions.invoke<AzureResponse>(
    "analyze-image",
    {
      body: buffer,
      headers: { "Content-Type": "application/octet-stream" },
    }
  );

  if (error) {
    throw new Error(error.message || "No se pudo analizar la imagen.");
  }
  if (!data) {
    throw new Error("Respuesta vacía del servicio.");
  }

  const sorted = [...(data.predictions ?? [])].sort(
    (a, b) => b.probability - a.probability
  );

  return {
    topBrand: sorted[0] ?? null,
    predictions: sorted,
    raw: data,
  };
}
