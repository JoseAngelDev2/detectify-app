import { useEffect, useRef, useState } from "react";
import { AzurePrediction } from "@/lib/azure";

interface Props {
  src: string;
  predictions: AzurePrediction[];
  threshold?: number;
}

// Distinct HSL hues per brand
const COLORS: Record<string, string> = {};
const PALETTE = [
  "0 85% 60%",
  "150 70% 45%",
  "210 90% 60%",
  "45 95% 55%",
  "280 75% 65%",
  "180 70% 50%",
];

const colorFor = (tag: string) => {
  if (!COLORS[tag]) {
    COLORS[tag] = PALETTE[Object.keys(COLORS).length % PALETTE.length];
  }
  return COLORS[tag];
};

export const BoundingBoxOverlay = ({ src, predictions, threshold = 0.3 }: Props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const el = imgRef.current;
      if (el) setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [src]);

  const filtered = predictions.filter(
    (p) => p.boundingBox && p.probability >= threshold
  );

  return (
    <div className="relative inline-block w-full">
      <img
        ref={imgRef}
        src={src}
        alt="Análisis"
        onLoad={(e) => {
          const el = e.currentTarget;
          setSize({ w: el.clientWidth, h: el.clientHeight });
        }}
        className="max-h-[420px] w-full object-contain"
      />
      <div
        className="pointer-events-none absolute left-0 top-0"
        style={{ width: size.w, height: size.h }}
      >
        {filtered.map((p, i) => {
          const bb = p.boundingBox!;
          const color = colorFor(p.tagName);
          const left = bb.left * size.w;
          const top = bb.top * size.h;
          const width = bb.width * size.w;
          const height = bb.height * size.h;
          const labelOnTop = top > 24;
          return (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left,
                top,
                width,
                height,
                border: `2px solid hsl(${color})`,
                boxShadow: `0 0 0 1px hsl(${color} / 0.3), 0 0 12px hsl(${color} / 0.4)`,
              }}
            >
              <span
                className="absolute left-0 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-white"
                style={{
                  backgroundColor: `hsl(${color})`,
                  [labelOnTop ? "bottom" : "top"]: "100%",
                  marginTop: labelOnTop ? 0 : 2,
                  marginBottom: labelOnTop ? 2 : 0,
                }}
              >
                {p.tagName} · {Math.round(p.probability * 100)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
