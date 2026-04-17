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

const AZURE_ENDPOINT =
  "https://fastfoodcustomai-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/44f0b41a-112f-4f04-a982-467316e5b209/detect/iterations/Iteration2/image";
const AZURE_KEY =
  "2lq4u4kFv66qOHXOSKWpjkJMZ5EshqXI37anfrwQDHXuv3YtNzKSJQQJ99CDACYeBjFXJ3w3AAAIACOGWooX";

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const buffer = await file.arrayBuffer();

  const res = await fetch(AZURE_ENDPOINT, {
    method: "POST",
    headers: {
      "Prediction-Key": AZURE_KEY,
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
