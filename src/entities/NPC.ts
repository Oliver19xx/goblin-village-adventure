import Phaser from 'phaser';
import { GameState } from '../systems/GameState';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  public friendId: 'olli' | 'leander' | 'candy';
  public displayName: string;
  private questIcon?: Phaser.GameObjects.Sprite;
  private nameLabel?: Phaser.GameObjects.Text;
  private danceTimer: number = 0;
  private isDancing: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    friendId: 'olli' | 'leander' | 'candy',
    displayName: string,
    isDancing: boolean = false
  ) {
    super(scene, x, y, `${friendId}_idle`);
    this.friendId = friendId;
    this.displayName = displayName;
    this.isDancing = isDancing;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.setSize(20, 16);
    this.setOffset(6, 16);
    this.setDepth(9);

    // Name label
    this.nameLabel = scene.add.text(x, y - 24, displayName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(15);

    // Quest indicator
    this.questIcon = scene.add.sprite(x, y - 36, 'icon_quest_exclamation')
      .setOrigin(0.5)
      .setDepth(15);

    this.updateQuestIcon();
  }

  public updateQuestIcon(): void {
    if (!this.questIcon) return;

    const state = GameState.getInstance();
    const isRecruited = state.isFriendRecruited(this.friendId);
    const quest = state.quests.get(`quest_${this.friendId}`);

    if (isRecruited) {
      this.questIcon.setVisible(false);
      this.isDancing = true;
    } else if (quest && quest.steps[0].isCompleted && quest.steps[1].isCompleted) {
      this.questIcon.setTexture('icon_quest_complete');
      this.questIcon.setVisible(true);
    } else {
      this.questIcon.setTexture('icon_quest_exclamation');
      this.questIcon.setVisible(true);
    }
  }

  public update(_time: number, delta: number): void {
    if (this.isDancing) {
      this.danceTimer += delta;
      if (this.danceTimer > 250) {
        this.danceTimer = 0;
        const current = this.texture.key;
        this.setTexture(current.endsWith('dance') ? `${this.friendId}_idle` : `${this.friendId}_dance`);
      }
    }

    // Keep name label & quest icon anchored
    if (this.nameLabel) {
      this.nameLabel.setPosition(this.x, this.y - 24);
    }
    if (this.questIcon) {
      this.questIcon.setPosition(this.x, this.y - 36);
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.nameLabel) this.nameLabel.destroy();
    if (this.questIcon) this.questIcon.destroy();
    super.destroy(fromScene);
  }
}
