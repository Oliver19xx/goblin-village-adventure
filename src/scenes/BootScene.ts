import Phaser from 'phaser';
import { TextureGenerator } from '../assets/textureGenerator';
import { SoundEngine } from '../systems/SoundEngine';
import { SaveSystem } from '../systems/SaveSystem';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Generate all procedural textures
    TextureGenerator.generateAll(this);

    // Try loading existing savegame
    SaveSystem.loadGame();

    // Start background music on first user interaction
    const startAudio = () => {
      SoundEngine.getInstance().startMusic();
      window.removeEventListener('pointerdown', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
    window.addEventListener('pointerdown', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });

    // Launch Game Scenes
    this.scene.start('WorldScene');
    this.scene.launch('UIScene');
  }
}
