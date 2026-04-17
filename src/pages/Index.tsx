import { useEffect, useState } from "react";
import { Activity, Radar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConfigPanel } from "@/components/ConfigPanel";
import { UploadZone } from "@/components/UploadZone";
import { ResultsCard } from "@/components/ResultsCard";
import { HistoryPanel, HistoryItem } from "@/components/HistoryPanel";
import { analyzeImage, AnalysisResult } from "@/lib/azure";
import { toast } from "sonner";

const Index = () => {
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (f: File | null) => {
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeImage(endpoint, apiKey, file);
      setResult(res);

      if (res.topBrand) {
        const reader = new FileReader();
        reader.onload = () => {
          const item: HistoryItem = {
            id: crypto.randomUUID(),
            thumbnail: reader.result as string,
            brand: res.topBrand!.tagName,
            confidence: res.topBrand!.probability,
            timestamp: Date.now(),
          };
          const next = [item, ...history].slice(0, 10);
          setHistory(next);
          localStorage.setItem("history", JSON.stringify(next));
        };
        reader.readAsDataURL(file);
        toast.success(`Detectado: ${res.topBrand.tagName}`);
      } else {
        toast.info("Sin coincidencias relevantes");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(msg);
      toast.error("Análisis fallido");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("history");
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
              <Radar className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold leading-none">
                CompetiScan<span className="text-primary">.</span>ai
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Brand detection · Azure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground">
              <Activity className="h-3 w-3 text-success" />
              Live model
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-10">
        <section className="mx-auto mb-10 max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Detección automatizada de competidores
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Identifica marcas en <br className="hidden sm:block" />
            <span className="text-gradient">publicidad urbana</span> al instante
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Sube una imagen y nuestro modelo entrenado en Azure detectará
            competidores con precisión, reemplazando la revisión manual.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <UploadZone
              file={file}
              preview={preview}
              loading={loading}
              onFile={handleFile}
              onAnalyze={handleAnalyze}
              canAnalyze={!!file && !!endpoint && !!apiKey}
            />
            <ResultsCard result={result} error={error} />
          </div>

          <aside className="space-y-6">
            <ConfigPanel
              endpoint={endpoint}
              apiKey={apiKey}
              onChange={(e, k) => {
                setEndpoint(e);
                setApiKey(k);
              }}
            />
            <HistoryPanel items={history} onClear={clearHistory} />
          </aside>
        </div>

        <footer className="mt-16 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          Frontend interface · Conectado a Azure Custom Vision API
        </footer>
      </main>
    </div>
  );
};

export default Index;
