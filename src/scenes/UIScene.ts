import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import { SoundEngine } from '../systems/SoundEngine';
import { DIALOGUES } from '../systems/DialogueData';
import { WorldScene } from './WorldScene';

export class UIScene extends Phaser.Scene {
  // Top HUD Elements
  private hudContainer!: Phaser.GameObjects.Container;
  private topHeaderBg!: Phaser.GameObjects.Rectangle;
  private zoneText!: Phaser.GameObjects.Text;
  private progressBarBg!: Phaser.GameObjects.Rectangle;
  private progressBarFill!: Phaser.GameObjects.Rectangle;
  private progressLabel!: Phaser.GameObjects.Text;
  private inventoryContainer!: Phaser.GameObjects.Container;
  private soundBtnContainer!: Phaser.GameObjects.Container;
  private soundBtnText!: Phaser.GameObjects.Text;
  private questBtnContainer!: Phaser.GameObjects.Container;
  private craftBtnContainer!: Phaser.GameObjects.Container;

  // Sound Unlock Banner (For mobile autoplay policy)
  private soundBanner!: Phaser.GameObjects.Container;

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

  // Mobile Virtual Joystick & Touch Action Buttons
  private mobileControlsContainer!: Phaser.GameObjects.Container;
  private joystickBase!: Phaser.GameObjects.Image;
  private touchKnob!: Phaser.GameObjects.Image;
  private btnE!: Phaser.GameObjects.Container;
  private btnC!: Phaser.GameObjects.Container;
  private btnQ!: Phaser.GameObjects.Container;
  private isTouchingStick: boolean = false;
  private touchStartPos: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const state = GameState.getInstance();

    this.setupTopHUD();
    this.setupSoundBanner();
    this.setupDialogueBox();
    this.setupCraftingModal();
    this.setupQuestModal();
    this.setupFinaleModal();
    this.setupToast();
    this.setupMobileControls();

    // Listen to screen resize & orientation change
    this.scale.on('resize', this.handleResize, this);

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

