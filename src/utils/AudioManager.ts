class AudioManagerClass {
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private gainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private backgroundMusic: AudioBufferSourceNode | null = null;
  private backgroundMusicBuffer: AudioBuffer | null = null;

  async init() {
    if (this.audioContext) return;
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = this.masterVolume;

    // Preload all sound effects
    const sounds = [
      { name: 'card-placement', url: '/audio/card-placement.mp3' },
      { name: 'card-flip', url: '/audio/card-flip.mp3' },
      { name: 'dice-roll', url: '/audio/dice-roll.mp3' },
      { name: 'dice-ping', url: '/audio/dice-ping.mp3' },
      { name: 'damage-dealt', url: '/audio/damage-dealt.mp3' },
      { name: 'victory', url: '/audio/victory.mp3' },
      { name: 'defeat', url: '/audio/defeat.mp3' },
    ];

    await Promise.all(
      sounds.map(sound => this.loadSound(sound.name, sound.url))
    );
  }

  async loadSound(name: string, url: string) {
    if (!this.audioContext) await this.init();
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.buffers.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  play(name: string, volume: number = 1.0) {
    if (this.isMuted || !this.audioContext || !this.gainNode) return;
    
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    source.start(0);
  }

  async playBackgroundMusic(audioBuffer?: AudioBuffer) {
    if (!this.audioContext || !this.gainNode) await this.init();
    
    this.stopBackgroundMusic();

    const buffer = audioBuffer || this.backgroundMusicBuffer;
    if (!buffer) return;

    this.backgroundMusicBuffer = buffer;
    this.backgroundMusic = this.audioContext!.createBufferSource();
    this.backgroundMusic.buffer = buffer;
    this.backgroundMusic.loop = true;
    
    const bgGain = this.audioContext!.createGain();
    bgGain.gain.value = 0.3;
    
    this.backgroundMusic.connect(bgGain);
    bgGain.connect(this.gainNode!);
    
    this.backgroundMusic.start(0);
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic.disconnect();
      this.backgroundMusic = null;
    }
  }

  async uploadBackgroundMusic(file: File): Promise<boolean> {
    if (!this.audioContext) await this.init();
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      await this.playBackgroundMusic(audioBuffer);
      return true;
    } catch (error) {
      console.error('Failed to upload background music:', error);
      return false;
    }
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.masterVolume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : this.masterVolume;
    }
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  getVolume() {
    return this.masterVolume;
  }
}

export const AudioManager = new AudioManagerClass();
