// Click sounds with Web Audio. No audio file, no network. The context is made on the first click,
// which the caller sends from a user gesture and only while the toggle is on. A failure is silent.
import { clickPlan, type ClickKind, type ClickPhase } from "./sound-plan.ts";

export interface Clicker {
  click(kind: ClickKind, phase: ClickPhase): void;
}

export function createClicker(): Clicker {
  let ctx: AudioContext | null | undefined;
  return {
    click(kind, phase) {
      try {
        if (ctx === undefined) {
          const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
          const Ctor = w.AudioContext ?? w.webkitAudioContext;
          ctx = Ctor === undefined ? null : new Ctor();
        }
        if (ctx === null) return;
        if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
        const plan = clickPlan(kind, phase);
        const now = ctx.currentTime;
        const end = now + plan.ms / 1000;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = plan.freqHz;
        gain.gain.setValueAtTime(plan.gain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, end); // fast decay
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(end + 0.01);
      } catch {
        ctx = null; // blocked or not supported: stay silent
      }
    },
  };
}