    this.layoutUI();
    this.updateHUD();
  }

  // --- 1. SOUND BANNER FOR MOBILE AUTOPLAY UNLOCK ---
  private setupSoundBanner(): void {
    const w = this.scale.width;
    this.soundBanner = this.add.container(w / 2, 70).setDepth(260);

    const bg = this.add.rectangle(0, 0, 320, 36, 0xff007f, 0.95)
      .setStrokeStyle(2, 0xffffff);

    const txt = this.add.text(0, 0, '🎧 Tippe hier für Sound & Beats!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.soundBanner.add([bg, txt]);
    this.soundBanner.setSize(320, 36);
    this.soundBanner.setInteractive({ useHandCursor: true });

    this.soundBanner.on('pointerdown', () => {
      SoundEngine.getInstance().unlockAudio();
      this.soundBanner.setVisible(false);
      this.soundBtnText.setText('🔊');
      this.showToast('🔊 Party-Sound aktiviert!');
    });

    // Automatically hide after first touch anywhere
    this.input.on('pointerdown', () => {
      if (this.soundBanner.visible) {
        SoundEngine.getInstance().unlockAudio();
        this.soundBanner.setVisible(false);
      }
    });
  }

  // --- 2. RESPONSIVE TOP BAR HUD ---
  private setupTopHUD(): void {
    this.hudContainer = this.add.container(0, 0).setDepth(100);

    this.topHeaderBg = this.add.rectangle(0, 0, 100, 48, 0x0a0614, 0.95)
      .setStrokeStyle(2, 0x4d396d);

    this.zoneText = this.add.text(0, 0, '🧌 BAUWAGENPLATZ', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.progressBarBg = this.add.rectangle(0, 0, 100, 16, 0x1f1730)
      .setStrokeStyle(1.5, 0x7a5a9e);

    this.progressBarFill = this.add.rectangle(0, 0, 0, 14, 0xff007f)
      .setOrigin(0, 0.5);

    this.progressLabel = this.add.text(0, 0, '0%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ff99dd',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.inventoryContainer = this.add.container(0, 0);

    // Header buttons (Quests, Bauen, Sound)
    this.questBtnContainer = this.createHeaderButton('📜 Quests', () => this.toggleQuestModal());
    this.craftBtnContainer = this.createHeaderButton('🔨 Bauen', () => this.toggleCraftingModal());
    
    // Sound Button
    this.soundBtnContainer = this.add.container(0, 0);
    const sndBg = this.add.circle(0, 0, 18, 0x221a36, 0.95)
      .setStrokeStyle(2, 0x00ffcc);

    this.soundBtnText = this.add.text(0, 0, SoundEngine.getInstance().getMuted() ? '🔇' : '🔊', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.soundBtnContainer.add([sndBg, this.soundBtnText]);
    this.soundBtnContainer.setSize(40, 40);
    this.soundBtnContainer.setInteractive({ useHandCursor: true });
    this.soundBtnContainer.on('pointerdown', () => this.toggleSound());

    this.hudContainer.add([
      this.topHeaderBg,
      this.zoneText,
      this.progressBarBg,
      this.progressBarFill,
      this.progressLabel,
      this.inventoryContainer,
      this.questBtnContainer,
      this.craftBtnContainer,
      this.soundBtnContainer
    ]);
  }

  private createHeaderButton(text: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const bg = this.add.rectangle(0, 0, 84, 30, 0x261a40)
      .setStrokeStyle(1.5, 0x8a45d0);

    const lbl = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, lbl]);
    container.setSize(84, 30);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      SoundEngine.getInstance().playPickup();
      onClick();
    });
    container.on('pointerover', () => bg.setFillStyle(0x3e2868));
    container.on('pointerout', () => bg.setFillStyle(0x261a40));

    return container;
  }

  private updateHUD(): void {
    const state = GameState.getInstance();

    const zoneNames: { [k: string]: string } = {
      hub: '🧌 Valentins Party-Hub',
      kanal: '🎧 Kanal-Rave (Olli)',
      skatehalle: '🛹 Skatehalle (Leander)',
      autobahn: '🍬 Autobahnbrücke (Candy)'
    };
    this.zoneText.setText(zoneNames[state.currentZone] || 'Unbekannt');

    const progress = state.getPartyProgress();
    const barW = this.progressBarBg.width;
    this.progressBarFill.width = Math.max(2, (barW - 2) * (progress / 100));
    this.progressLabel.setText(`${progress}%`);

    // Update Quick Inventory Icons
    this.inventoryContainer.removeAll(true);
    const trackedItems = ['wood', 'scrap', 'glowstick'];
    let offsetX = 0;

    trackedItems.forEach(itemId => {
      const item = state.inventory.get(itemId);
      if (item) {
        const pill = this.add.rectangle(offsetX + 16, 0, 48, 22, 0x18112b, 0.85)
          .setStrokeStyle(1, 0x5a4878);

        const icon = this.add.image(offsetX + 2, 0, item.iconTexture).setScale(0.75);
        const countTxt = this.add.text(offsetX + 18, 0, `${item.count}`, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          color: '#ffd700',
          fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.inventoryContainer.add([pill, icon, countTxt]);
        offsetX += 54;
      }
    });
  }

  private toggleSound(): void {
    const sound = SoundEngine.getInstance();
    const isMuted = sound.toggleMute();
    this.soundBtnText.setText(isMuted ? '🔇' : '🔊');
    this.showToast(isMuted ? '🔇 Ton stummgeschaltet' : '🔊 Ton aktiviert (Party-Beats an!)');
    if (this.soundBanner) this.soundBanner.setVisible(false);
  }

  // --- 3. RESPONSIVE DIALOGUE SYSTEM ---
  private setupDialogueBox(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    this.dialogueBox = this.add.container(w / 2, h - 90).setDepth(200).setVisible(false);

    const bg = this.add.rectangle(0, 0, 400, 160, 0x0c0818, 0.98)
      .setStrokeStyle(2.5, 0xff007f);

    this.dialoguePortrait = this.add.sprite(0, 0, 'valentin_idle').setScale(2.4);

    this.dialogueName = this.add.text(0, 0, 'Speaker Name', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#00ffcc',
      fontStyle: 'bold'
    });

    this.dialogueText = this.add.text(0, 0, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: 300 },
      lineSpacing: 4
    });

    this.dialogueOptionsContainer = this.add.container(0, 0);

    this.dialogueBox.add([bg, this.dialoguePortrait, this.dialogueName, this.dialogueText, this.dialogueOptionsContainer]);
  }

  public openDialogue(nodeId: string): void {
    const node = DIALOGUES[nodeId];
    if (!node) return;

    this.setMobileControlsVisible(false);
    this.dialogueBox.setVisible(true);
    this.dialoguePortrait.setTexture(`${node.speaker}_idle`);
    this.dialogueName.setText(node.speakerName);
    this.dialogueText.setText(node.text);

    this.layoutDialogueBox(node);
  }

  private layoutDialogueBox(node: typeof DIALOGUES[string]): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const isMobile = w < 600;

    const boxW = Math.min(840, w - 16);
    const boxH = isMobile ? Math.min(200, h * 0.42) : 160;

    this.dialogueBox.setPosition(w / 2, h - boxH / 2 - 10);

    const bg = this.dialogueBox.getAt(0) as Phaser.GameObjects.Rectangle;
    bg.setSize(boxW, boxH);

    if (isMobile) {
      // In portrait: compact top avatar, text spans full width
      this.dialoguePortrait.setPosition(-boxW / 2 + 30, -boxH / 2 + 25).setScale(1.8);
      this.dialogueName.setPosition(-boxW / 2 + 65, -boxH / 2 + 18);
      this.dialogueText.setPosition(-boxW / 2 + 18, -boxH / 2 + 48)
        .setStyle({ wordWrap: { width: boxW - 36 }, fontSize: '13px' });
      this.dialogueOptionsContainer.setPosition(0, boxH / 2 - 32);
    } else {
      this.dialoguePortrait.setPosition(-boxW / 2 + 60, -10).setScale(2.6);
      this.dialogueName.setPosition(-boxW / 2 + 125, -58);
      this.dialogueText.setPosition(-boxW / 2 + 125, -34)
        .setStyle({ wordWrap: { width: boxW - 150 }, fontSize: '14px' });
      this.dialogueOptionsContainer.setPosition(0, 42);
    }

    // Render Option Buttons
    this.dialogueOptionsContainer.removeAll(true);

    if (node.options && node.options.length > 0) {
      const numOptions = node.options.length;
      const btnWidth = isMobile ? Math.min(boxW - 30, 260) : Math.min(260, (boxW - 160) / numOptions - 10);
      let optX = isMobile ? 0 : -boxW / 2 + 130 + btnWidth / 2;

      node.options.forEach(opt => {
        const btnBg = this.add.rectangle(optX, 0, btnWidth, 34, 0x251442)
          .setStrokeStyle(2, 0x00ffcc)
          .setInteractive({ useHandCursor: true });

        const btnText = this.add.text(optX, 0, opt.label, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: 'bold',
          wordWrap: { width: btnWidth - 10 },
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
        if (!isMobile) optX += btnWidth + 12;
      });
    } else {
      this.dialogueBox.setInteractive(new Phaser.Geom.Rectangle(-boxW / 2, -boxH / 2, boxW, boxH), Phaser.Geom.Rectangle.Contains);
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
    this.setMobileControlsVisible(true);
  }

  // --- 4. RESPONSIVE CRAFTING MODAL ---
  private setupCraftingModal(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    this.craftingModal = this.add.container(w / 2, h / 2).setDepth(210).setVisible(false);

    const modalW = Math.min(720, w - 16);
    const modalH = Math.min(520, h - 24);

    const bg = this.add.rectangle(0, 0, modalW, modalH, 0x0f0b1e, 0.98)
      .setStrokeStyle(2.5, 0xffd700);

    const title = this.add.text(0, -modalH / 2 + 26, '🔨 WERKBANK: PARTY-AUSBAU', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtnBg = this.add.circle(modalW / 2 - 24, -modalH / 2 + 26, 18, 0x2b153b, 0.95)
      .setStrokeStyle(1.5, 0xff007f)
      .setInteractive({ useHandCursor: true });

    const closeBtn = this.add.text(modalW / 2 - 24, -modalH / 2 + 26, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#ff4da6'
    }).setOrigin(0.5);

    closeBtnBg.on('pointerdown', () => this.toggleCraftingModal());

    this.craftingModal.add([bg, title, closeBtnBg, closeBtn]);
  }

  public openCraftingMenu(): void {
    this.setMobileControlsVisible(false);
    this.refreshCraftingList();
    this.craftingModal.setVisible(true);
    SoundEngine.getInstance().playPickup();
  }

  private toggleCraftingModal(): void {
    if (this.craftingModal.visible) {
      this.craftingModal.setVisible(false);
      this.setMobileControlsVisible(true);
    } else {
      this.openCraftingMenu();
    }
  }

  private refreshCraftingList(): void {
    const state = GameState.getInstance();
    const w = this.scale.width;
    const isMobile = w < 600;

    while (this.craftingModal.length > 4) {
      this.craftingModal.removeAt(4, true);
    }

    const modalW = Math.min(720, this.scale.width - 16);
    let yOffset = -155;

    state.craftingRecipes.forEach(recipe => {
      const cardBg = this.add.rectangle(0, yOffset + 28, modalW - 24, 60, 0x1a1236)
        .setStrokeStyle(1.5, recipe.built ? 0x00ff88 : 0x5a4878);

      const icon = this.add.image(-modalW / 2 + 36, yOffset + 28, recipe.icon).setScale(0.9);

      const nameTxt = this.add.text(-modalW / 2 + 65, yOffset + 12, recipe.name, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isMobile ? '13px' : '14px',
        color: recipe.built ? '#00ff88' : '#ffffff',
        fontStyle: 'bold'
      });

      const descTxt = this.add.text(-modalW / 2 + 65, yOffset + 32, isMobile ? recipe.description.substring(0, 24) + '...' : recipe.description, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#bbbbbb'
      });

      // Cost summary
      let costStr = recipe.costs.map(c => {
        const cur = state.getItemCount(c.itemId);
        const name = state.inventory.get(c.itemId)?.name || c.itemId;
        return `${name}: ${cur}/${c.amount}`;
      }).join(' | ');

      if (recipe.requiredFriendId && !state.isFriendRecruited(recipe.requiredFriendId)) {
        costStr = `🔒 Braucht ${recipe.requiredFriendId.toUpperCase()}`;
      }

      const costTxt = this.add.text(isMobile ? 30 : modalW / 2 - 175, yOffset + 28, costStr, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#ffbb44',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      if (recipe.built) {
        const builtBadge = this.add.text(modalW / 2 - 55, yOffset + 28, '✓ GEBAUT', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '13px',
          color: '#00ff88',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        this.craftingModal.add([cardBg, icon, nameTxt, descTxt, costTxt, builtBadge]);
      } else {
        const canBuild = (!recipe.requiredFriendId || state.isFriendRecruited(recipe.requiredFriendId)) &&
          recipe.costs.every(c => state.getItemCount(c.itemId) >= c.amount);

        const btnBg = this.add.rectangle(modalW / 2 - 55, yOffset + 28, 80, 32, canBuild ? 0xff007f : 0x2d2242)
          .setStrokeStyle(1.5, canBuild ? 0xff66cc : 0x555555)
          .setInteractive({ useHandCursor: canBuild });

        const btnTxt = this.add.text(modalW / 2 - 55, yOffset + 28, 'BAUEN', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '13px',
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

      yOffset += 68;
    });
  }

  // --- 5. RESPONSIVE QUEST MODAL ---
  private setupQuestModal(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    this.questModal = this.add.container(w / 2, h / 2).setDepth(210).setVisible(false);

    const modalW = Math.min(720, w - 16);
    const modalH = Math.min(500, h - 24);

    const bg = this.add.rectangle(0, 0, modalW, modalH, 0x100a26, 0.98)
      .setStrokeStyle(2.5, 0x00ffcc);

    const title = this.add.text(0, -modalH / 2 + 26, '📜 GEBURTSTAGS-TAGEBUCH & QUESTS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtnBg = this.add.circle(modalW / 2 - 24, -modalH / 2 + 26, 18, 0x23143d, 0.95)
      .setStrokeStyle(1.5, 0xff007f)
      .setInteractive({ useHandCursor: true });

    const closeBtn = this.add.text(modalW / 2 - 24, -modalH / 2 + 26, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#ff4da6'
    }).setOrigin(0.5);

    closeBtnBg.on('pointerdown', () => this.toggleQuestModal());

    this.questModal.add([bg, title, closeBtnBg, closeBtn]);
  }

  private toggleQuestModal(): void {
    if (this.questModal.visible) {
      this.questModal.setVisible(false);
      this.setMobileControlsVisible(true);
    } else {
      this.setMobileControlsVisible(false);
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

    const modalW = Math.min(720, this.scale.width - 16);
    let yOffset = -140;

    state.quests.forEach(quest => {
      const isRecruited = state.isFriendRecruited(quest.friendId);
      const cardBg = this.add.rectangle(0, yOffset + 38, modalW - 24, 82, 0x1b1338)
        .setStrokeStyle(1.5, isRecruited ? 0x00ff88 : 0x00e5ff);

      const titleTxt = this.add.text(-modalW / 2 + 24, yOffset + 10, quest.title, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14px',
        color: isRecruited ? '#00ff88' : '#ffd700',
        fontStyle: 'bold'
      });

      const stepsStr = quest.steps.map(s => `${s.isCompleted ? '☑' : '☐'} ${s.text}`).join('\n');
      const stepsTxt = this.add.text(-modalW / 2 + 24, yOffset + 30, stepsStr, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#ffffff',
        lineSpacing: 3
      });

      const statusBadge = this.add.text(modalW / 2 - 60, yOffset + 38, isRecruited ? '🎉 DABEI!' : '⏳ OFFEN', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: isRecruited ? '#00ff88' : '#ff9900',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.questModal.add([cardBg, titleTxt, stepsTxt, statusBadge]);
      yOffset += 94;
    });
  }

  // --- 6. FINALE MODAL ---
  private setupFinaleModal(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    this.finaleModal = this.add.container(w / 2, h / 2).setDepth(300).setVisible(false);

    const modalW = Math.min(720, w - 16);
    const modalH = Math.min(500, h - 24);

    const bg = this.add.rectangle(0, 0, modalW, modalH, 0x140624, 0.98)
      .setStrokeStyle(3.5, 0xff00ea);

    const title = this.add.text(0, -modalH / 2 + 35, '🎂 HAPPY BIRTHDAY, VALENTIN! 🎂', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const vSprite = this.add.sprite(-130, -50, 'valentin_dance').setScale(2.4);
    const oSprite = this.add.sprite(-45, -50, 'olli_dance').setScale(2.4);
    const lSprite = this.add.sprite(45, -50, 'leander_dance').setScale(2.4);
    const cSprite = this.add.sprite(130, -50, 'candy_dance').setScale(2.4);

    const cakeImg = this.add.image(0, 40, 'prop_birthday_cake').setScale(1.8);

    const msg = this.add.text(0, 110, 'Du hast alle deine Freunde gefunden, den Bauwagenplatz ausgebaut\nund die legendärste Goblin-Rave-Party aller Zeiten gestartet!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    const continueBtnBg = this.add.rectangle(0, 175, 210, 40, 0xff007f)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const continueBtnTxt = this.add.text(0, 175, 'WEITER FEIERN! 🪩', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    continueBtnBg.on('pointerdown', () => {
      this.finaleModal.setVisible(false);
      this.setMobileControlsVisible(true);
      const worldScene = this.scene.get('WorldScene') as WorldScene;
      worldScene.triggerFinaleCelebration();
    });

    this.finaleModal.add([bg, title, vSprite, oSprite, lSprite, cSprite, cakeImg, msg, continueBtnBg, continueBtnTxt]);
  }

  public openFinaleModal(): void {
    this.setMobileControlsVisible(false);
    this.finaleModal.setVisible(true);
  }

  // --- TOAST NOTIFICATIONS ---
  private setupToast(): void {
    const w = this.scale.width;
    this.toastContainer = this.add.container(w / 2, 75).setDepth(250).setVisible(false);

    const bg = this.add.rectangle(0, 0, 360, 34, 0x1f1438, 0.95)
      .setStrokeStyle(2, 0x00ffcc);

    this.toastText = this.add.text(0, 0, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
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

  // --- 7. MOBILE CONTROLS & ERGONOMICS ---
  private setupMobileControls(): void {
    this.mobileControlsContainer = this.add.container(0, 0).setDepth(150);

    const h = this.scale.height;
    const w = this.scale.width;

    const stickX = 75;
    const stickY = h - 75;

    this.joystickBase = this.add.image(stickX, stickY, 'ui_stick_base')
      .setAlpha(0.65)
      .setInteractive();

    this.touchKnob = this.add.image(stickX, stickY, 'ui_stick_knob')
      .setAlpha(0.9);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < 220 && pointer.y > this.scale.height - 200) {
        this.isTouchingStick = true;
        this.touchStartPos = { x: this.joystickBase.x, y: this.joystickBase.y };
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
        this.touchKnob.setPosition(this.joystickBase.x, this.joystickBase.y);
      }
      const worldScene = this.scene.get('WorldScene') as WorldScene;
      if (worldScene && worldScene.player) {
        worldScene.player.joystickVector = { x: 0, y: 0 };
      }
    });

    // Mobile Action Buttons on bottom-right (safe, comfortable spacing)
    this.btnE = this.createMobileActionBtn(w - 65, h - 75, 'E', 'Aktion', 0xff007f, () => {
      const worldScene = this.scene.get('WorldScene') as WorldScene;
      if (worldScene) worldScene.handleInteraction();
    });

    this.btnC = this.createMobileActionBtn(w - 145, h - 60, 'C', 'Bauen', 0x9900ff, () => {
      this.toggleCraftingModal();
    });

    this.btnQ = this.createMobileActionBtn(w - 145, h - 135, 'Q', 'Quests', 0x00b4d8, () => {
      this.toggleQuestModal();
    });

    this.mobileControlsContainer.add([this.joystickBase, this.touchKnob, this.btnE, this.btnC, this.btnQ]);
  }

  private setMobileControlsVisible(visible: boolean): void {
    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.setVisible(visible);
    }
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

  private createMobileActionBtn(x: number, y: number, key: string, label: string, color: number, action: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.circle(0, 0, 30, color, 0.88)
      .setStrokeStyle(2.5, 0xffffff);

    const keyTxt = this.add.text(0, -4, key, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const lblTxt = this.add.text(0, 14, label, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, keyTxt, lblTxt]);
    container.setSize(60, 60);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      container.setScale(0.92);
      action();
    });
    container.on('pointerup', () => container.setScale(1));
    container.on('pointerout', () => container.setScale(1));

    return container;
  }

  // --- 8. DYNAMIC RESPONSIVE LAYOUT ENGINE ---
  private handleResize(): void {
    this.layoutUI();
  }

  private layoutUI(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const isMobilePortrait = w < 600;

    // Layout Top HUD
    if (this.topHeaderBg) {
      const hudH = isMobilePortrait ? 66 : 46;
      this.topHeaderBg.setPosition(w / 2, hudH / 2 + 6).setSize(w - 16, hudH);

      if (isMobilePortrait) {
        // Row 1: Zone left, Progress center, Sound right
        this.zoneText.setPosition(18, 20).setFontSize('12px');
        this.progressBarBg.setPosition(w / 2 - 20, 20).setSize(70, 14);
        this.progressBarFill.setPosition(w / 2 - 55, 20);
        this.progressLabel.setPosition(w / 2 + 20, 20).setFontSize('11px');
        this.soundBtnContainer.setPosition(w - 32, 20);

        // Row 2: Inventory Pills
        this.inventoryContainer.setPosition(18, 48);

        // Hide desktop header text buttons (mobile uses bottom action buttons [Q], [C])
        this.questBtnContainer.setVisible(false);
        this.craftBtnContainer.setVisible(false);
      } else {
        // Desktop / Landscape single row
        this.zoneText.setPosition(20, 29).setFontSize('14px');
        this.progressBarBg.setPosition(w * 0.32, 29).setSize(110, 16);
        this.progressBarFill.setPosition(w * 0.32 - 55, 29);
        this.progressLabel.setPosition(w * 0.32 + 65, 29).setFontSize('13px');

        this.inventoryContainer.setPosition(w * 0.48, 29);

        this.questBtnContainer.setVisible(true).setPosition(w - 215, 29);
        this.craftBtnContainer.setVisible(true).setPosition(w - 120, 29);
        this.soundBtnContainer.setPosition(w - 38, 29);
      }
    }

    if (this.soundBanner) {
      this.soundBanner.setPosition(w / 2, isMobilePortrait ? 85 : 70);
    }

    if (this.toastContainer) {
      this.toastContainer.setPosition(w / 2, isMobilePortrait ? 95 : 75);
    }

    // Layout Mobile Joystick & Action Buttons
    if (this.joystickBase) {
      const stickX = 75;
      const stickY = h - 75;
      this.joystickBase.setPosition(stickX, stickY);
      if (this.touchKnob) this.touchKnob.setPosition(stickX, stickY);
    }

    if (this.btnE) this.btnE.setPosition(w - 65, h - 75);
    if (this.btnC) this.btnC.setPosition(w - 145, h - 60);
    if (this.btnQ) this.btnQ.setPosition(w - 145, h - 135);

    // Layout Modals
    if (this.craftingModal) this.craftingModal.setPosition(w / 2, h / 2);
    if (this.questModal) this.questModal.setPosition(w / 2, h / 2);
    if (this.finaleModal) this.finaleModal.setPosition(w / 2, h / 2);
  }
}
