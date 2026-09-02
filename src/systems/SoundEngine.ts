/**
 * Studio Sample-based Web Audio Engine for dynamic Goa & Psytrance music.
 * Features:
 *  - 6 sample-accurate synchronized audio stems (Drums, Rolling Bass, Goa Lead, Psy Zaps, Dub Chords, Finale)
 *  - Dynamic real-time layering with smooth 1-second crossfades as Valentin recruits friends
 *  - Pleasant, organic sound effects (pickup, talk, craft, warp, quest, fanfare)
 *  - iOS & Android Web Audio unlocking with silent HTML5 audio bridge
 */
export class SoundEngine {
  private static instance: SoundEngine;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private isUnlocked: boolean = false;

  // Track layer states
  private _enableBass: boolean = false;     // Olli's Rolling Psy-Bass
  private _enableLead: boolean = false;     // Leander's Goa Synth Lead
  private _enableArp: boolean = false;      // Candy's Psy Zaps & High Arps
  private _enableDub: boolean = false;      // Henning's Shamanic Dub-Psy
  private _enableFinale: boolean = false;   // Grand Birthday Goa Drop!

  // Audio Buffers
  private stemBuffers: Map<string, AudioBuffer> = new Map();
  private sfxBuffers: Map<string, AudioBuffer> = new Map();
  private isLoaded: boolean = false;
  private isLoading: boolean = false;

  // Active playing stem source nodes & gain nodes
  private stemSources: Map<string, AudioBufferSourceNode> = new Map();
  private stemGains: Map<string, GainNode> = new Map();
  private masterGain: GainNode | null = null;

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

  // Layer property getters and setters with automatic smooth volume transitions
  public get enableBass(): boolean { return this._enableBass; }
  public set enableBass(val: boolean) {
    this._enableBass = val;
    this.updateLayers();
  }

  public get enableLead(): boolean { return this._enableLead; }
  public set enableLead(val: boolean) {
    this._enableLead = val;
    this.updateLayers();
  }

  public get enableArp(): boolean { return this._enableArp; }
  public set enableArp(val: boolean) {
    this._enableArp = val;
    this.updateLayers();
  }

  public get enableDub(): boolean { return this._enableDub; }
  public set enableDub(val: boolean) {
    this._enableDub = val;
    this.updateLayers();
  }

