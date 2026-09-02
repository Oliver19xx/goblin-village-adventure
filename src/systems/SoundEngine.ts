/**
 * Web Audio API procedural synthesizer for authentic Psytrance & Goa Trance beats.
 * Features:
 *  - 140 BPM driving Psytrance tempo
 *  - Punchy 4-on-the-floor Psy Kick & Offbeat Hats
 *  - Legendary rolling 16th-note Psy-Bassline ("K-B-B-B" / Olli)
 *  - Hypnotic Eastern / Phrygian Goa Trance Lead Melodies with delay (Leander)
 *  - Sparkling Psychedelic Laser Zaps & Crystalline Arpeggios (Candy)
 *  - Shamanic Dub-Psy Chords & Resonant Tribal Echoes (Henning)
 *  - Full-Power Goa Trance Euphoria Finale Drop!
 *  - iOS & Android Web Audio unlocking with silent HTML5 audio bridge.
 */
export class SoundEngine {
  private static instance: SoundEngine;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private isUnlocked: boolean = false;
  
  // Track layers unlocked by Valentin's friends
  public enableBass: boolean = false;     // Olli's Rolling Psy-Bass
  public enableLead: boolean = false;     // Leander's Goa Synth Lead
  public enableArp: boolean = false;      // Candy's Psy Zaps & High Arps
  public enableDub: boolean = false;      // Henning's Shamanic Dub-Psy
  public enableFinale: boolean = false;   // Grand Birthday Goa Drop!

  private currentStep: number = 0;
  private tempo: number = 140; // 140 BPM Psytrance & Goa tempo

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

