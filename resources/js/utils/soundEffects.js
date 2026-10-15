// Web Audio API Synthesizer for romantic sound effects (No external audio files needed!)
class SoundEffects {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playPop() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playDing() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [587.33, 880]; // D5, A5
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.06);

            gain.gain.setValueAtTime(0.2, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.35);
        });
    }

    playYay() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Joyful chord fanfare: C5, E5, G5, C6
        const chord = [523.25, 659.25, 783.99, 1046.50];
        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const startTime = now + idx * 0.09;
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.35, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.65);
        });
    }
}

export const sounds = new SoundEffects();
