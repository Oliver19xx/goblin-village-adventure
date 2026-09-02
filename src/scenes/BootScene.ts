import Phaser from 'phaser';
import { TextureGenerator } from '../assets/textureGenerator';
import { SoundEngine } from '../systems/SoundEngine';
import { SaveSystem } from '../systems/SaveSystem';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Ensure initial scale matches window viewport
    this.scale.resize(window.innerWidth, window.innerHeight);

    // Generate all procedural textures
    TextureGenerator.generateAll(this);

    // Try loading existing savegame
    SaveSystem.loadGame();

    // Start background music and unlock AudioContext on first user touch/interaction
    const startAudio = () => {
      SoundEngine.getInstance().unlockAudio();
    };
    window.addEventListener('touchstart', startAudio, { passive: true });
    window.addEventListener('touchend', startAudio, { passive: true });
    window.addEventListener('pointerdown', startAudio);
    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);

    // Launch Game Scenes
    this.scene.start('WorldScene');
    this.scene.launch('UIScene');
  }
}
