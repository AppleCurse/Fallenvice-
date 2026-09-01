class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private activeNodes: { stop: () => void }[] = [];
  private chimeTimeout: number | null = null;

  public init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
  }

  public async start(): Promise<boolean> {
    this.init();
    if (!this.audioCtx) return false;

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (this.isPlaying) return true;

    // Master gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 2.5);
    this.masterGain.connect(this.audioCtx.destination);

    // 1. Wind ambience (filtered noise)
    const windBufferSize = this.audioCtx.sampleRate * 4;
    const windBuffer = this.audioCtx.createBuffer(1, windBufferSize, this.audioCtx.sampleRate);
    const windData = windBuffer.getChannelData(0);
    for (let i = 0; i < windBufferSize; i++) {
      windData[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const windSource = this.audioCtx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = this.audioCtx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 220;

    const windGain = this.audioCtx.createGain();
    windGain.gain.value = 0.5;

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);
    windSource.start();
    this.activeNodes.push(windSource);

    // 2. Deep warm drone (55Hz A1 root + subtle 110Hz overtone)
    const drone1 = this.audioCtx.createOscillator();
    drone1.type = 'sine';
    drone1.frequency.value = 55;

    const drone1Gain = this.audioCtx.createGain();
    drone1Gain.gain.value = 0.18;

    drone1.connect(drone1Gain);
    drone1Gain.connect(this.masterGain);
    drone1.start();
    this.activeNodes.push(drone1);

    const drone2 = this.audioCtx.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.value = 82.5; // E2 fifth

    const drone2Gain = this.audioCtx.createGain();
    drone2Gain.gain.value = 0.06;

    drone2.connect(drone2Gain);
    drone2Gain.connect(this.masterGain);
    drone2.start();
    this.activeNodes.push(drone2);

    // 3. Ember Crackle (subtle procedural hearth sparks)
    const crackleBufferSize = this.audioCtx.sampleRate * 3;
    const crackleBuffer = this.audioCtx.createBuffer(1, crackleBufferSize, this.audioCtx.sampleRate);
    const crackleData = crackleBuffer.getChannelData(0);
    for (let i = 0; i < crackleBufferSize; i++) {
      crackleData[i] = Math.random() > 0.975 ? (Math.random() * 2 - 1) * 0.7 : 0;
    }

    const crackleSource = this.audioCtx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const crackleFilter = this.audioCtx.createBiquadFilter();
    crackleFilter.type = 'bandpass';
    crackleFilter.frequency.value = 2400;
    crackleFilter.Q.value = 0.8;

    const crackleGain = this.audioCtx.createGain();
    crackleGain.gain.value = 0.28;

    crackleSource.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(this.masterGain);
    crackleSource.start();
    this.activeNodes.push(crackleSource);

    // 4. Distant periodic bell / ethereal chime
    this.scheduleChime();

    this.isPlaying = true;
    return true;
  }

  private scheduleChime() {
    if (!this.isPlaying || !this.audioCtx || !this.masterGain) return;

    const chimeInterval = 9000 + Math.random() * 14000;
    this.chimeTimeout = window.setTimeout(() => {
      this.playSingleChime();
      this.scheduleChime();
    }, chimeInterval);
  }

  public playSingleChime() {
    if (!this.audioCtx || !this.masterGain) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const baseFreq = [440, 523.25, 659.25, 783.99, 880][Math.floor(Math.random() * 5)];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 4.6);
    } catch {
      // Audio node may be stopped
    }
  }

  public playEmberStrike() {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;

      // Resonant warm ember strike / flare tone
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain || this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio catch
    }
  }

  /**
   * Kütüphane / Eski Kağıt & Parşömen Hışırtısı Sesi
   * Sayfalar ve kapılar arası geçişlerde organik, kadife gibi eski el yazması hışırtısı üretir.
   */
  public playParchmentRustle(intensity: number = 1.0) {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const destination = this.masterGain || this.audioCtx.destination;

      // 1. Paper fibrous friction noise buffer (organik lifli doku)
      const duration = 0.42 + Math.random() * 0.12;
      const bufferSize = Math.floor(this.audioCtx.sampleRate * duration);
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      // Velvet-grain noise texture
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown/pink smoothed noise with random micro-fiber clicks
        const microClick = Math.random() > 0.985 ? (Math.random() * 2 - 1) * 0.4 : 0;
        lastOut = (lastOut + 0.06 * white) / 1.06;
        data[i] = (lastOut * 0.75 + microClick * 0.25);
      }

      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = buffer;

      // 2. Resonant bandpass filter (sweeping paper friction frequencies)
      const bandpass = this.audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass';
      const startFreq = 1600 + (Math.random() * 400 - 200);
      const endFreq = 950 + (Math.random() * 200 - 100);
      bandpass.frequency.setValueAtTime(startFreq, now);
      bandpass.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.85);
      bandpass.Q.setValueAtTime(2.2 + Math.random() * 0.8, now);

      // Lowpass to keep it warm, library-like and avoid harsh highs
      const warmLowpass = this.audioCtx.createBiquadFilter();
      warmLowpass.type = 'lowpass';
      warmLowpass.frequency.setValueAtTime(3200, now);

      // 3. Multi-stage organic paper flutter gain envelope
      const noiseGain = this.audioCtx.createGain();
      const peakVol = Math.min(0.12, 0.075 * intensity);
      
      noiseGain.gain.setValueAtTime(0.0001, now);
      // First page touch/brush
      noiseGain.gain.exponentialRampToValueAtTime(peakVol * 0.7, now + 0.035);
      // Flutter dip
      noiseGain.gain.exponentialRampToValueAtTime(peakVol * 0.35, now + 0.09);
      // Main parchment sweep
      noiseGain.gain.exponentialRampToValueAtTime(peakVol, now + 0.17);
      // Soft fading rustle
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noiseSource.connect(bandpass);
      bandpass.connect(warmLowpass);
      warmLowpass.connect(noiseGain);
      noiseGain.connect(destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.05);

      // 4. Subtle air displacement (kütüphane odasındaki hafif hava itimi)
      const airOsc = this.audioCtx.createOscillator();
      const airGain = this.audioCtx.createGain();

      airOsc.type = 'sine';
      airOsc.frequency.setValueAtTime(110, now);
      airOsc.frequency.exponentialRampToValueAtTime(48, now + 0.28);

      const airVol = 0.035 * intensity;
      airGain.gain.setValueAtTime(0.0001, now);
      airGain.gain.exponentialRampToValueAtTime(airVol, now + 0.04);
      airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      airOsc.connect(airGain);
      airGain.connect(destination);

      airOsc.start(now);
      airOsc.stop(now + 0.32);
    } catch {
      // Audio execution guard
    }
  }

  /**
   * Kilit Dönüşü & Mekanizma Tıklaması
   * Kilit değiştiğinde tok mekanik bir tık ve metalik rezonans üretir.
   */
  public playLockSound() {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const destination = this.masterGain || this.audioCtx.destination;

      // Click 1: Key insert / turn
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(420, now);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.16, now + 0.008);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc1.connect(gain1);
      gain1.connect(destination);
      osc1.start(now);
      osc1.stop(now + 0.06);

      // Click 2: Heavy tumbler latch drop (after 70ms)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      const filter2 = this.audioCtx.createBiquadFilter();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(180, now + 0.07);
      osc2.frequency.exponentialRampToValueAtTime(55, now + 0.28);

      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(800, now + 0.07);

      gain2.gain.setValueAtTime(0.0001, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(destination);

      osc2.start(now + 0.07);
      osc2.stop(now + 0.32);
    } catch {
      // Audio catch
    }
  }

  public stop() {
    if (this.chimeTimeout) {
      clearTimeout(this.chimeTimeout);
      this.chimeTimeout = null;
    }

    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      setTimeout(() => {
        this.cleanupNodes();
      }, 900);
    } else {
      this.cleanupNodes();
    }
    this.isPlaying = false;
  }

  private cleanupNodes() {
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch {
        // Node already stopped
      }
    });
    this.activeNodes = [];
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // AudioContext closing
      }
      this.audioCtx = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const soundEngine = new SoundEngine();
