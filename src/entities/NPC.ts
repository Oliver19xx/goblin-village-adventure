import Phaser from 'phaser';
import { GameState } from '../systems/GameState';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  public friendId: 'olli' | 'leander' | 'candy';
  public displayName: string;
  private questIcon?: Phaser.GameObjects.Sprite;
  private nameLabelContainer?: Phaser.GameObjects.Container;
  private danceTimer: number = 0;
  public isDancing: boolean = false;

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

    // Clean framed Name label
    this.nameLabelContainer = scene.add.container(x, y - 24).setDepth(15);
    const nameTxt = scene.add.text(0, 0, displayName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10.5px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    const nameBg = scene.add.rectangle(0, 0, nameTxt.width + 12, nameTxt.height + 6, 0x0a0614, 0.88)
      .setStrokeStyle(1, 0x8a45d0, 0.6);
    this.nameLabelContainer.add([nameBg, nameTxt]);

    // Quest indicator (Placed above nametag)
    this.questIcon = scene.add.sprite(x, y - 38, 'icon_quest_exclamation')
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
    if (this.nameLabelContainer) {
      this.nameLabelContainer.setPosition(this.x, this.y - 24);
    }
    if (this.questIcon) {
      this.questIcon.setPosition(this.x, this.y - 38);
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.nameLabelContainer) this.nameLabelContainer.destroy();
    if (this.questIcon) this.questIcon.destroy();
    super.destroy(fromScene);
  }
}