    const stepInterval = (60 / this.tempo / 4) * 1000; // 16th notes (~107.14ms at 140 BPM)
    this.timerId = window.setInterval(() => {
      if (!this.isMuted) {
        this.stepMusic();
      }
      this.currentStep = (this.currentStep + 1) % 64; // 64-step (4-bar) Goa loop
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

  /**
   * Main Psytrance / Goa Sequencer Step (64 steps = 4 bars)
   */
  private stepMusic(): void {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const step16 = this.currentStep % 16;
    const bar = Math.floor(this.currentStep / 16);

    // ==========================================
    // 1. DRUMS (Base Layer: Psy Kick & Hats)
    // ==========================================
    // Punchy 4-on-the-floor Psy Kick (beats 0, 4, 8, 12)
    if (step16 % 4 === 0) {
      this.playPsyKick(now);
    }

    // Sizzling Offbeat Open Hi-Hat on steps 2, 6, 10, 14
    if (step16 % 4 === 2) {
      this.playPsyHiHat(now, 0.09, 0.06);
    } else if (step16 % 2 === 0) {
      // 8th-note closed hat groove
      this.playPsyHiHat(now, 0.04, 0.03);
    }

    // Dynamic 16th-note Psy Shaker
    this.playPsyShaker(now, (step16 % 2 === 1) ? 0.025 : 0.015);

    // Snappy Psy Snare / Clap on beats 4 & 12
    if (step16 === 4 || step16 === 12) {
      this.playPsySnare(now);
    }

    // ==========================================
    // 2. ROLLING PSY BASSLINE (Olli's Layer)
    // ==========================================
    // Authentic "K-B-B-B" rolling bassline on steps 1, 2, 3 | 5, 6, 7 | 9, 10, 11 | 13, 14, 15
    if (this.enableBass || this.enableFinale) {
      const isBassStep = step16 % 4 !== 0; // Steps 1, 2, 3 (offbeats behind the kick)
      if (isBassStep || this.enableFinale) {
        // F# root (46.25 Hz) with occasional G (49.00 Hz) and high octave (92.50 Hz) variation
        let rootFreq = 46.25; // F#1
        if (bar === 2) rootFreq = 49.00; // G1
        if (bar === 3 && step16 >= 8) rootFreq = 55.00; // A1
        
        const isOctaveJump = (step16 === 15 && bar % 2 === 1);
        const noteFreq = isOctaveJump ? rootFreq * 2 : rootFreq;
        const accent = (step16 % 4 === 1); // Extra punch right after kick

        this.playRollingPsyBass(now, noteFreq, accent);
      }
    }

    // ==========================================
    // 3. GOA SYNTH LEAD (Leander's Layer)
    // ==========================================
    // Hypnotic Eastern / Phrygian Dominant Goa melody
    if (this.enableLead || this.enableFinale) {
      // 32-step Goa melody sequence
      const goaMelody = [
        370.00, 392.00, 466.16, 493.88, 554.37, 493.88, 466.16, 392.00, // F#4, G4, A#4, B4, C#5, B4, A#4, G4
        370.00, 466.16, 554.37, 740.00, 659.25, 554.37, 466.16, 392.00, // F#4, A#4, C#5, F#5, E5, C#5, A#4, G4
        493.88, 554.37, 659.25, 740.00, 830.61, 740.00, 659.25, 554.37, // B4, C#5, E5, F#5, G#5, F#5, E5, C#5
        740.00, 659.25, 554.37, 466.16, 392.00, 370.00, 329.63, 370.00  // F#5, E5, C#5, A#4, G4, F#4, E4, F#4
      ];

      const step32 = this.currentStep % 32;
      const leadFreq = goaMelody[step32];
      const isLeadActive = (step32 % 2 === 0) || (this.enableFinale && step32 % 2 === 1);

      if (isLeadActive && leadFreq) {
        this.playGoaLead(now, leadFreq, 0.14, bar >= 2);
      }
    }

    // ==========================================
    // 4. PSYCHEDELIC ZAPS & CRYSTAL ARPS (Candy)
    // ==========================================
    if (this.enableArp || this.enableFinale) {
      // Resonant laser zaps on syncopated steps (every 8 steps)
      if (this.currentStep % 8 === 6) {
        this.playPsyZap(now);
      }

      // Fast high-register shimmering crystalline arp
      const crystalArp = [740.00, 932.33, 1108.73, 1480.00, 1108.73, 932.33, 1480.00, 1864.66];
      const arpFreq = crystalArp[step16 % crystalArp.length];
      this.playCrystalArp(now, arpFreq);
    }

    // ==========================================
    // 5. SHAMANIC DUB-PSY CHORDS (Henning's Layer)
    // ==========================================
    if (this.enableDub || this.enableFinale) {
      // Resonant psychedelic dub-chords with echo simulation on steps 2 & 10
      if (step16 === 2 || step16 === 10) {
        const root = (bar === 2) ? 196.00 : 185.00; // G3 / F#3
        this.playPsyDubChord(now, root);
      }
    }

    // ==========================================
    // 6. GRAND BIRTHDAY FINALE GOA DROP!
    // ==========================================
    if (this.enableFinale && step16 % 4 === 0) {
      // Triumphant layered Goa trance power chords with stereo wash
      this.playFinaleGoaChord(now);
    }
  }

  // ==========================================
  // SYNTHESIS INSTRUMENTS
  // ==========================================

  /**
   * Punchy, clicky Psytrance Kick (Sine with sharp pitch drop & attack transient)
   */
  private playPsyKick(t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Sharp pitch drop from 200Hz down to 36Hz for maximum punch
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(36, t + 0.085);

    // Tight clicky gain envelope
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.10);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  /**
   * Resonant Rolling 16th Psy Bass ("K-B-B-B") with tight 24dB lowpass envelope
   */
  private playRollingPsyBass(t: number, freq: number, accent: boolean): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    // Resonant Lowpass Filter (The classic Psytrance squelch)
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(7.5, t); // High resonance for rubbery bite
    const startCutoff = accent ? 1800 : 1300;
    filter.frequency.setValueAtTime(startCutoff, t);
    filter.frequency.exponentialRampToValueAtTime(140, t + 0.065);

    // Fast snappy gain envelope
    const vol = accent ? 0.22 : 0.17;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Hypnotic Goa Trance Lead Synth with Resonant Filter & Echo Tap
   */
  private playGoaLead(t: number, freq: number, duration: number, isSwept: boolean): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    // Resonant Goa Bandpass/Lowpass filter sweep
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(6.0, t);
    const topCutoff = isSwept ? 3800 : 2600;
    filter.frequency.setValueAtTime(topCutoff, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + duration);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration + 0.01);

    // Simulated Goa Stereo Echo Tap (Delay effect)
    const delayTime = t + 0.107; // 1 step delay
    const echoGain = this.ctx.createGain();
    const echoOsc = this.ctx.createOscillator();
    echoOsc.type = 'sawtooth';
    echoOsc.frequency.setValueAtTime(freq, delayTime);
    echoGain.gain.setValueAtTime(0.045, delayTime);
    echoGain.gain.exponentialRampToValueAtTime(0.0001, delayTime + duration * 0.7);

    echoOsc.connect(filter);
    filter.connect(echoGain);
    echoGain.connect(this.ctx.destination);

    echoOsc.start(delayTime);
    echoOsc.stop(delayTime + duration * 0.75);
  }

