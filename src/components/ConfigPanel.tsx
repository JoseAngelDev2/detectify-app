import { useEffect, useState } from "react";
import { KeyRound, Link2, Shield, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  endpoint: string;
  apiKey: string;
  onChange: (endpoint: string, apiKey: string) => void;
}

export const ConfigPanel = ({ endpoint, apiKey, onChange }: Props) => {
  const [showKey, setShowKey] = useState(false);
  const [localEndpoint, setLocalEndpoint] = useState(endpoint);
  const [localKey, setLocalKey] = useState(apiKey);

  useEffect(() => {
    const e = localStorage.getItem("azure_endpoint") ?? "";
    const k = localStorage.getItem("azure_key") ?? "";
    setLocalEndpoint(e);
    setLocalKey(k);
    onChange(e, k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    localStorage.setItem("azure_endpoint", localEndpoint);
    localStorage.setItem("azure_key", localKey);
    onChange(localEndpoint, localKey);
  };

  const isConfigured = endpoint && apiKey;

  return (
    <div className="glass rounded-2xl p-6 shadow-[var(--shadow-md)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold">Configuración Azure</h2>
            <p className="text-xs text-muted-foreground">Credenciales del modelo entrenado</p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            isConfigured
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isConfigured ? "bg-success animate-pulse" : "bg-muted-foreground"
            }`}
          />
          {isConfigured ? "Conectado" : "Sin configurar"}
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="endpoint" className="text-xs font-medium text-muted-foreground">
            Endpoint URL
          </Label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="endpoint"
              placeholder="https://<resource>.cognitiveservices.azure.com/..."
              value={localEndpoint}
              onChange={(e) => setLocalEndpoint(e.target.value)}
              className="h-11 pl-10 font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apikey" className="text-xs font-medium text-muted-foreground">
            Prediction Key
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="apikey"
              type={showKey ? "text" : "password"}
              placeholder="••••••••••••••••"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              className="h-11 pl-10 pr-10 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Mostrar/ocultar"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button onClick={save} className="w-full" variant="secondary">
          Guardar configuración
        </Button>
      </div>
    </div>
  );
};
