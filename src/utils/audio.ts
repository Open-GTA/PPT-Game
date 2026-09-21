// Web Audio API synth for game sounds without external audio assets

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play pleasant harmonic chime for participant 0-3
  playParticipant(index: number) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Chords for Cyan, Rose, Amber, Emerald
      const chordMap: number[][] = [
        [523.25, 659.25, 783.99], // C5, E5, G5 (Cyan)
        [440.00, 554.37, 659.25], // A4, C#5, E5 (Rose)
        [370.00, 466.16, 554.37], // F#4, A#4, C#5 (Amber)
        [587.33, 739.99, 880.00], // D5, F#5, A5 (Emerald)
      ];

      const freqs = chordMap[index % chordMap.length] || chordMap[0];
      const waveType: OscillatorType = index % 2 === 0 ? 'sine' : 'triangle';

      freqs.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        
        gain.gain.setValueAtTime(0.13, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.36);
      });
    } catch {
      // Audio playback safely guarded
    }
  }

  // Pleasant chime for Team A (High bright harmonic chord)
  playTeamA() {
    this.playParticipant(0);
  }

  // Warm chime for Team B (Rich bright chord)
  playTeamB() {
    this.playParticipant(1);
  }

  // Slide transition whoosh/tick
  playSlideClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore
    }
  }

  // Reset sound
  playReset() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Ignore
    }
  }

  // Victory fanfare
  playFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 523.25, d: 0.12, t: 0.14 },
        { f: 523.25, d: 0.12, t: 0.28 },
        { f: 659.25, d: 0.35, t: 0.42 },
        { f: 587.33, d: 0.15, t: 0.8 },
        { f: 783.99, d: 0.6, t: 0.98 }
      ];

      notes.forEach(({ f, d, t }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);
        
        gain.gain.setValueAtTime(0.12, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundEffects = new SoundEffects();
