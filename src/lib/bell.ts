// Soft temple-bell chime synthesized with Web Audio (no audio files needed).
let ctx: AudioContext | null = null;

export function playBell(pitch = 523.25) {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    // Bell-like inharmonic partials, each fading at its own pace.
    const partials: [number, number, number][] = [
      [1, 1, 3.5],
      [2.01, 0.45, 2.4],
      [2.76, 0.3, 1.8],
      [4.07, 0.15, 1.2],
      [0.5, 0.25, 4],
    ];
    for (const [ratio, amp, decay] of partials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = pitch * ratio;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(amp, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    }
  } catch {
    /* audio unavailable — stay silent */
  }
}
