import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HistoryItem {
  id: string;
  thumbnail: string;
  brand: string;
  confidence: number;
  timestamp: number;
}

interface Props {
  items: HistoryItem[];
  onClear: () => void;
}

export const HistoryPanel = ({ items, onClear }: Props) => {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-display text-sm font-semibold">Historial</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {items.length}
          </span>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          Aún no hay análisis previos
        </p>
      ) : (
        <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-2 transition-colors hover:bg-muted/60"
            >
              <img
                src={item.thumbnail}
                alt=""
                className="h-12 w-12 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.brand}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <span className="font-mono text-xs text-primary">
                {Math.round(item.confidence * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
