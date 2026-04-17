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

export async function analyzeImage(
  endpoint: string,
  apiKey: string,
  file: File
): Promise<AnalysisResult> {
  if (!endpoint || !apiKey) {
    throw new Error("Configura el endpoint y la API key de Azure.");
  }

  const buffer = await file.arrayBuffer();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Prediction-Key": apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Azure respondió ${res.status}: ${text || res.statusText}`);
  }

  const data: AzureResponse = await res.json();
  const sorted = [...(data.predictions ?? [])].sort(
    (a, b) => b.probability - a.probability
  );

  return {
    topBrand: sorted[0] ?? null,
    predictions: sorted,
    raw: data,
  };
}