  /**
   * Psychedelic Laser Zap (Fast resonant pitch sweep)
   */
  private playPsyZap(t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Laser sweep from 4200Hz down to 400Hz
    osc.frequency.setValueAtTime(4200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.12);

    filter.type = 'bandpass';
    filter.Q.setValueAtTime(10.0, t);
    filter.frequency.setValueAtTime(2500, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.12);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  /**
   * Crystalline High Arpeggio (Candy's sparkling high-frequency arp)
   */
  private playCrystalArp(t: number, freq: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * Shamanic Dub-Psy Chord Stab with Resonant Filter (Henning's Layer)
   */
  private playPsyDubChord(t: number, rootFreq: number): void {
    if (!this.ctx) return;
    // Minor triad: Root, Minor 3rd, 5th, Octave
    const chord = [rootFreq, rootFreq * 1.1892, rootFreq * 1.4983, rootFreq * 2];

    chord.forEach(f => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(5.5, t);
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.16);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.19);

      // Tape Echo simulation (delayed tap)
      const echoT = t + 0.107;
      const echoOsc = this.ctx.createOscillator();
      const echoGain = this.ctx.createGain();
      echoOsc.type = 'sawtooth';
      echoOsc.frequency.setValueAtTime(f, echoT);
      echoGain.gain.setValueAtTime(0.02, echoT);
      echoGain.gain.exponentialRampToValueAtTime(0.0001, echoT + 0.12);

      echoOsc.connect(filter);
      filter.connect(echoGain);
      echoGain.connect(this.ctx.destination);

      echoOsc.start(echoT);
      echoOsc.stop(echoT + 0.13);
    });
  }

  /**
   * Grand Finale Euphoric Goa Chord
   */
  private playFinaleGoaChord(t: number): void {
    if (!this.ctx) return;
    const fanfareNotes = [370.00 * 2, 466.16 * 2, 554.37 * 2, 740.00 * 2]; // F# Major triad high
    fanfareNotes.forEach(f => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.29);
    });
  }

  /**
   * Psytrance Snare & Clap
   */
  private playPsySnare(t: number): void {
    if (!this.ctx) return;
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  /**
   * Sizzling Psy Hi-Hat
   */
  private playPsyHiHat(t: number, vol: number, decay: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(9500, t);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, t);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + decay + 0.005);
  }

  /**
   * 16th-Note Metallic Shaker
   */
  private playPsyShaker(t: number, vol: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(11000, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.028);
  }

  // ==========================================
  // PSYCHEDELIC SOUND EFFECTS
  // ==========================================

  public playPickup(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    this.playPsyZap(t);
  }

  public playTalk(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const pitch = 400 + Math.random() * 300;
    this.playCrystalArp(t, pitch);
  }

  public playCraft(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    this.playRollingPsyBass(t, 92.5, true);
    this.playGoaLead(t + 0.08, 740, 0.15, true);
  }

  public playWarp(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.28);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.29);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.30);
  }

  public playQuestComplete(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const notes = [466.16, 554.37, 740.00, 932.33]; // Goa Phrygian Arp
    notes.forEach((freq, idx) => {
      this.playGoaLead(t + idx * 0.09, freq, 0.16, true);
    });
  }

  public playBirthdayFanfare(): void {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const fanfare = [
      { f: 370.00, d: 0.14, p: 0 },
      { f: 466.16, d: 0.14, p: 0.15 },
      { f: 554.37, d: 0.28, p: 0.30 },
      { f: 466.16, d: 0.28, p: 0.58 },
      { f: 740.00, d: 0.28, p: 0.86 },
      { f: 932.33, d: 0.55, p: 1.15 }
    ];
    fanfare.forEach(item => {
      this.playGoaLead(t + item.p, item.f, item.d, true);
    });
  }
}
