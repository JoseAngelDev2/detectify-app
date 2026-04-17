import { Target, TrendingUp, Tag, AlertCircle } from "lucide-react";
import { AnalysisResult } from "@/lib/azure";
import { Progress } from "@/components/ui/progress";

interface Props {
  result: AnalysisResult | null;
  error: string | null;
}

export const ResultsCard = ({ result, error }: Props) => {
  if (error) {
    return (
      <div className="glass rounded-2xl border-destructive/30 p-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-destructive">
              Error en el análisis
            </h3>
            <p className="mt-1 text-sm text-muted-foreground break-words">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
          <Target className="h-5 w-5" />
        </div>
        <p className="font-display text-sm font-medium">Esperando análisis</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Los resultados aparecerán aquí
        </p>
      </div>
    );
  }

  const top = result.topBrand;
  const others = result.predictions.slice(1, 6);
  const confidence = top ? Math.round(top.probability * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass relative overflow-hidden rounded-2xl p-6 shadow-[var(--shadow-lg)]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Detección completada
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {result.predictions.length} tags
            </span>
          </div>

          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Marca detectada
          </p>
          <h3 className="mt-1 font-display text-3xl font-bold text-gradient">
            {top?.tagName ?? "Sin detección"}
          </h3>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Confianza
              </span>
              <span className="font-mono font-semibold">{confidence}%</span>
            </div>
            <Progress value={confidence} className="h-2" />
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-display text-sm font-semibold">Otras predicciones</h4>
          </div>
          <ul className="space-y-2.5">
            {others.map((p, i) => (
              <li
                key={`${p.tagName}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
              >
                <span className="font-mono text-xs text-muted-foreground w-5">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm font-medium">{p.tagName}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {Math.round(p.probability * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
