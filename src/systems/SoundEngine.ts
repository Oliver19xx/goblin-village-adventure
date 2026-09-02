/**
 * Web Audio API procedural synthesizer for multi-track chiptune & techno beats.
 * Features dynamic layer toggling as Valentin recruits friends and upgrades the party.
 * Includes iOS & Android Web Audio unlocking with silent HTML5 audio bridge.
 */
export class SoundEngine {
  private static instance: SoundEngine;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private isUnlocked: boolean = false;
  
  // Track layers
  public enableBass: boolean = false;     // Olli's layer
  public enableLead: boolean = false;     // Leander's layer
  public enableArp: boolean = false;      // Candy's layer
  public enableDub: boolean = false;      // Henning's Dub/Reggae layer
  public enableFinale: boolean = false;   // Birthday Finale Drop!

  private currentStep: number = 0;
  private tempo: number = 126; // BPM

  // Silent 1-second WAV to force iOS Safari into media playback mode
  private silentAudio: HTMLAudioElement | null = null;

  public static getInstance(): SoundEngine {
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine();
    }
    return SoundEngine.instance;
  }

  constructor() {
    this.setupSilentAudio();
  }

  private setupSilentAudio(): void {
    if (typeof document !== 'undefined') {
      try {
        const audio = document.createElement('audio');
        audio.setAttribute('x-webkit-airplay', 'deny');
        audio.setAttribute('preload', 'auto');
        audio.setAttribute('loop', 'true');
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        this.silentAudio = audio;
      } catch {
        // ignore
      }
    }
  }

  public initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Unlocks iOS & Android Web Audio by playing silent HTML5 audio and resuming AudioContext.
   */
  public unlockAudio(): void {
    this.initContext();

    // 1. Play silent HTML5 audio (forces iOS out of ambient mute)
    if (this.silentAudio) {
      this.silentAudio.play().catch(() => {});
    }

    // 2. Resume & tick AudioContext
    if (this.ctx) {
      if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
        this.ctx.resume().catch(() => {});
      }
      try {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
      } catch {
        // ignore
      }
    }

    this.isUnlocked = true;

    if (!this.isMuted) {
      this.startMusic();
    }
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked && this.ctx !== null && this.ctx.state === 'running';
  }

  public startMusic(): void {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;

    const stepInterval = (60 / this.tempo / 4) * 1000; // 16th notes
    this.timerId = window.setInterval(() => {
      if (!this.isMuted) {
        this.stepMusic();
      }
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepInterval);
  }

  public stopMusic(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.unlockAudio();
      if (!this.isPlaying) {
        this.startMusic();
      }
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (!this.isMuted) {
      this.unlockAudio();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private stepMusic(): void {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    // 1. Drums (Base layer)
    // Kick on beats 0, 4, 8, 12 (4-on-the-floor)
    if (this.currentStep % 4 === 0) {
      this.playKick(now);
    }
    // Hi-hat on off-beats 2, 6, 10, 14
    if (this.currentStep % 2 === 0) {
      this.playHiHat(now, this.currentStep % 4 === 2 ? 0.08 : 0.03);
    }
    // Snare / Clap on 4 and 12
    if (this.currentStep === 4 || this.currentStep === 12) {
      this.playSnare(now);
    }

    // 2. Bassline (Olli's Layer)
    if (this.enableBass || this.enableFinale) {
      const bassNotes = [110, 110, 130.81, 110, 98, 98, 110, 146.83, 110, 110, 130.81, 110, 92.5, 92.5, 98, 110];
      const freq = bassNotes[this.currentStep];
      if (this.currentStep % 2 === 0 || this.enableFinale) {
        this.playSynthNote(now, freq, 0.12, 'sawtooth', 0.14);
      }
    }

    // 3. Lead Melodic Hooks (Leander's Layer)
    if (this.enableLead || this.enableFinale) {
      const leadNotes = [440, 0, 523.25, 0, 659.25, 587.33, 0, 523.25, 440, 0, 659.25, 0, 783.99, 659.25, 587.33, 523.25];
      const freq = leadNotes[this.currentStep];
      if (freq > 0) {
        this.playSynthNote(now, freq, 0.15, 'square', 0.09);
      }
    }

    // 4. Fast Sparkling Arpeggios (Candy's Layer)
    if (this.enableArp || this.enableFinale) {
      const arpNotes = [523.25, 659.25, 783.99, 1046.5, 659.25, 783.99, 1046.5, 1318.51];
      const freq = arpNotes[this.currentStep % arpNotes.length];
      this.playSynthNote(now, freq, 0.08, 'triangle', 0.10);
    }

    // 5. Dub / Reggae Offbeat Skank Chords (Henning's Layer)
    if (this.enableDub || this.enableFinale) {
      if (this.currentStep % 4 === 2) {
        this.playSynthNote(now, 329.63, 0.08, 'sawtooth', 0.08); // E4
        this.playSynthNote(now, 392.00, 0.08, 'sawtooth', 0.08); // G4
        this.playSynthNote(now, 493.88, 0.08, 'sawtooth', 0.08); // B4
      }
    }

    // 6. Birthday Finale Rave Chords
    if (this.enableFinale && this.currentStep % 4 === 0) {
      this.playSynthNote(now, 261.63 * 2, 0.35, 'sawtooth', 0.07);
      this.playSynthNote(now, 329.63 * 2, 0.35, 'sawtooth', 0.07);
      this.playSynthNote(now, 392.00 * 2, 0.35, 'sawtooth', 0.07);
    }
  }

  private playKick(t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.12);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  private playSnare(t: number): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  private playHiHat(t: number, vol: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(8000, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  private playSynthNote(t: number, freq: number, duration: number, type: OscillatorType, vol: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  // --- Sound Effects ---

  public playPickup(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    this.playSynthNote(t, 587.33, 0.08, 'sine', 0.18);
    this.playSynthNote(t + 0.07, 880.00, 0.12, 'sine', 0.18);
  }

  public playTalk(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const pitch = 320 + Math.random() * 260;
    this.playSynthNote(t, pitch, 0.06, 'triangle', 0.12);
  }

  public playCraft(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    this.playSynthNote(t, 330, 0.08, 'square', 0.14);
    this.playSynthNote(t + 0.09, 440, 0.08, 'square', 0.14);
    this.playSynthNote(t + 0.18, 660, 0.2, 'sawtooth', 0.18);
  }

  public playWarp(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.25);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playQuestComplete(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      this.playSynthNote(t + idx * 0.1, freq, 0.18, 'triangle', 0.22);
    });
  }

  public playBirthdayFanfare(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const fanfare = [
      { f: 392, d: 0.15, p: 0 },
      { f: 392, d: 0.15, p: 0.18 },
      { f: 440, d: 0.3, p: 0.36 },
      { f: 392, d: 0.3, p: 0.7 },
      { f: 523.25, d: 0.3, p: 1.05 },
      { f: 493.88, d: 0.6, p: 1.4 }
    ];
    fanfare.forEach(item => {
      this.playSynthNote(t + item.p, item.f, item.d, 'square', 0.20);
    });
  }
}
