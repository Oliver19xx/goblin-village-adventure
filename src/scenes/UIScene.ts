import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import { SoundEngine } from '../systems/SoundEngine';
import { DIALOGUES } from '../systems/DialogueData';
import { WorldScene } from './WorldScene';

export class UIScene extends Phaser.Scene {
  // Top HUD
  private zoneText!: Phaser.GameObjects.Text;
  private progressBarFill!: Phaser.GameObjects.Rectangle;
  private progressLabel!: Phaser.GameObjects.Text;
  private inventoryContainer!: Phaser.GameObjects.Container;
  private soundBtnText!: Phaser.GameObjects.Text;

  // Modals & Panels
  private dialogueBox!: Phaser.GameObjects.Container;
  private dialoguePortrait!: Phaser.GameObjects.Sprite;
  private dialogueName!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private dialogueOptionsContainer!: Phaser.GameObjects.Container;

  private craftingModal!: Phaser.GameObjects.Container;
  private questModal!: Phaser.GameObjects.Container;
  private finaleModal!: Phaser.GameObjects.Container;

  // Toast notifications
  private toastContainer!: Phaser.GameObjects.Container;
  private toastText!: Phaser.GameObjects.Text;
  private toastTimer?: Phaser.Time.TimerEvent;

  // Mobile Virtual Joystick
  private touchKnob?: Phaser.GameObjects.Image;
  private isTouchingStick: boolean = false;
  private touchStartPos: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const state = GameState.getInstance();

    this.setupTopHUD();
    this.setupDialogueBox();
    this.setupCraftingModal();
    this.setupQuestModal();
    this.setupFinaleModal();
    this.setupToast();
    this.setupMobileControls();

    // Listen to GameState events
    state.on('inventory_changed', () => this.updateHUD());
    state.on('upgrade_crafted', () => {
      this.updateHUD();
      this.refreshCraftingList();
    });
    state.on('friend_recruited', (friendId: string) => {
      this.updateHUD();
      this.showToast(`🎉 ${friendId.toUpperCase()} ist jetzt auf deiner Party!`);
    });
    state.on('quest_updated', () => this.updateHUD());
    state.on('birthday_finale', () => this.openFinaleModal());

    // Hotkeys
    this.input.keyboard?.on('keydown-C', () => this.toggleCraftingModal());
    this.input.keyboard?.on('keydown-Q', () => this.toggleQuestModal());
    this.input.keyboard?.on('keydown-M', () => this.toggleSound());

    // Check debug URL params for UI
    const params = new URLSearchParams(window.location.search);
    const modal = params.get('modal');
    const dialogue = params.get('dialogue');
    const demo = params.get('demo');

    if (modal === 'crafting') {
      this.openCraftingMenu();
    } else if (modal === 'quests') {
      this.toggleQuestModal();
    } else if (dialogue) {
      this.openDialogue(dialogue);
    } else if (demo === 'finale') {
      this.openFinaleModal();
    }

