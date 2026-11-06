import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { RESTAURANTS, type Restaurant } from "@/lib/restaurants";
import { MenuViewer } from "@/components/MenuViewer";
import { playBell } from "@/lib/bell";

const StreetScene = lazy(() => import("@/components/street/StreetScene"));

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MenuBazar — Explore a miniature 3D food street" },
      { name: "description", content: "Wander a tiny Indian food street and open the real menus of Chhotu Dhaba, Hub 360 and Dragon Delight." },
      { property: "og:title", content: "MenuBazar — Explore a miniature 3D food street" },
      { property: "og:description", content: "Tap a restaurant, watch its lights come on, and read its original menu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Index() {
  const [entered, setEntered] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [open, setOpen] = useState<Restaurant | null>(null);

  useEffect(() => setWebgl(hasWebGL()), []);

  const select = useCallback((r: Restaurant) => {
    setOpen(null);
    setSelected(r);
    playBell({ "chhotu-dhaba": 523.25, "hub-360": 587.33, "dragon-delight": 659.25 }[r.slug]);
  }, []);
  const arrive = useCallback((r: Restaurant) => setOpen(r), []);
  const close = useCallback(() => {
    setOpen(null);
    setSelected(null);
  }, []);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      {webgl && (
        <Suspense fallback={<Loading />}>
          <StreetScene selected={selected} onSelect={select} onArrive={arrive} />
        </Suspense>
      )}

      {webgl === false && (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
          <h1 className="font-display text-5xl text-primary">MenuBazar</h1>
          <p className="max-w-md text-muted-foreground">Your browser can't show the 3D street, but every menu is still here.</p>
          <div className="grid w-full max-w-md gap-3">
            {RESTAURANTS.map((r) => (
              <button key={r.slug} onClick={() => {
                  playBell();
                  setOpen(r);
                }} className="rounded-xl border border-border bg-card px-5 py-4 text-left font-display text-xl text-card-foreground hover:border-primary">
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {webgl && (
        <>
          <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-6">
            <div>
              <h1 className="font-display text-3xl text-primary drop-shadow sm:text-4xl">MenuBazar</h1>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">A tiny food street</p>
            </div>
          </header>

          {entered && !open && (
            <nav aria-label="Restaurants" className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <p className="text-xs text-muted-foreground">Drag to look · pinch to zoom · two fingers to slide · tap a shop</p>
              <div className="flex flex-wrap justify-center gap-2">
                {RESTAURANTS.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => select(r)}
                    className={`rounded-full border px-4 py-2 text-sm backdrop-blur transition ${selected?.slug === r.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/70 text-card-foreground hover:border-primary"}`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {!entered && (
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background via-background/40 to-transparent pb-16 sm:items-center sm:pb-0">
              <div className="max-w-lg px-6 text-center animate-in fade-in zoom-in-95 duration-1000">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Evening on the bazaar</p>
                <h2 className="mt-3 font-display text-5xl leading-tight text-primary sm:text-6xl">Three kitchens, one little street</h2>
                <p className="mt-4 text-muted-foreground">Stroll past Chhotu Dhaba, Hub 360 and Dragon Delight. Tap a shopfront to light it up and read its real menu.</p>
                <button onClick={() => {
                  playBell(440);
                  setEntered(true);
                }} className="mt-8 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-105">
                  Enter the street
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {open && <MenuViewer restaurant={open} onClose={close} />}
    </main>
  );
}

function Loading() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm">Building the street…</p>
    </div>
  );
}