  public get enableFinale(): boolean { return this._enableFinale; }
  public set enableFinale(val: boolean) {
    this._enableFinale = val;
    this.updateLayers();
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
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.85, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
      this.ctx.resume().catch(() => {});
    }
    if (!this.isLoaded && !this.isLoading) {
      this.loadAllAudio();
    }
    return this.ctx;
  }

  /**
   * Pre-fetches and decodes all WAV audio stems and SFX
   */
  private async loadAllAudio(): Promise<void> {
    if (!this.ctx || this.isLoading || this.isLoaded) return;
    this.isLoading = true;

    const stems = ['drums', 'bass', 'lead', 'zaps', 'dub', 'finale'];
    const sfxs = ['pickup', 'talk', 'craft', 'warp', 'quest', 'fanfare'];

    try {
      const loadPromises = [
        ...stems.map(async (name) => {
          try {
            const url = `./audio/stem_${name}.wav`;
            const res = await fetch(url);
            const arrayBuf = await res.arrayBuffer();
            if (this.ctx) {
              const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
              this.stemBuffers.set(name, audioBuf);
            }
          } catch (e) {
            console.warn(`Could not load audio stem_${name}.wav:`, e);
          }
        }),
        ...sfxs.map(async (name) => {
          try {
            const url = `./audio/sfx_${name}.wav`;
            const res = await fetch(url);
            const arrayBuf = await res.arrayBuffer();
            if (this.ctx) {
              const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
              this.sfxBuffers.set(name, audioBuf);
            }
          } catch (e) {
            console.warn(`Could not load sfx_${name}.wav:`, e);
          }
        })
      ];

      await Promise.all(loadPromises);
      this.isLoaded = true;
      this.isLoading = false;

      // If playback was requested while loading, start it now
      if (this.isPlaying && !this.isMuted) {
        this.restartStemPlayback();
      }
    } catch (err) {
      console.error('Audio asset loading error:', err);
      this.isLoading = false;
    }
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

    if (this.isLoaded) {
      this.restartStemPlayback();
    }
  }

  /**
   * Starts all 6 audio stems in exact sample-accurate lockstep
   */
  private restartStemPlayback(): void {
    if (!this.ctx || !this.masterGain || !this.isLoaded) return;

    // Stop any existing stem sources
    this.stopStemSources();

    const now = this.ctx.currentTime;
    const startTime = now + 0.05; // Tight start buffer
    const stems = ['drums', 'bass', 'lead', 'zaps', 'dub', 'finale'];

    stems.forEach(stemName => {
      const buf = this.stemBuffers.get(stemName);
      if (!buf || !this.ctx || !this.masterGain) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buf;
      source.loop = true;

      const gain = this.ctx.createGain();
      const targetGain = this.getTargetGainForStem(stemName);
      gain.gain.setValueAtTime(targetGain, startTime);

      source.connect(gain);
      gain.connect(this.masterGain);

      source.start(startTime);

      this.stemSources.set(stemName, source);
      this.stemGains.set(stemName, gain);
    });
  }

  private stopStemSources(): void {
    this.stemSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // ignore
      }
    });
    this.stemSources.clear();
    this.stemGains.clear();
  }

  public stopMusic(): void {
    this.isPlaying = false;
    this.stopStemSources();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0.0 : 0.85, now + 0.1);
    }
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
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0.0 : 0.85, now + 0.1);
    }
    if (!this.isMuted) {
      this.unlockAudio();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Calculates target gain for each stem based on recruited friends & party progression
   */
  private getTargetGainForStem(stemName: string): number {
    if (this.isMuted) return 0.0;

    switch (stemName) {
      case 'drums':
        return 0.80; // Always active foundation groove
      case 'bass':
        return (this._enableBass || this._enableFinale) ? 0.85 : 0.0; // Olli's Rolling Psy-Bass
      case 'lead':
        return (this._enableLead || this._enableFinale) ? 0.75 : 0.0; // Leander's Goa Synth Lead
      case 'zaps':
        return (this._enableArp || this._enableFinale) ? 0.65 : 0.0;  // Candy's Psy Zaps & Crystal Arps
      case 'dub':
        return (this._enableDub || this._enableFinale) ? 0.70 : 0.0;  // Henning's Shamanic Dub-Psy & Pad
      case 'finale':
        return this._enableFinale ? 0.85 : 0.0;                       // Grand Birthday Goa Drop!
      default:
        return 0.0;
    }
  }

  /**
   * Smoothly updates stem gains with a 0.8-second musical crossfade
   */
  public updateLayers(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.stemGains.forEach((gainNode, stemName) => {
      const targetGain = this.getTargetGainForStem(stemName);
      try {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.8);
      } catch {
        gainNode.gain.value = targetGain;
      }
    });
  }

  // ==========================================
  // SAMPLE-BASED SOUND EFFECTS (SFX)
  // ==========================================

  private playSfxBuffer(name: string, volume: number = 0.6, pitchVariation: number = 0.0): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const buf = this.sfxBuffers.get(name);
    if (!buf) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buf;

    if (pitchVariation > 0) {
      const rate = 1.0 + (Math.random() * 2.0 - 1.0) * pitchVariation;
      source.playbackRate.setValueAtTime(rate, this.ctx.currentTime);
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);

    source.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    source.start(0);
  }

  public playPickup(): void {
    this.playSfxBuffer('pickup', 0.55, 0.06);
  }

  public playTalk(): void {
    this.playSfxBuffer('talk', 0.40, 0.12);
  }

  public playCraft(): void {
    this.playSfxBuffer('craft', 0.65, 0.0);
  }

  public playWarp(): void {
    this.playSfxBuffer('warp', 0.50, 0.04);
  }

  public playQuestComplete(): void {
    this.playSfxBuffer('quest', 0.70, 0.0);
  }

  public playBirthdayFanfare(): void {
    this.playSfxBuffer('fanfare', 0.80, 0.0);
  }
}

