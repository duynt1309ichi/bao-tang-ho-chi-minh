// Âm thanh (SRS FR-24) tổng hợp bằng Web Audio — không có file âm thanh nên không tốn tải, không cần ghi credits.
// Chỉ tạo AudioContext sau thao tác đầu tiên của người dùng (chính sách autoplay); tạm dừng khi tab ẩn.

export type Sfx = 'click' | 'chime' | 'domino' | 'dice' | 'jam' | 'firework' | 'pop';
export type LoopName = 'boil' | 'gear';

/** Âm lượng 0–100 → hệ số gain (cong bình phương cho cảm giác đều tai). Hàm thuần. */
export const volumeGain = (v: number) => (Math.max(0, Math.min(100, v)) / 100) ** 2;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private sfx!: GainNode;
  private reverb!: ConvolverNode;
  private noise!: AudioBuffer;
  private muted = false;
  private vol = { music: 60, sfx: 80 };

  /** Gọi ở thao tác đầu tiên (click/phím). Gọi lặp vô hại. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume();
      return;
    }
    const ctx = (this.ctx = new AudioContext());
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.music = ctx.createGain();
    this.sfx = ctx.createGain();
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(2.8);
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    this.reverb.connect(wet).connect(this.master);
    this.music.connect(this.master);
    this.music.connect(this.reverb);
    this.sfx.connect(this.master);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.apply();
    this.startMusic();
    document.addEventListener('visibilitychange', () => (document.hidden ? ctx.suspend() : ctx.resume()));
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.apply();
  }

  setVolumes(music: number, sfx: number) {
    this.vol = { music, sfx };
    this.apply();
  }

  private apply() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, t, 0.02);
    this.music.gain.setTargetAtTime(volumeGain(this.vol.music) * 0.5, t, 0.05);
    this.sfx.gain.setTargetAtTime(volumeGain(this.vol.sfx), t, 0.02);
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    }
    return buf;
  }

  /** Một nốt có đường bao attack/decay. */
  private tone(freq: number, at: number, dur: number, opts: { type?: OscillatorType; gain?: number; attack?: number; out?: AudioNode; glide?: number } = {}) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = opts.type ?? 'sine';
    o.frequency.setValueAtTime(freq, at);
    if (opts.glide) o.frequency.exponentialRampToValueAtTime(opts.glide, at + dur);
    const a = opts.attack ?? 0.005;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(opts.gain ?? 0.2, at + a);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(opts.out ?? this.sfx);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  /** Tiếng ồn lọc dải: gõ, bước chân, nổ. */
  private burst(at: number, dur: number, opts: { freq: number; q?: number; gain?: number; type?: BiquadFilterType; out?: AudioNode }) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = opts.type ?? 'bandpass';
    f.frequency.value = opts.freq;
    f.Q.value = opts.q ?? 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.gain ?? 0.3, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(f).connect(g).connect(opts.out ?? this.sfx);
    src.start(at, Math.random() * 0.5);
    src.stop(at + dur + 0.05);
  }

  play(name: Sfx, volume = 1) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const v = volume;
    switch (name) {
      case 'click':
        this.tone(880, t, 0.06, { gain: 0.12 * v });
        break;
      case 'pop':
        this.tone(520 + Math.random() * 200, t, 0.12, { gain: 0.15 * v, glide: 900 });
        break;
      case 'chime': // hoàn thành hiện vật 🎛
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, t + i * 0.09, 0.9, { gain: 0.12 * v, out: this.sfx }));
        break;
      case 'domino':
        this.burst(t, 0.05, { freq: 2200, q: 3, gain: 0.35 * v });
        this.tone(320, t, 0.05, { gain: 0.08 * v, type: 'triangle' });
        break;
      case 'dice':
        for (let i = 0; i < 4; i++) this.burst(t + i * 0.07 + Math.random() * 0.03, 0.04, { freq: 1800 + Math.random() * 1500, q: 4, gain: 0.25 * v });
        break;
      case 'jam':
        this.burst(t, 0.35, { freq: 260, q: 6, gain: 0.35 * v });
        this.tone(70, t, 0.35, { type: 'sawtooth', gain: 0.08 * v });
        break;
      case 'firework':
        this.tone(500, t, 0.7, { gain: 0.03 * v, glide: 1400, attack: 0.2 });
        this.burst(t + 0.7, 1.4, { freq: 180, type: 'lowpass', gain: 0.6 * v });
        for (let i = 0; i < 10; i++) this.burst(t + 0.9 + Math.random() * 0.8, 0.03, { freq: 3000 + Math.random() * 3000, q: 2, gain: 0.08 * v });
        break;
    }
  }

  /** Bước chân: mặt sàn đổi âm sắc (đá trong hơn, thảm/cỏ trầm và nhỏ). */
  footstep(surface: 'stone' | 'wood' | 'soft') {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const freq = { stone: 1400, wood: 700, soft: 350 }[surface] * (0.85 + Math.random() * 0.3);
    this.burst(t, surface === 'soft' ? 0.09 : 0.06, { freq, q: 1.5, gain: surface === 'soft' ? 0.08 : 0.16 });
  }

  /** Âm lặp của hiện vật (ấm sôi, bánh răng). Trả về hàm dừng. */
  loop(name: LoopName): () => void {
    if (!this.ctx) return () => {};
    let stop = false;
    const tick = () => {
      if (stop || !this.ctx) return;
      if (this.ctx.state === 'running') {
        const t = this.ctx.currentTime;
        if (name === 'boil') {
          this.burst(t, 0.25, { freq: 500, type: 'lowpass', gain: 0.12 });
          for (let i = 0; i < 3; i++) this.tone(250 + Math.random() * 500, t + Math.random() * 0.2, 0.06, { gain: 0.05, glide: 900 });
        } else {
          this.burst(t, 0.03, { freq: 3200, q: 5, gain: 0.12 });
          this.tone(90, t, 0.12, { type: 'square', gain: 0.015 });
        }
      }
      setTimeout(tick, name === 'boil' ? 200 : 140);
    };
    tick();
    return () => (stop = true);
  }

  /** Nhạc nền không lời: pad hợp âm Am – F – C – G (8 s mỗi hợp âm) + nốt ngũ cung rải thưa, lặp mãi. */
  private startMusic() {
    const chords = [
      [220, 261.63, 329.63],
      [174.61, 220, 261.63],
      [130.81, 196, 261.63],
      [196, 246.94, 293.66],
    ];
    const penta = [440, 523.25, 587.33, 659.25, 783.99, 880];
    let next = this.ctx!.currentTime + 0.5;
    let i = 0;
    const schedule = () => {
      const ctx = this.ctx!;
      while (next < ctx.currentTime + 2) {
        for (const f of chords[i % chords.length]) {
          this.tone(f, next, 9, { type: 'triangle', gain: 0.05, attack: 2.5, out: this.music });
          this.tone(f * 1.003, next, 9, { type: 'sine', gain: 0.04, attack: 2.5, out: this.music });
        }
        for (let k = 0; k < 3; k++) {
          if (Math.random() < 0.6) this.tone(penta[Math.floor(Math.random() * penta.length)], next + 1 + k * 2.3 + Math.random(), 2.2, { gain: 0.035, out: this.music });
        }
        next += 8;
        i++;
      }
    };
    schedule();
    setInterval(schedule, 1000);
  }

  get unlocked() {
    return this.ctx !== null;
  }
}

export const audio = new AudioEngine();
