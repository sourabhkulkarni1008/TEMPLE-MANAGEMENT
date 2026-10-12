// Web Audio API Sound Synthesizer for Authentic Temple Bell and UI Feedback
class TempleAudioService {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Fluent, Authentic Brass Temple Bell (Shree Ghanti)
   * Acoustically modeled with realistic clapper strike transients,
   * natural harmonic overtones (Tierce, Quint, Nominal), beating shimmer, and soothing long decay.
   */
  playTempleBell(pitchMultiplier = 1.0, isDoubleStrike = true) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Master bus with gentle dynamics limiter
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.85, now);
      masterGain.connect(this.ctx.destination);

      // Helper function to synthesize an individual bell strike
      const ringStrike = (startTime, volumeScale = 1.0, pitchShift = 1.0) => {
        const baseFreq = 587.33 * pitchMultiplier * pitchShift; // Sacred D5 fundamental

        // 1. Clapper Strike Metallic Click / Transient
        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.008));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2800 * pitchShift, startTime);
        noiseFilter.Q.setValueAtTime(4.0, startTime);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.12 * volumeScale, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(startTime);

        // 2. Physical Bell Harmonic Partials (Indian Bronze Bell Acoustical Spectrum)
        const partials = [
          { mult: 0.50, gain: 0.18, decay: 3.8, type: 'sine' },      // Hum tone (warm sub-body)
          { mult: 1.00, gain: 0.55, decay: 3.5, type: 'sine' },      // Prime fundamental
          { mult: 1.19, gain: 0.38, decay: 2.8, type: 'sine' },      // Tierce (minor third)
          { mult: 1.51, gain: 0.32, decay: 2.4, type: 'sine' },      // Quint (fifth)
          { mult: 2.00, gain: 0.35, decay: 2.2, type: 'sine' },      // Nominal (octave)
          { mult: 2.008, gain: 0.28, decay: 2.2, type: 'sine' },     // Detuned shimmer oscillator (generates acoustic beating)
          { mult: 2.76, gain: 0.18, decay: 1.6, type: 'triangle' },  // Super-nominal 1
          { mult: 3.42, gain: 0.12, decay: 1.2, type: 'sine' },      // Super-nominal 2
          { mult: 4.15, gain: 0.09, decay: 0.9, type: 'sine' },      // High brass sheen
          { mult: 5.60, gain: 0.05, decay: 0.6, type: 'sine' },      // Upper metallic sparkle
        ];

        partials.forEach(p => {
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();

          osc.type = p.type;
          osc.frequency.setValueAtTime(baseFreq * p.mult, startTime);

          // Fast smooth strike attack (5ms) followed by natural exponential decay
          gainNode.gain.setValueAtTime(0.0001, startTime);
          gainNode.gain.linearRampToValueAtTime(p.gain * volumeScale * 0.42, startTime + 0.006);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + p.decay);

          osc.connect(gainNode);
          gainNode.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + p.decay + 0.1);
        });
      };

      if (isDoubleStrike) {
        // Natural fluent dual chime: quick gentle touch-tap (Tling) + main resonant strike (Tiiinngg)
        ringStrike(now, 0.45, 1.015);
        ringStrike(now + 0.09, 1.0, 1.0);
      } else {
        ringStrike(now, 1.0, 1.0);
      }

    } catch (e) {
      console.warn('Temple bell audio play failed:', e);
    }
  }

  // Divine Aarti Puja Chime (Harmonious bell sequence)
  playAartiChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (this.isMuted) return;
          this.playTempleBell(freq / 587.33, false);
        }, idx * 140);
      });
    } catch (e) {
      console.warn('Aarti chime error:', e);
    }
  }

  // Instant booking confirmation celebratory chime
  playSuccessChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        setTimeout(() => {
          this.playTempleBell(freq / 587.33, false);
        }, idx * 100);
      });
    } catch (e) {
      console.warn('Success chime error:', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const audioService = new TempleAudioService();
