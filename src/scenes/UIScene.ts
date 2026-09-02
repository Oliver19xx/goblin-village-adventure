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

  // --- 1. ACCESSIBLE TOP BAR HUD ---
  private setupTopHUD(): void {
    const w = this.cameras.main.width;

    // Header Background Pill with gradient-like styling & strong contrast
    this.add.rectangle(w / 2, 26, w - 16, 44, 0x0a0614, 0.92)
      .setStrokeStyle(2, 0x4d396d)
      .setDepth(100);

    // Zone Badge (Large & readable)
    this.zoneText = this.add.text(24, 26, '🧌 BAUWAGENPLATZ', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(101);

    // Party Progress Bar
    const barX = 280;
    const barY = 26;
    const barW = 150;
    const barH = 18;

    this.add.rectangle(barX, barY, barW, barH, 0x1f1730)
      .setStrokeStyle(1.5, 0x7a5a9e)
      .setDepth(101);

    this.progressBarFill = this.add.rectangle(barX - barW / 2, barY, 0, barH - 2, 0xff007f)
      .setOrigin(0, 0.5)
      .setDepth(102);

    this.progressLabel = this.add.text(barX + barW / 2 + 10, barY, 'Party: 0%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ff99dd',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(101);

    // Quick Inventory Slot preview
    this.inventoryContainer = this.add.container(515, 26).setDepth(101);

    // Top action buttons (Quests, Crafting, Sound) with comfortable touch targets (40px high)
    this.createHeaderButton(w - 245, 26, '📜 Quests (Q)', 105, () => this.toggleQuestModal());
    this.createHeaderButton(w - 130, 26, '🔨 Bauen (C)', 105, () => this.toggleCraftingModal());
    
    // Sound Button
    const sndBg = this.add.circle(w - 40, 26, 18, 0x221a36, 0.9)
      .setStrokeStyle(1.5, 0x00ffcc)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.soundBtnText = this.add.text(w - 40, 26, '🔊', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(102);

    sndBg.on('pointerdown', () => this.toggleSound());
  }

  private createHeaderButton(x: number, y: number, text: string, width: number, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, width, 32, 0x261a40)
      .setStrokeStyle(1.5, 0x8a45d0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(102);

    bg.on('pointerdown', () => {
      SoundEngine.getInstance().playPickup();
      onClick();
    });
    bg.on('pointerover', () => bg.setFillStyle(0x3e2868));
    bg.on('pointerout', () => bg.setFillStyle(0x261a40));
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
    const barW = 150;
    this.progressBarFill.width = Math.max(2, (barW - 2) * (progress / 100));
    this.progressLabel.setText(`Party: ${progress}%`);

    // Update Quick Inventory Icons
    this.inventoryContainer.removeAll(true);
    const trackedItems = ['wood', 'scrap', 'glowstick'];
    let offsetX = 0;

    trackedItems.forEach(itemId => {
      const item = state.inventory.get(itemId);
      if (item) {
        // Pill background
        const pill = this.add.rectangle(offsetX + 18, 0, 52, 24, 0x18112b, 0.8)
          .setStrokeStyle(1, 0x5a4878);

        const icon = this.add.image(offsetX + 2, 0, item.iconTexture).setScale(0.85);
        const countTxt = this.add.text(offsetX + 22, 0, `${item.count}`, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '14px',
          color: '#ffd700',
          fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.inventoryContainer.add([pill, icon, countTxt]);
        offsetX += 62;
      }
    });
  }

  private toggleSound(): void {
    const isMuted = SoundEngine.getInstance().toggleMute();
    this.soundBtnText.setText(isMuted ? '🔇' : '🔊');
    this.showToast(isMuted ? 'Ton stummgeschaltet' : 'Ton aktiviert');
  }

  // --- 2. ACCESSIBLE DIALOGUE SYSTEM (Large Fonts & Buttons) ---
  private setupDialogueBox(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.dialogueBox = this.add.container(w / 2, h - 105).setDepth(200).setVisible(false);

    // Large high-contrast dialogue box
    const bg = this.add.rectangle(0, 0, w - 40, 165, 0x0c0818, 0.98)
      .setStrokeStyle(2.5, 0xff007f);

    this.dialoguePortrait = this.add.sprite(-w / 2 + 80, -10, 'valentin_idle')
      .setScale(2.6);

    this.dialogueName = this.add.text(-w / 2 + 150, -62, 'Speaker Name', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#00ffcc',
      fontStyle: 'bold'
    });

    this.dialogueText = this.add.text(-w / 2 + 150, -36, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      wordWrap: { width: w - 240 },
      lineSpacing: 5
    });

    this.dialogueOptionsContainer = this.add.container(0, 42);

    this.dialogueBox.add([bg, this.dialoguePortrait, this.dialogueName, this.dialogueText, this.dialogueOptionsContainer]);
  }

  public openDialogue(nodeId: string): void {
    const node = DIALOGUES[nodeId];
    if (!node) return;

    this.dialogueBox.setVisible(true);
    this.dialoguePortrait.setTexture(`${node.speaker}_idle`);
    this.dialogueName.setText(node.speakerName);
    this.dialogueText.setText(node.text);

    // Setup Option buttons (Large touch targets: minimum 36px height)
    this.dialogueOptionsContainer.removeAll(true);

    if (node.options && node.options.length > 0) {
      let optX = -this.cameras.main.width / 2 + 150;
      node.options.forEach(opt => {
        const btnWidth = Math.min(260, Math.max(180, opt.label.length * 8 + 30));
        const btnBg = this.add.rectangle(optX + btnWidth / 2, 0, btnWidth, 36, 0x251442)
          .setStrokeStyle(2, 0x00ffcc)
          .setInteractive({ useHandCursor: true });

        const btnText = this.add.text(optX + btnWidth / 2, 0, opt.label, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '13px',
          color: '#ffffff',
          fontStyle: 'bold',
          wordWrap: { width: btnWidth - 16 },
          align: 'center'
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
        optX += btnWidth + 16;
      });
    } else {
      this.dialogueBox.setInteractive(new Phaser.Geom.Rectangle(-450, -80, 900, 160), Phaser.Geom.Rectangle.Contains);
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

  // --- 3. ACCESSIBLE CRAFTING MODAL ---
  private setupCraftingModal(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.craftingModal = this.add.container(w / 2, h / 2).setDepth(210).setVisible(false);

    const bg = this.add.rectangle(0, 0, 740, 500, 0x0f0b1e, 0.98)
      .setStrokeStyle(2.5, 0xffd700);

    const title = this.add.text(0, -220, '🔨 WERKBANK: PARTY-AUSBAU', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtnBg = this.add.circle(340, -220, 18, 0x2b153b, 0.9)
      .setStrokeStyle(1.5, 0xff007f)
      .setInteractive({ useHandCursor: true });

    const closeBtn = this.add.text(340, -220, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#ff4da6'
    }).setOrigin(0.5);

    closeBtnBg.on('pointerdown', () => this.toggleCraftingModal());

    this.craftingModal.add([bg, title, closeBtnBg, closeBtn]);
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
    
    while (this.craftingModal.length > 4) {
      this.craftingModal.removeAt(4, true);
    }

    let yOffset = -155;
    state.craftingRecipes.forEach(recipe => {
      const cardBg = this.add.rectangle(0, yOffset + 28, 680, 62, 0x1a1236)
        .setStrokeStyle(1.5, recipe.built ? 0x00ff88 : 0x5a4878);

      const icon = this.add.image(-305, yOffset + 28, recipe.icon).setScale(1.0);

      const nameTxt = this.add.text(-265, yOffset + 12, recipe.name, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: recipe.built ? '#00ff88' : '#ffffff',
        fontStyle: 'bold'
      });

      const descTxt = this.add.text(-265, yOffset + 32, recipe.description, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#bbbbbb'
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

      const costTxt = this.add.text(140, yOffset + 28, costStr, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#ffbb44',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Build Action Button or Built Checkmark
      if (recipe.built) {
        const builtBadge = this.add.text(285, yOffset + 28, '✓ GEBAUT', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '14px',
          color: '#00ff88',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        this.craftingModal.add([cardBg, icon, nameTxt, descTxt, costTxt, builtBadge]);
      } else {
        const canBuild = (!recipe.requiredFriendId || state.isFriendRecruited(recipe.requiredFriendId)) &&
          recipe.costs.every(c => state.getItemCount(c.itemId) >= c.amount);

        const btnBg = this.add.rectangle(285, yOffset + 28, 95, 36, canBuild ? 0xff007f : 0x2d2242)
          .setStrokeStyle(1.5, canBuild ? 0xff66cc : 0x555555)
          .setInteractive({ useHandCursor: canBuild });

        const btnTxt = this.add.text(285, yOffset + 28, 'BAUEN', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '14px',
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

      yOffset += 72;
    });
  }

  // --- 4. ACCESSIBLE QUEST LOG MODAL ---
  private setupQuestModal(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.questModal = this.add.container(w / 2, h / 2).setDepth(210).setVisible(false);

    const bg = this.add.rectangle(0, 0, 720, 460, 0x100a26, 0.98)
      .setStrokeStyle(2.5, 0x00ffcc);

    const title = this.add.text(0, -200, '📜 GEBURTSTAGS-TAGEBUCH & QUESTS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '19px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtnBg = this.add.circle(330, -200, 18, 0x23143d, 0.9)
      .setStrokeStyle(1.5, 0xff007f)
      .setInteractive({ useHandCursor: true });

    const closeBtn = this.add.text(330, -200, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#ff4da6'
    }).setOrigin(0.5);

    closeBtnBg.on('pointerdown', () => this.toggleQuestModal());

    this.questModal.add([bg, title, closeBtnBg, closeBtn]);
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

    while (this.questModal.length > 4) {
      this.questModal.removeAt(4, true);
    }

    let yOffset = -140;
    state.quests.forEach(quest => {
      const isRecruited = state.isFriendRecruited(quest.friendId);
      const cardBg = this.add.rectangle(0, yOffset + 38, 660, 84, 0x1b1338)
        .setStrokeStyle(1.5, isRecruited ? 0x00ff88 : 0x00e5ff);

      const titleTxt = this.add.text(-310, yOffset + 10, quest.title, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: isRecruited ? '#00ff88' : '#ffd700',
        fontStyle: 'bold'
      });

      const stepsStr = quest.steps.map(s => `${s.isCompleted ? '☑' : '☐'} ${s.text}`).join('\n');
      const stepsTxt = this.add.text(-310, yOffset + 30, stepsStr, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#ffffff',
        lineSpacing: 4
      });

      const statusBadge = this.add.text(280, yOffset + 38, isRecruited ? '🎉 DABEI!' : '⏳ OFFEN', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14px',
        color: isRecruited ? '#00ff88' : '#ff9900',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.questModal.add([cardBg, titleTxt, stepsTxt, statusBadge]);
      yOffset += 96;
    });
  }

  // --- 5. FINALE MODAL ---
  private setupFinaleModal(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.finaleModal = this.add.container(w / 2, h / 2).setDepth(300).setVisible(false);

    const bg = this.add.rectangle(0, 0, 740, 500, 0x140624, 0.98)
      .setStrokeStyle(3.5, 0xff00ea);

    const title = this.add.text(0, -190, '🎂 HAPPY BIRTHDAY, VALENTIN! 🎂', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Avatars of Valentin, Olli, Leander, Candy dancing
    const vSprite = this.add.sprite(-160, -70, 'valentin_dance').setScale(2.8);
    const oSprite = this.add.sprite(-50, -70, 'olli_dance').setScale(2.8);
    const lSprite = this.add.sprite(50, -70, 'leander_dance').setScale(2.8);
    const cSprite = this.add.sprite(160, -70, 'candy_dance').setScale(2.8);

    const cakeImg = this.add.image(0, 35, 'prop_birthday_cake').setScale(2.2);

    const msg = this.add.text(0, 115, 'Du hast alle deine Freunde gefunden, den Bauwagenplatz ausgebaut\nund die legendärste Goblin-Rave-Party aller Zeiten gestartet!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 5
    }).setOrigin(0.5);

    const continueBtnBg = this.add.rectangle(0, 190, 240, 44, 0xff007f)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const continueBtnTxt = this.add.text(0, 190, 'WEITER FEIERN! 🪩', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
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
    this.toastContainer = this.add.container(w / 2, 75).setDepth(250).setVisible(false);

    const bg = this.add.rectangle(0, 0, 400, 36, 0x1f1438, 0.95)
      .setStrokeStyle(2, 0x00ffcc);

    this.toastText = this.add.text(0, 0, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
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

  // --- 6. ERGONOMIC MOBILE TOUCH JOYSTICK & BUTTONS ---
  private setupMobileControls(): void {
    const h = this.cameras.main.height;
    const w = this.cameras.main.width;

    // Virtual Joystick on bottom-left (Safe-area margin)
    const stickX = 95;
    const stickY = h - 95;

    this.add.image(stickX, stickY, 'ui_stick_base')
      .setDepth(150)
      .setAlpha(0.65)
      .setInteractive();

    this.touchKnob = this.add.image(stickX, stickY, 'ui_stick_knob')
      .setDepth(151)
      .setAlpha(0.9);

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

    // Mobile Action Buttons on bottom-right (32px radius = 64px touch target)
    // E (Action)
    this.createMobileActionBtn(w - 75, h - 85, 'E', 'Aktion', 0xff007f, () => {
      const worldScene = this.scene.get('WorldScene') as WorldScene;
      if (worldScene) worldScene.handleInteraction();
    });

    // C (Craft)
    this.createMobileActionBtn(w - 165, h - 65, 'C', 'Bauen', 0x9900ff, () => {
      this.toggleCraftingModal();
    });

    // Q (Quests)
    this.createMobileActionBtn(w - 165, h - 145, 'Q', 'Quests', 0x00b4d8, () => {
      this.toggleQuestModal();
    });
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const maxDist = 45;
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

  private createMobileActionBtn(x: number, y: number, key: string, label: string, color: number, action: () => void): void {
    const bg = this.add.circle(x, y, 32, color, 0.85)
      .setStrokeStyle(2.5, 0xffffff)
      .setDepth(150)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y - 4, key, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(151);

    this.add.text(x, y + 14, label, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(151);

    bg.on('pointerdown', () => {
      bg.setScale(0.92);
      action();
    });
    bg.on('pointerup', () => bg.setScale(1));
    bg.on('pointerout', () => bg.setScale(1));
  }
}
