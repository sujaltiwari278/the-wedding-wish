"use client";

/**
 * 8-Bit Web Audio API Retro Sound Engine
 * Synthesizes vintage NES/arcade chiptune frequencies without requiring external audio downloads.
 * Persists user mute preferences in localStorage.
 */

const STORAGE_KEY = "ww_sound_muted";

class RetroSoundEngine {
  private audioCtx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.muted = localStorage.getItem(STORAGE_KEY) === "true";
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, muted ? "true" : "false");
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  /**
   * Plays a single chiptune tone
   */
  public playTone(
    freq: number,
    type: OscillatorType = "square",
    duration: number = 0.1,
    gainLevel: number = 0.15,
    delay: number = 0
  ) {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch {
      // Ignore audio synthesis errors on locked audio devices
    }
  }

  /**
   * Crisp 8-bit Shagun Coin Chime ("ba-ding!")
   */
  public playShagunCoin() {
    if (this.muted) return;
    this.playTone(987.77, "square", 0.08, 0.18, 0); // B5
    this.playTone(1318.51, "square", 0.25, 0.15, 0.08); // E6
  }

  /**
   * Triumphant 8-bit Wedding Celebration Fanfare
   */
  public playCelebrationFanfare() {
    if (this.muted) return;
    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.28 }, // C6
      { f: 880.0, d: 0.12 }, // A5
      { f: 1046.5, d: 0.12 }, // C6
      { f: 1318.51, d: 0.45 }, // E6
    ];

    let offset = 0;
    notes.forEach((note) => {
      this.playTone(note.f, "square", note.d, 0.15, offset);
      offset += note.d * 0.85;
    });
  }

  /**
   * Soft retro UI click blip
   */
  public playClickBeep() {
    if (this.muted) return;
    this.playTone(600, "square", 0.03, 0.08, 0);
  }

  /**
   * Pleasant 3-note ascending success chime
   */
  public playSuccessChime() {
    if (this.muted) return;
    this.playTone(440.0, "triangle", 0.1, 0.12, 0); // A4
    this.playTone(554.37, "triangle", 0.1, 0.12, 0.08); // C#5
    this.playTone(659.25, "triangle", 0.22, 0.15, 0.16); // E5
  }
}

export const sound = new RetroSoundEngine();
