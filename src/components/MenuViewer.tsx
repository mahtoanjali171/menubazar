import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw, Loader2 } from "lucide-react";
import type { Restaurant } from "@/lib/restaurants";

export function MenuViewer({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const count = restaurant.menus.length;
  const src = restaurant.menus[index];

  useEffect(() => setStatus("loading"), [src]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && count > 1) setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft" && count > 1) setIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, onClose]);

  const btn =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/80 text-card-foreground backdrop-blur transition hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${restaurant.name} menu`}
      className="fixed inset-0 z-50 flex flex-col bg-background/85 backdrop-blur-md animate-in fade-in duration-500"
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{restaurant.tagline}</p>
          <h2 className="font-display text-2xl text-primary sm:text-3xl">{restaurant.name}</h2>
        </div>
        <button onClick={onClose} className={btn} aria-label="Close menu and return to the street">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="relative min-h-0 flex-1 px-2 pb-2 sm:px-8">
        {!src ? (
          <Placeholder slug={restaurant.slug} />
        ) : (
          <TransformWrapper key={src} minScale={1} maxScale={6} centerOnInit doubleClick={{ mode: "toggle", step: 2 }}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent wrapperClass="!h-full !w-full rounded-xl" contentClass="!h-full !w-full flex items-center justify-center">
                  <img
                    src={src}
                    alt={`${restaurant.name} menu page ${index + 1}`}
                    onLoad={() => setStatus("ok")}
                    onError={() => setStatus("error")}
                    className={`max-h-full max-w-full object-contain shadow-2xl transition-opacity duration-500 ${status === "ok" ? "opacity-100" : "opacity-0"}`}
                    draggable={false}
                  />
                </TransformComponent>
                {status === "loading" && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading menu…
                  </div>
                )}
                {status === "error" && (
                  <div className="absolute inset-0">
                    <Placeholder slug={restaurant.slug} file={src} />
                  </div>
                )}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                  <button className={btn} onClick={() => zoomOut()} aria-label="Zoom out"><ZoomOut className="h-5 w-5" /></button>
                  <button className={btn} onClick={() => resetTransform()} aria-label="Reset zoom"><RotateCcw className="h-4 w-4" /></button>
                  <button className={btn} onClick={() => zoomIn()} aria-label="Zoom in"><ZoomIn className="h-5 w-5" /></button>
                </div>
              </>
            )}
          </TransformWrapper>
        )}

        {count > 1 && (
          <>
            <button className={`${btn} absolute left-3 top-1/2 -translate-y-1/2 sm:left-10`} onClick={() => setIndex((i) => (i - 1 + count) % count)} aria-label="Previous menu page">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className={`${btn} absolute right-3 top-1/2 -translate-y-1/2 sm:right-10`} onClick={() => setIndex((i) => (i + 1) % count)} aria-label="Next menu page">
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="absolute right-4 top-2 rounded-full bg-card/80 px-3 py-1 text-xs text-card-foreground sm:right-10">
              Page {index + 1} / {count}
            </p>
          </>
        )}
      </div>
      <p className="pb-3 text-center text-xs text-muted-foreground">Pinch, scroll or double-tap to zoom · drag to move</p>
    </div>
  );
}

function Placeholder({ slug, file }: { slug: string; file?: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-sm rounded-xl border border-dashed border-border bg-card/70 p-6 text-center text-card-foreground">
        <p className="font-display text-xl text-primary">Menu image missing</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {file ? <>Couldn't load <code>{file}</code>. </> : null}
          Add the menu photo to <code>public/menus/{slug}/</code>.
        </p>
      </div>
    </div>
  );
}
