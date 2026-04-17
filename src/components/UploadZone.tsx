import { Upload, ImageIcon, X, Loader2, Sparkles } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BoundingBoxOverlay } from "@/components/BoundingBoxOverlay";
import { AzurePrediction } from "@/lib/azure";

interface Props {
  file: File | null;
  preview: string | null;
  loading: boolean;
  onFile: (file: File | null) => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
  predictions?: AzurePrediction[];
}

export const UploadZone = ({ file, preview, loading, onFile, onAnalyze, canAnalyze, predictions = [] }: Props) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (!f) return;
      if (!f.type.startsWith("image/")) return;
      onFile(f);
    },
    [onFile]
  );

  return (
    <div className="glass relative overflow-hidden rounded-2xl shadow-[var(--shadow-lg)]">
      <div className="absolute inset-0 bg-glow opacity-60 pointer-events-none" />

      <div className="relative p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Análisis de imagen</h2>
            <p className="text-sm text-muted-foreground">Sube una foto de publicidad urbana</p>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Powered by Azure AI
          </span>
        </div>

        {!preview ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`group flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              dragging
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-transform group-hover:scale-110 animate-float">
              <Upload className="h-7 w-7" />
            </div>
            <p className="font-display text-base font-semibold">
              Arrastra una imagen o <span className="text-gradient">explora</span>
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              PNG, JPG o WEBP · hasta 10MB
            </p>
          </label>
        ) : (
          <div className="space-y-4 animate-scale-in">
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
              {predictions.length > 0 ? (
                <BoundingBoxOverlay src={preview} predictions={predictions} />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-[420px] w-full object-contain"
                />
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
                  </div>
                  <div className="relative flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-6 py-4 backdrop-blur-md">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="font-mono text-xs text-muted-foreground">
                      Analizando con Azure AI...
                    </p>
                  </div>
                </div>
              )}
              {!loading && (
                <button
                  onClick={() => onFile(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Quitar"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="truncate font-mono">{file?.name}</span>
                <span className="ml-auto text-muted-foreground">
                  {file ? `${(file.size / 1024).toFixed(0)} KB` : ""}
                </span>
              </div>
              <Button
                onClick={onAnalyze}
                disabled={!canAnalyze || loading}
                className="h-11 gap-2 bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analizando
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Detectar competidores
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