    this.updateHUD();
  }

  private setupTopHUD(): void {
    const w = this.cameras.main.width;

    // Header Background
    this.add.rectangle(w / 2, 24, w - 20, 38, 0x0c0814, 0.85)
      .setStrokeStyle(1.5, 0x3d3055)
      .setDepth(100);

    // Zone Badge
    this.zoneText = this.add.text(24, 24, '🧌 BAUWAGENPLATZ', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(101);

    // Party Progress Bar
    const barX = 260;
    const barY = 24;
    const barW = 140;
    const barH = 14;

    this.add.rectangle(barX, barY, barW, barH, 0x1f1b2b)
      .setStrokeStyle(1, 0x5a4878)
      .setDepth(101);

    this.progressBarFill = this.add.rectangle(barX - barW / 2, barY, 0, barH - 2, 0xff007f)
      .setOrigin(0, 0.5)
      .setDepth(102);

    this.progressLabel = this.add.text(barX + barW / 2 + 10, barY, 'Party-Vibe: 0%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ff99dd',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(101);

    // Quick Inventory Slot preview
    this.inventoryContainer = this.add.container(480, 24).setDepth(101);

    // Top action buttons (Quests, Crafting, Sound, Save)
    this.createHeaderButton(w - 230, 24, '📜 Quests (Q)', () => this.toggleQuestModal());
    this.createHeaderButton(w - 140, 24, '🔨 Bauen (C)', () => this.toggleCraftingModal());
    
    this.soundBtnText = this.add.text(w - 45, 24, '🔊', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(102).setInteractive({ useHandCursor: true });

    this.soundBtnText.on('pointerdown', () => this.toggleSound());
  }

  private createHeaderButton(x: number, y: number, text: string, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, 78, 24, 0x221a36)
      .setStrokeStyle(1, 0x8a45d0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(102);

    bg.on('pointerdown', () => {
      SoundEngine.getInstance().playPickup();
      onClick();
    });
    bg.on('pointerover', () => bg.setFillStyle(0x3e2868));
    bg.on('pointerout', () => bg.setFillStyle(0x221a36));
  }

  private updateHUD(): void {
    const state = GameState.getInstance();

    // Update Zone Text
    const zoneNames: { [k: string]: string } = {
      hub: '🧌 Valentins Party-Hub',
      kanal: '🎧 Kanal-Rave (Olli)',
      skatehalle: '🛹 Skatehalle (Leander)',
      autobahn: '🍬 Autobahnbrücke (Candy)'
    };
    this.zoneText.setText(zoneNames[state.currentZone] || 'Unbekannt');

    // Update Progress Bar
    const progress = state.getPartyProgress();
    const barW = 140;
    this.progressBarFill.width = Math.max(2, (barW - 2) * (progress / 100));
    this.progressLabel.setText(`Party: ${progress}%`);

    // Update Quick Inventory Icons
    this.inventoryContainer.removeAll(true);
    const trackedItems = ['wood', 'scrap', 'glowstick'];
    let offsetX = 0;

    trackedItems.forEach(itemId => {
      const item = state.inventory.get(itemId);
      if (item) {
        const icon = this.add.image(offsetX, 0, item.iconTexture).setScale(0.7);
        const countTxt = this.add.text(offsetX + 12, 0, `${item.count}`, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          color: '#ffd700',
          fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.inventoryContainer.add([icon, countTxt]);
        offsetX += 48;
      }
    });
  }

  private toggleSound(): void {
    const isMuted = SoundEngine.getInstance().toggleMute();
    this.soundBtnText.setText(isMuted ? '🔇' : '🔊');
    this.showToast(isMuted ? 'Ton stummgeschaltet' : 'Ton aktiviert');
  }

  // --- DIALOGUE SYSTEM ---
  private setupDialogueBox(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.dialogueBox = this.add.container(w / 2, h - 90).setDepth(200).setVisible(false);

    const bg = this.add.rectangle(0, 0, w - 60, 130, 0x0f0b1a, 0.95)
      .setStrokeStyle(2, 0xff007f);

    this.dialoguePortrait = this.add.sprite(-w / 2 + 75, -5, 'valentin_idle')
      .setScale(2.2);

    this.dialogueName = this.add.text(-w / 2 + 130, -50, 'Speaker Name', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#00ffcc',
      fontStyle: 'bold'
    });

    this.dialogueText = this.add.text(-w / 2 + 130, -25, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      wordWrap: { width: w - 210 },
      lineSpacing: 4
    });

    this.dialogueOptionsContainer = this.add.container(0, 28);

    this.dialogueBox.add([bg, this.dialoguePortrait, this.dialogueName, this.dialogueText, this.dialogueOptionsContainer]);
  }

  public openDialogue(nodeId: string): void {
    const node = DIALOGUES[nodeId];
    if (!node) return;

    this.dialogueBox.setVisible(true);
    this.dialoguePortrait.setTexture(`${node.speaker}_idle`);
    this.dialogueName.setText(node.speakerName);
    this.dialogueText.setText(node.text);

    // Setup Option buttons
    this.dialogueOptionsContainer.removeAll(true);

    if (node.options && node.options.length > 0) {
      let optX = -this.cameras.main.width / 2 + 130;
      node.options.forEach(opt => {
        const btnBg = this.add.rectangle(optX + 90, 0, 170, 24, 0x291a45)
          .setStrokeStyle(1.5, 0x00ffcc)
          .setInteractive({ useHandCursor: true });

        const btnText = this.add.text(optX + 90, 0, opt.label, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '11px',
          color: '#ffffff',
          wordWrap: { width: 160 }
        }).setOrigin(0.5);

        btnBg.on('pointerdown', () => {
          SoundEngine.getInstance().playPickup();
          if (opt.action) {
            this.handleDialogueAction(opt.action);
          }
          if (opt.nextNodeId) {
            this.openDialogue(opt.nextNodeId);
          } else {
            this.closeDialogue();
          }
        });

        this.dialogueOptionsContainer.add([btnBg, btnText]);
        optX += 185;
      });
    } else {
      // Default close on tap
      this.dialogueBox.setInteractive(new Phaser.Geom.Rectangle(-450, -65, 900, 130), Phaser.Geom.Rectangle.Contains);
      this.dialogueBox.once('pointerdown', () => this.closeDialogue());
    }
  }

  private handleDialogueAction(action: string): void {
    const state = GameState.getInstance();
    if (action === 'recruit_olli') {
      state.recruitFriend('olli');
      state.quests.get('quest_olli')!.isCompleted = true;
      SoundEngine.getInstance().playQuestComplete();
    } else if (action === 'recruit_leander') {
      state.recruitFriend('leander');
      state.quests.get('quest_leander')!.isCompleted = true;
      SoundEngine.getInstance().playQuestComplete();
    } else if (action === 'recruit_candy') {
      state.recruitFriend('candy');
      state.quests.get('quest_candy')!.isCompleted = true;
      SoundEngine.getInstance().playQuestComplete();
    }
  }

  private closeDialogue(): void {
    this.dialogueBox.setVisible(false);
  }

  // --- CRAFTING MODAL ---
  private setupCraftingModal(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.craftingModal = this.add.container(w / 2, h / 2).setDepth(210).setVisible(false);

    const bg = this.add.rectangle(0, 0, 700, 480, 0x110c22, 0.96)
      .setStrokeStyle(2, 0xffd700);

    const title = this.add.text(0, -210, '🔨 WERKBANK: PARTY-AUSBAU', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(320, -210, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ff4da6'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.toggleCraftingModal());

    this.craftingModal.add([bg, title, closeBtn]);
  }

  public openCraftingMenu(): void {
    this.refreshCraftingList();
    this.craftingModal.setVisible(true);
    SoundEngine.getInstance().playPickup();
  }

  private toggleCraftingModal(): void {
    if (this.craftingModal.visible) {
      this.craftingModal.setVisible(false);
    } else {
      this.openCraftingMenu();
    }
  }

  private refreshCraftingList(): void {
    const state = GameState.getInstance();
    
    // Clear old items inside modal (keep background, title, close button)
    while (this.craftingModal.length > 3) {
      this.craftingModal.removeAt(3, true);
    }

    let yOffset = -150;
    state.craftingRecipes.forEach(recipe => {
      const cardBg = this.add.rectangle(0, yOffset + 24, 640, 56, 0x1b1433)
        .setStrokeStyle(1, recipe.built ? 0x00ff88 : 0x5a4878);

      const icon = this.add.image(-285, yOffset + 24, recipe.icon).setScale(0.9);

      const nameTxt = this.add.text(-250, yOffset + 12, recipe.name, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: recipe.built ? '#00ff88' : '#ffffff',
        fontStyle: 'bold'
      });

      const descTxt = this.add.text(-250, yOffset + 28, recipe.description, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#aaaaaa'
      });

      // Cost summary
      let costStr = recipe.costs.map(c => {
        const cur = state.getItemCount(c.itemId);
        const name = state.inventory.get(c.itemId)?.name || c.itemId;
        return `${name}: ${cur}/${c.amount}`;
      }).join('  |  ');

      if (recipe.requiredFriendId && !state.isFriendRecruited(recipe.requiredFriendId)) {
        costStr = `🔒 Benötigt Freund: ${recipe.requiredFriendId.toUpperCase()}`;
      }

      const costTxt = this.add.text(120, yOffset + 24, costStr, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#ffbb44'
      }).setOrigin(0.5);

      // Build Action Button or Built Checkmark
      if (recipe.built) {
        const builtBadge = this.add.text(260, yOffset + 24, '✓ GEBAUT', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          color: '#00ff88',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        this.craftingModal.add([cardBg, icon, nameTxt, descTxt, costTxt, builtBadge]);
      } else {
        const canBuild = (!recipe.requiredFriendId || state.isFriendRecruited(recipe.requiredFriendId)) &&
          recipe.costs.every(c => state.getItemCount(c.itemId) >= c.amount);

        const btnBg = this.add.rectangle(260, yOffset + 24, 80, 28, canBuild ? 0xff007f : 0x332847)
          .setStrokeStyle(1, canBuild ? 0xff66cc : 0x555555)
          .setInteractive({ useHandCursor: canBuild });

        const btnTxt = this.add.text(260, yOffset + 24, 'BAUEN', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '11px',
          color: canBuild ? '#ffffff' : '#777777',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        if (canBuild) {
          btnBg.on('pointerdown', () => {
            if (state.craftUpgrade(recipe.id)) {
              this.showToast(`✨ ${recipe.name} erfolgreich gebaut!`);
            }
          });
        }

        this.craftingModal.add([cardBg, icon, nameTxt, descTxt, costTxt, btnBg, btnTxt]);
      }

      yOffset += 64;
    });
  }

  // --- QUEST LOG MODAL ---
  private setupQuestModal(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.questModal = this.add.container(w / 2, h / 2).setDepth(210).setVisible(false);

    const bg = this.add.rectangle(0, 0, 680, 440, 0x120d24, 0.96)
      .setStrokeStyle(2, 0x00ffcc);

    const title = this.add.text(0, -190, '📜 GEBURTSTAGS-TAGEBUCH & QUESTS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '17px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(310, -190, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ff4da6'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.toggleQuestModal());

    this.questModal.add([bg, title, closeBtn]);
  }

  private toggleQuestModal(): void {
    if (this.questModal.visible) {
      this.questModal.setVisible(false);
    } else {
      this.refreshQuestList();
      this.questModal.setVisible(true);
      SoundEngine.getInstance().playPickup();
    }
  }

  private refreshQuestList(): void {
    const state = GameState.getInstance();

    while (this.questModal.length > 3) {
      this.questModal.removeAt(3, true);
    }

    let yOffset = -135;
    state.quests.forEach(quest => {
      const isRecruited = state.isFriendRecruited(quest.friendId);
      const cardBg = this.add.rectangle(0, yOffset + 34, 620, 78, 0x1c1538)
        .setStrokeStyle(1, isRecruited ? 0x00ff88 : 0x00e5ff);

      const titleTxt = this.add.text(-290, yOffset + 8, quest.title, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: isRecruited ? '#00ff88' : '#ffd700',
        fontStyle: 'bold'
      });

      const stepsStr = quest.steps.map(s => `${s.isCompleted ? '☑' : '☐'} ${s.text}`).join('\n');
      const stepsTxt = this.add.text(-290, yOffset + 26, stepsStr, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#dddddd',
        lineSpacing: 3
      });

      const statusBadge = this.add.text(260, yOffset + 34, isRecruited ? '🎉 DABEI!' : '⏳ OFFEN', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: isRecruited ? '#00ff88' : '#ff9900',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.questModal.add([cardBg, titleTxt, stepsTxt, statusBadge]);
      yOffset += 90;
    });
  }

  // --- FINALE MODAL ---
  private setupFinaleModal(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.finaleModal = this.add.container(w / 2, h / 2).setDepth(300).setVisible(false);

    const bg = this.add.rectangle(0, 0, 720, 480, 0x160824, 0.98)
      .setStrokeStyle(3, 0xff00ea);

    const title = this.add.text(0, -180, '🎂 HAPPY BIRTHDAY, VALENTIN! 🎂', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Avatars of Valentin, Olli, Leander, Candy dancing
    const vSprite = this.add.sprite(-150, -60, 'valentin_dance').setScale(2.5);
    const oSprite = this.add.sprite(-50, -60, 'olli_dance').setScale(2.5);
    const lSprite = this.add.sprite(50, -60, 'leander_dance').setScale(2.5);
    const cSprite = this.add.sprite(150, -60, 'candy_dance').setScale(2.5);

    const cakeImg = this.add.image(0, 40, 'prop_birthday_cake').setScale(2);

    const msg = this.add.text(0, 110, 'Du hast alle deine Freunde gefunden, den Bauwagenplatz ausgebaut\nund die legendärste Goblin-Rave-Party aller Zeiten gestartet!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    const continueBtnBg = this.add.rectangle(0, 180, 220, 38, 0xff007f)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const continueBtnTxt = this.add.text(0, 180, 'WEITER FEIERN! 🪩', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    continueBtnBg.on('pointerdown', () => {
      this.finaleModal.setVisible(false);
      const worldScene = this.scene.get('WorldScene') as WorldScene;
      worldScene.triggerFinaleCelebration();
    });

    this.finaleModal.add([bg, title, vSprite, oSprite, lSprite, cSprite, cakeImg, msg, continueBtnBg, continueBtnTxt]);
  }

  public openFinaleModal(): void {
    this.finaleModal.setVisible(true);
  }

  // --- TOAST NOTIFICATIONS ---
  private setupToast(): void {
    const w = this.cameras.main.width;
    this.toastContainer = this.add.container(w / 2, 70).setDepth(250).setVisible(false);

    const bg = this.add.rectangle(0, 0, 360, 32, 0x1f1438, 0.9)
      .setStrokeStyle(1.5, 0x00ffcc);

    this.toastText = this.add.text(0, 0, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.toastContainer.add([bg, this.toastText]);
  }

  public showToast(msg: string): void {
    this.toastText.setText(msg);
    this.toastContainer.setVisible(true);

    if (this.toastTimer) this.toastTimer.remove();
    this.toastTimer = this.time.delayedCall(2500, () => {
      this.toastContainer.setVisible(false);
    });
  }

  // --- MOBILE VIRTUAL JOYSTICK & TOUCH ACTION BUTTONS ---
  private setupMobileControls(): void {
    const h = this.cameras.main.height;
    const w = this.cameras.main.width;

    // Virtual Joystick on bottom-left
    const stickX = 90;
    const stickY = h - 90;

    this.add.image(stickX, stickY, 'ui_stick_base')
      .setDepth(150)
      .setAlpha(0.6)
      .setInteractive();

    this.touchKnob = this.add.image(stickX, stickY, 'ui_stick_knob')
      .setDepth(151)
      .setAlpha(0.85);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < 240 && pointer.y > h - 220) {
        this.isTouchingStick = true;
        this.touchStartPos = { x: stickX, y: stickY };
        this.updateJoystick(pointer);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isTouchingStick) {
        this.updateJoystick(pointer);
      }
    });

    this.input.on('pointerup', () => {
      this.isTouchingStick = false;
      if (this.touchKnob) {
        this.touchKnob.setPosition(stickX, stickY);
      }
      const worldScene = this.scene.get('WorldScene') as WorldScene;
      if (worldScene && worldScene.player) {
        worldScene.player.joystickVector = { x: 0, y: 0 };
      }
    });

    // Mobile Action Buttons on bottom-right
    this.createMobileActionBtn(w - 75, h - 80, 'E', 'Interagieren', 0xff007f, () => {
      const worldScene = this.scene.get('WorldScene') as WorldScene;
      if (worldScene) worldScene.handleInteraction();
    });

    this.createMobileActionBtn(w - 155, h - 60, 'C', 'Bauen', 0x9900ff, () => {
      this.toggleCraftingModal();
    });

    this.createMobileActionBtn(w - 155, h - 130, 'Q', 'Quests', 0x00b4d8, () => {
      this.toggleQuestModal();
    });
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const maxDist = 40;
    const dx = pointer.x - this.touchStartPos.x;
    const dy = pointer.y - this.touchStartPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);

    const knobX = this.touchStartPos.x + Math.cos(angle) * clampedDist;
    const knobY = this.touchStartPos.y + Math.sin(angle) * clampedDist;

    if (this.touchKnob) {
      this.touchKnob.setPosition(knobX, knobY);
    }

    const worldScene = this.scene.get('WorldScene') as WorldScene;
    if (worldScene && worldScene.player) {
      worldScene.player.joystickVector = {
        x: (Math.cos(angle) * clampedDist) / maxDist,
        y: (Math.sin(angle) * clampedDist) / maxDist
      };
    }
  }

  private createMobileActionBtn(x: number, y: number, key: string, _label: string, color: number, action: () => void): void {
    const bg = this.add.circle(x, y, 28, color, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setDepth(150)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, key, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(151);

    bg.on('pointerdown', () => {
      bg.setScale(0.9);
      action();
    });
    bg.on('pointerup', () => bg.setScale(1));
    bg.on('pointerout', () => bg.setScale(1));
  }
}
