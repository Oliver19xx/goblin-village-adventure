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
  private craftingModal!: Phaser.GameObjects.Container;
  private questModal!: Phaser.GameObjects.Container;
  private finaleModal!: Phaser.GameObjects.Container;
  private currentDialogueNodeId: string | null = null;

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

  private getViewport(): { w: number; h: number; isPortrait: boolean } {
    const w = window.innerWidth || this.scale.width || 390;
    const h = window.innerHeight || this.scale.height || 844;
    const isPortrait = h > w || w < 600;
    return { w, h, isPortrait };
  }

  create(): void {
    const state = GameState.getInstance();

    this.setupTopHUD();
    this.setupSoundBanner();
    this.setupContainers();
    this.setupToast();
    this.setupMobileControls();

    // Listen to screen resize & orientation change
    this.scale.on('resize', this.handleResize, this);

    // Initial Layout calculation
    this.layoutUI();
    this.updateHUD();

    // Listen to GameState events
    state.on('inventory_changed', () => this.updateHUD());
    state.on('upgrade_crafted', () => {
      this.updateHUD();
      if (this.craftingModal.visible) this.renderCraftingModal();
    });
    state.on('friend_recruited', (friendId: string) => {
      this.updateHUD();
      this.showToast(`🎉 ${friendId.toUpperCase()} ist jetzt auf deiner Party!`);
    });
    state.on('quest_updated', () => {
      this.updateHUD();
      if (this.questModal.visible) this.renderQuestModal();
    });
    state.on('birthday_finale', () => this.openFinaleModal());

    // Hotkeys for Desktop testing
    this.input.keyboard?.on('keydown-C', () => this.toggleCraftingModal());
    this.input.keyboard?.on('keydown-Q', () => this.toggleQuestModal());
    this.input.keyboard?.on('keydown-M', () => this.toggleSound());

    // Check debug URL params for UI (delayed slightly for exact canvas resolution)
    const params = new URLSearchParams(window.location.search);
    const modal = params.get('modal');
    const dialogue = params.get('dialogue');
    const demo = params.get('demo');

    this.time.delayedCall(60, () => {
      if (modal === 'crafting') {
        this.openCraftingMenu();
      } else if (modal === 'quests') {
        this.toggleQuestModal();
      } else if (dialogue) {
        this.openDialogue(dialogue);
      } else if (demo === 'finale') {
        this.openFinaleModal();
      }
    });
  }

  private setupContainers(): void {
    const { w, h } = this.getViewport();

    this.dialogueBox = this.add.container(w / 2, h - 140).setDepth(200).setVisible(false);
    this.craftingModal = this.add.container(w / 2, h / 2).setDepth(210).setVisible(false);
    this.questModal = this.add.container(w / 2, h / 2).setDepth(210).setVisible(false);
    this.finaleModal = this.add.container(w / 2, h / 2).setDepth(300).setVisible(false);
  }

  // --- 1. SOUND BANNER FOR MOBILE AUTOPLAY UNLOCK ---
  private setupSoundBanner(): void {
    const { w } = this.getViewport();
    this.soundBanner = this.add.container(w / 2, 85).setDepth(260);

    const bannerW = Math.min(310, w - 24);
    const bg = this.add.rectangle(0, 0, bannerW, 34, 0xff007f, 0.95)
      .setStrokeStyle(2, 0xffffff);
    const txt = this.add.text(0, 0, '🎧 Tippe hier für Goa- & Psytrance-Beats!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.soundBanner.add([bg, txt]);
    this.soundBanner.setSize(bannerW, 34);
    this.soundBanner.setInteractive({ useHandCursor: true });

    this.soundBanner.on('pointerdown', () => {
      SoundEngine.getInstance().unlockAudio();
      this.soundBanner.setVisible(false);
      this.soundBtnText.setText('🔊');
      this.showToast('🔊 Goa- & Psytrance-Sound aktiviert!');
    });

    this.input.on('pointerdown', () => {
      if (this.soundBanner && this.soundBanner.visible) {
        SoundEngine.getInstance().unlockAudio();
        this.soundBanner.setVisible(false);
        this.soundBtnText.setText('🔊');
      }
    });
  }

  // --- 2. RESPONSIVE TOP BAR HUD ---
  private setupTopHUD(): void {
    const { w } = this.getViewport();
    this.hudContainer = this.add.container(0, 0).setDepth(100);

    // Dark semi-transparent header bar
    this.topHeaderBg = this.add.rectangle(w / 2, 28, w, 56, 0x080412, 0.94)
      .setStrokeStyle(1.5, 0x3d235c);
    this.hudContainer.add(this.topHeaderBg);

    // Current Zone Pill
    const zonePill = this.add.rectangle(60, 20, 100, 24, 0x1f1438, 0.9)
      .setStrokeStyle(1.2, 0x00ffcc);
    this.zoneText = this.add.text(60, 20, '🧌 Party-Hub', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.hudContainer.add([zonePill, this.zoneText]);

    // Party Progress Bar
    const barW = Math.min(140, w * 0.35);
    const barX = w - barW / 2 - 14;
    this.progressBarBg = this.add.rectangle(barX, 20, barW, 16, 0x160f26, 0.9)
      .setStrokeStyle(1.2, 0xff007f);
    this.progressBarFill = this.add.rectangle(barX - barW / 2 + 1, 20, 2, 12, 0xff007f).setOrigin(0, 0.5);
    this.progressLabel = this.add.text(barX + barW / 2 + 6, 20, '0%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.hudContainer.add([this.progressBarBg, this.progressBarFill, this.progressLabel]);

    // Quick Material Counters
    this.inventoryContainer = this.add.container(14, 44);
    this.hudContainer.add(this.inventoryContainer);

    // Action / Menu Buttons (Quests, Crafting, Sound)
    this.soundBtnContainer = this.createPillButton(w - 24, 44, '🔊', 0x3a1d52, () => this.toggleSound());
    this.soundBtnText = this.soundBtnContainer.getAt(1) as Phaser.GameObjects.Text;
    this.hudContainer.add(this.soundBtnContainer);
  }

  private createPillButton(x: number, y: number, text: string, bgColor: number, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.circle(0, 0, 13, bgColor, 0.9)
      .setStrokeStyle(1.2, 0x00ffcc)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);

    bg.on('pointerdown', () => callback());
    container.add([bg, txt]);

    return container;
  }

  private updateHUD(): void {
    const state = GameState.getInstance();

    const zoneNames: { [k: string]: string } = {
      hub: '🧌 Party-Hub',
      kanal: '🎧 Kanal',
      coworking: '📋 Coworking',
      autobahn: '🍬 Autobahn',
      bauernhof: '🌿 Bauernhof'
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
    this.showToast(isMuted ? '🔇 Ton stummgeschaltet' : '🔊 Goa- & Psytrance-Sound aktiviert!');
    if (this.soundBanner) this.soundBanner.setVisible(false);
  }

  // --- 3. DYNAMIC RESPONSIVE DIALOGUE SYSTEM (STRICT CONTAINMENT) ---
  public openDialogue(nodeId: string): void {
    this.currentDialogueNodeId = nodeId;
    this.setMobileControlsVisible(false);
    this.renderDialogueBox(nodeId);
    this.dialogueBox.setVisible(true);
  }

  private renderDialogueBox(nodeId: string): void {
    const node = DIALOGUES[nodeId];
    if (!node) return;

    this.dialogueBox.removeAll(true);

    const { w, h, isPortrait } = this.getViewport();

    const numOptions = node.options ? node.options.length : 0;
    const boxW = isPortrait ? Math.min(355, w - 20) : Math.min(680, w - 24);
    // Give plenty of vertical space so text and stacked buttons stay completely inside
    const boxH = isPortrait ? (numOptions > 1 ? 275 : 205) : 160;

    this.dialogueBox.setPosition(w / 2, h - boxH / 2 - 12);

    const bg = this.add.rectangle(0, 0, boxW, boxH, 0x0c0818, 0.98)
      .setStrokeStyle(2.5, 0xff007f);

    if (isPortrait) {
      // Avatar positioned with comfortable margin inside top-left
      const portrait = this.add.sprite(-boxW / 2 + 30, -boxH / 2 + 28, `${node.speaker}_idle`).setScale(1.25);
      const nameTxt = this.add.text(-boxW / 2 + 54, -boxH / 2 + 18, node.speakerName, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12.5px',
        color: '#00ffcc',
        fontStyle: 'bold'
      });

      const bodyTxt = this.add.text(-boxW / 2 + 16, -boxH / 2 + 52, node.text, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11.5px',
        color: '#ffffff',
        wordWrap: { width: boxW - 36 },
        lineSpacing: 3
      });

      this.dialogueBox.add([bg, portrait, nameTxt, bodyTxt]);

      if (node.options && node.options.length > 0) {
        const btnWidth = boxW - 28;
        const btnH = 34;

        node.options.forEach((opt, idx) => {
          // Calculate optY from bottom border to guarantee 100% containment
          const offsetFromBottom = numOptions > 1 ? (numOptions - 1 - idx) * 40 + 26 : 24;
          const optY = boxH / 2 - offsetFromBottom;

          const btnBg = this.add.rectangle(0, optY, btnWidth, btnH, 0x251442)
            .setStrokeStyle(2, 0x00ffcc)
            .setInteractive({ useHandCursor: true });

          const btnText = this.add.text(0, optY, opt.label, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: 'bold',
            wordWrap: { width: btnWidth - 14 },
            align: 'center'
          }).setOrigin(0.5);

          btnBg.on('pointerdown', () => {
            SoundEngine.getInstance().playPickup();
            if (opt.action) this.handleDialogueAction(opt.action);
            if (opt.nextNodeId) {
              this.renderDialogueBox(opt.nextNodeId);
            } else {
              this.closeDialogue();
            }
          });

          this.dialogueBox.add([btnBg, btnText]);
        });
      } else {
        this.dialogueBox.setInteractive(new Phaser.Geom.Rectangle(-boxW / 2, -boxH / 2, boxW, boxH), Phaser.Geom.Rectangle.Contains);
        this.dialogueBox.once('pointerdown', () => this.closeDialogue());
      }
    } else {
      const portrait = this.add.sprite(-boxW / 2 + 55, -10, `${node.speaker}_idle`).setScale(2.4);
      const nameTxt = this.add.text(-boxW / 2 + 115, -55, node.speakerName, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#00ffcc',
        fontStyle: 'bold'
      });

      const bodyTxt = this.add.text(-boxW / 2 + 115, -30, node.text, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        wordWrap: { width: boxW - 140 },
        lineSpacing: 4
      });

      this.dialogueBox.add([bg, portrait, nameTxt, bodyTxt]);

      if (node.options && node.options.length > 0) {
        const btnWidth = Math.min(240, (boxW - 140) / numOptions - 10);
        let optX = -boxW / 2 + 115 + btnWidth / 2;

        node.options.forEach(opt => {
          const btnBg = this.add.rectangle(optX, 42, btnWidth, 34, 0x251442)
            .setStrokeStyle(2, 0x00ffcc)
            .setInteractive({ useHandCursor: true });

          const btnText = this.add.text(optX, 42, opt.label, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold',
            wordWrap: { width: btnWidth - 10 },
            align: 'center'
          }).setOrigin(0.5);

          btnBg.on('pointerdown', () => {
            SoundEngine.getInstance().playPickup();
            if (opt.action) this.handleDialogueAction(opt.action);
            if (opt.nextNodeId) {
              this.renderDialogueBox(opt.nextNodeId);
            } else {
              this.closeDialogue();
            }
          });

          this.dialogueBox.add([btnBg, btnText]);
          optX += btnWidth + 12;
        });
      } else {
        this.dialogueBox.setInteractive(new Phaser.Geom.Rectangle(-boxW / 2, -boxH / 2, boxW, boxH), Phaser.Geom.Rectangle.Contains);
        this.dialogueBox.once('pointerdown', () => this.closeDialogue());
      }
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
    } else if (action === 'recruit_henning') {
      state.recruitFriend('henning');
      state.quests.get('quest_henning')!.isCompleted = true;
      SoundEngine.getInstance().playQuestComplete();
    }
  }

  private closeDialogue(): void {
    this.currentDialogueNodeId = null;
    this.dialogueBox.setVisible(false);
    this.setMobileControlsVisible(true);
  }

  // --- 4. DYNAMIC RESPONSIVE CRAFTING MODAL (STRICT CONTAINMENT) ---
  public openCraftingMenu(): void {
    this.setMobileControlsVisible(false);
    this.renderCraftingModal();
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

  private renderCraftingModal(): void {
    this.craftingModal.removeAll(true);

    const state = GameState.getInstance();
    const { w, h, isPortrait } = this.getViewport();

    const modalW = isPortrait ? Math.min(355, w - 20) : Math.min(640, w - 24);
    const modalH = isPortrait ? Math.min(540, h - 30) : Math.min(520, h - 20);

    this.craftingModal.setPosition(w / 2, h / 2);

    const bg = this.add.rectangle(0, 0, modalW, modalH, 0x0f0b1e, 0.98)
      .setStrokeStyle(2.5, 0xffd700);

    const title = this.add.text(0, -modalH / 2 + 20, '🔨 WERKBANK: AUSBAU', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '13px' : '15px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtnBg = this.add.circle(modalW / 2 - 20, -modalH / 2 + 20, 12, 0x2b153b, 0.95)
      .setStrokeStyle(1.5, 0xff007f)
      .setInteractive({ useHandCursor: true });

    const closeBtn = this.add.text(modalW / 2 - 20, -modalH / 2 + 20, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ff4da6'
    }).setOrigin(0.5);

    closeBtnBg.on('pointerdown', () => this.toggleCraftingModal());

    this.craftingModal.add([bg, title, closeBtnBg, closeBtn]);

    const cardW = modalW - 20;
    const cardH = isPortrait ? 60 : 54;
    let yOffset = -modalH / 2 + 42;

    state.craftingRecipes.forEach(recipe => {
      const cardBg = this.add.rectangle(0, yOffset + cardH / 2, cardW, cardH, 0x1a1236)
        .setStrokeStyle(1.5, recipe.built ? 0x00ff88 : 0x5a4878);

      // Icon strictly constrained in size to fit within the card
      const icon = this.add.image(-modalW / 2 + 28, yOffset + cardH / 2, recipe.icon);
      const maxDim = Math.max(icon.width, icon.height);
      if (maxDim > 24) {
        icon.setScale(24 / maxDim);
      } else {
        icon.setScale(0.8);
      }

      const nameTxt = this.add.text(-modalW / 2 + 48, yOffset + 6, recipe.name, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isPortrait ? '10.5px' : '12px',
        color: recipe.built ? '#00ff88' : '#ffffff',
        fontStyle: 'bold',
        wordWrap: { width: modalW - 145 }
      });

      let costStr = recipe.costs.map(c => {
        const cur = state.getItemCount(c.itemId);
        const name = state.inventory.get(c.itemId)?.name || c.itemId;
        return `${name}: ${cur}/${c.amount}`;
      }).join(' | ');

      if (recipe.requiresAllFriends && state.recruitedFriends.size < 4) {
        costStr = `🔒 Braucht alle 4 Freunde (${state.recruitedFriends.size}/4)`;
      } else if (recipe.requiredFriendId && !state.isFriendRecruited(recipe.requiredFriendId)) {
        costStr = `🔒 Braucht ${recipe.requiredFriendId.toUpperCase()}`;
      }

      const costTxt = this.add.text(-modalW / 2 + 48, yOffset + 28, costStr, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '8.5px',
        color: '#ffbb44',
        fontStyle: 'bold',
        wordWrap: { width: modalW - 145 }
      });

      if (recipe.built) {
        const builtBadge = this.add.text(modalW / 2 - 44, yOffset + cardH / 2, '✓ GEBAUT', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '10px',
          color: '#00ff88',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        this.craftingModal.add([cardBg, icon, nameTxt, costTxt, builtBadge]);
      } else {
        const canBuild = (!recipe.requiresAllFriends || state.recruitedFriends.size >= 4) &&
          (!recipe.requiredFriendId || state.isFriendRecruited(recipe.requiredFriendId)) &&
          recipe.costs.every(c => state.getItemCount(c.itemId) >= c.amount);

        // BAUEN button completely inside the card with margin
        const btnBg = this.add.rectangle(modalW / 2 - 44, yOffset + cardH / 2, 58, 24, canBuild ? 0xff007f : 0x2d2242)
          .setStrokeStyle(1.5, canBuild ? 0xff66cc : 0x555555)
          .setInteractive({ useHandCursor: canBuild });

        const btnTxt = this.add.text(modalW / 2 - 44, yOffset + cardH / 2, 'BAUEN', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '10px',
          color: canBuild ? '#ffffff' : '#777777',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        if (canBuild) {
          btnBg.on('pointerdown', () => {
            if (state.craftUpgrade(recipe.id)) {
              this.showToast(`✨ ${recipe.name} gebaut!`);
              this.renderCraftingModal();
            }
          });
        }

        this.craftingModal.add([cardBg, icon, nameTxt, costTxt, btnBg, btnTxt]);
      }

      yOffset += cardH + 4;
    });
  }

  // --- 5. DYNAMIC RESPONSIVE QUEST MODAL (STRICT CONTAINMENT) ---
  public toggleQuestModal(): void {
    if (this.questModal.visible) {
      this.questModal.setVisible(false);
      this.setMobileControlsVisible(true);
    } else {
      this.setMobileControlsVisible(false);
      this.renderQuestModal();
      this.questModal.setVisible(true);
      SoundEngine.getInstance().playPickup();
    }
  }

  private renderQuestModal(): void {
    this.questModal.removeAll(true);

    const state = GameState.getInstance();
    const { w, h, isPortrait } = this.getViewport();

    const modalW = isPortrait ? Math.min(360, w - 16) : Math.min(640, w - 24);
    const modalH = isPortrait ? Math.min(580, h - 30) : Math.min(520, h - 20);

    this.questModal.setPosition(w / 2, h / 2);

    const bg = this.add.rectangle(0, 0, modalW, modalH, 0x100a26, 0.98)
      .setStrokeStyle(2.5, 0x00ffcc);

    const title = this.add.text(0, -modalH / 2 + 20, '📜 QUESTS & FREUNDE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '13px' : '15px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtnBg = this.add.circle(modalW / 2 - 20, -modalH / 2 + 20, 12, 0x23143d, 0.95)
      .setStrokeStyle(1.5, 0xff007f)
      .setInteractive({ useHandCursor: true });

    const closeBtn = this.add.text(modalW / 2 - 20, -modalH / 2 + 20, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ff4da6'
    }).setOrigin(0.5);

    closeBtnBg.on('pointerdown', () => this.toggleQuestModal());

    this.questModal.add([bg, title, closeBtnBg, closeBtn]);

    const cardW = modalW - 16;
    const cardH = isPortrait ? 68 : 62;
    let yOffset = -modalH / 2 + 40;

    state.quests.forEach(quest => {
      const isFriendQuest = quest.friendId !== 'valentin';
      const isRecruited = isFriendQuest ? state.isFriendRecruited(quest.friendId) : state.isCakePlaced;
      const isCompleted = quest.isCompleted || (quest.id === 'quest_finale' ? state.isCakePlaced : isRecruited);

      const borderColor = isCompleted ? 0x00ff88 : (quest.id === 'quest_finale' ? 0xff007f : 0x00e5ff);
      const cardBg = this.add.rectangle(0, yOffset + cardH / 2, cardW, cardH, 0x1b1338)
        .setStrokeStyle(1.5, borderColor);

      const titleTxt = this.add.text(-modalW / 2 + 12, yOffset + 6, quest.title, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isPortrait ? '10px' : '11.5px',
        color: isCompleted ? '#00ff88' : '#ffd700',
        fontStyle: 'bold',
        wordWrap: { width: modalW - 90 }
      });

      const stepsStr = quest.steps.map(s => `${s.isCompleted ? '☑' : '☐'} ${s.text}`).join('\n');
      const stepsTxt = this.add.text(-modalW / 2 + 12, yOffset + 22, stepsStr, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isPortrait ? '8px' : '9px',
        color: '#ffffff',
        wordWrap: { width: modalW - 28 },
        lineSpacing: 2
      });

      let badgeText = isRecruited ? '🎉 DABEI!' : '⏳ OFFEN';
      let badgeColor = isRecruited ? '#00ff88' : '#ff9900';

      if (quest.id === 'quest_finale') {
        if (state.isCakePlaced) {
          badgeText = '🎂 GEFEIERT!';
          badgeColor = '#00ff88';
        } else if (state.isCakeBaked) {
          badgeText = '✨ PLATZIEREN';
          badgeColor = '#ff00ea';
        } else if (state.recruitedFriends.size >= 4) {
          badgeText = '🔨 BACKEN';
          badgeColor = '#ffd700';
        } else {
          badgeText = `⏳ FREUNDE (${state.recruitedFriends.size}/4)`;
          badgeColor = '#00ffcc';
        }
      }

      const statusBadge = this.add.text(modalW / 2 - 40, yOffset + 10, badgeText, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isPortrait ? '8px' : '9px',
        color: badgeColor,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.questModal.add([cardBg, titleTxt, stepsTxt, statusBadge]);
      yOffset += cardH + 4;
    });
  }

  // --- 6. DYNAMIC RESPONSIVE FINALE MODAL (STRICT CONTAINMENT) ---
  public openFinaleModal(): void {
    this.setMobileControlsVisible(false);
    this.renderFinaleModal();
    this.finaleModal.setVisible(true);
  }

  private renderFinaleModal(): void {
    this.finaleModal.removeAll(true);

    const { w, h, isPortrait } = this.getViewport();

    const modalW = isPortrait ? Math.min(360, w - 16) : Math.min(640, w - 24);
    const modalH = isPortrait ? Math.min(460, h - 80) : Math.min(500, h - 30);

    this.finaleModal.setPosition(w / 2, h / 2);

    const bg = this.add.rectangle(0, 0, modalW, modalH, 0x140624, 0.98)
      .setStrokeStyle(3.5, 0xff00ea);

    const title = this.add.text(0, -modalH / 2 + 24, '🎂 HAPPY BIRTHDAY, VALENTIN! 🎂', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '13.5px' : '17px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const spacing = isPortrait ? 30 : 54;
    const vSprite = this.add.sprite(-spacing * 2, -modalH / 2 + 75, 'valentin_dance').setScale(1.3);
    const oSprite = this.add.sprite(-spacing * 1, -modalH / 2 + 75, 'olli_dance').setScale(1.3);
    const lSprite = this.add.sprite(0, -modalH / 2 + 75, 'leander_dance').setScale(1.3);
    const cSprite = this.add.sprite(spacing * 1, -modalH / 2 + 75, 'candy_dance').setScale(1.3);
    const hSprite = this.add.sprite(spacing * 2, -modalH / 2 + 75, 'henning_dance').setScale(1.3);

    const cakeImg = this.add.image(0, -modalH / 2 + 140, 'prop_birthday_cake').setScale(1.25);

    const msg = this.add.text(0, modalH / 2 - 80, 'Du hast alle deine 4 Freunde gefunden,\nden Party-Platz ausgebaut und den legendärsten\nGoblin-Rave aller Zeiten gestartet!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: modalW - 36 },
      lineSpacing: 3
    }).setOrigin(0.5);

    const continueBtnBg = this.add.rectangle(0, modalH / 2 - 28, 160, 34, 0xff007f)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const continueBtnTxt = this.add.text(0, modalH / 2 - 28, 'WEITER FEIERN! 🪩', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    continueBtnBg.on('pointerdown', () => {
      this.finaleModal.setVisible(false);
      this.setMobileControlsVisible(true);
      const worldScene = this.scene.get('WorldScene') as WorldScene;
      worldScene.triggerFinaleCelebration();
    });

    this.finaleModal.add([bg, title, vSprite, oSprite, lSprite, cSprite, hSprite, cakeImg, msg, continueBtnBg, continueBtnTxt]);
  }

  // --- TOAST NOTIFICATIONS ---
  private setupToast(): void {
    const { w } = this.getViewport();
    this.toastContainer = this.add.container(w / 2, 85).setDepth(250).setVisible(false);

    const bg = this.add.rectangle(0, 0, 300, 32, 0x1f1438, 0.95)
      .setStrokeStyle(2, 0x00ffcc);

    this.toastText = this.add.text(0, 0, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
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

  // --- 7. MOBILE TOUCH CONTROLS & ERGONOMICS ---
  private setupMobileControls(): void {
    this.mobileControlsContainer = this.add.container(0, 0).setDepth(150);

    const { w, h } = this.getViewport();

    const stickX = 65;
    const stickY = h - 75;

    this.joystickBase = this.add.image(stickX, stickY, 'ui_stick_base')
      .setAlpha(0.65)
      .setInteractive();

    this.touchKnob = this.add.image(stickX, stickY, 'ui_stick_knob')
      .setAlpha(0.9);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < w * 0.45 && pointer.y > this.scale.height - 240) {
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

    // Mobile Action Buttons on bottom-right (Thumb Reach Area)
    // E (Action) - Primary Thumb Button
    this.btnE = this.createMobileActionBtn(w - 50, h - 75, 'E', 'Aktion', 0xff007f, 30, () => {
      const worldScene = this.scene.get('WorldScene') as WorldScene;
      if (worldScene) worldScene.handleInteraction();
    });

    // C (Craft) - Secondary Button
    this.btnC = this.createMobileActionBtn(w - 120, h - 55, 'C', 'Bauen', 0x9900ff, 24, () => {
      this.toggleCraftingModal();
    });

    // Q (Quests) - Tertiary Button
    this.btnQ = this.createMobileActionBtn(w - 120, h - 120, 'Q', 'Quests', 0x00b4d8, 24, () => {
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

  private createMobileActionBtn(x: number, y: number, key: string, label: string, color: number, radius: number, action: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.circle(0, 0, radius, color, 0.88)
      .setStrokeStyle(2.5, 0xffffff);

    const keyTxt = this.add.text(0, -3, key, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: radius > 26 ? '18px' : '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const lblTxt = this.add.text(0, radius > 26 ? 13 : 10, label, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '8px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, keyTxt, lblTxt]);
    container.setSize(radius * 2, radius * 2);
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
    if (this.currentDialogueNodeId && this.dialogueBox.visible) {
      this.renderDialogueBox(this.currentDialogueNodeId);
    }
    if (this.craftingModal.visible) {
      this.renderCraftingModal();
    }
    if (this.questModal.visible) {
      this.renderQuestModal();
    }
    if (this.finaleModal.visible) {
      this.renderFinaleModal();
    }
  }

  private layoutUI(): void {
    const { w, h, isPortrait } = this.getViewport();

    // Layout Top HUD
    if (this.topHeaderBg) {
      const hudH = isPortrait ? 68 : 46;
      this.topHeaderBg.setPosition(w / 2, hudH / 2 + 6).setSize(w - 16, hudH);

      if (isPortrait) {
        // Row 1: Zone left, Progress center, Sound right
        this.zoneText.setPosition(18, 20).setFontSize('12px');
        this.progressBarBg.setPosition(w / 2 - 15, 20).setSize(64, 14);
        this.progressBarFill.setPosition(w / 2 - 47, 20);
        this.progressLabel.setPosition(w / 2 + 22, 20).setFontSize('11px');
        this.soundBtnContainer.setPosition(w - 28, 20);

        // Row 2: Inventory Pills
        this.inventoryContainer.setPosition(18, 48);

        // Mobile uses thumb buttons [Q] and [C]
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
      this.soundBanner.setPosition(w / 2, isPortrait ? 90 : 70);
    }

    if (this.toastContainer) {
      this.toastContainer.setPosition(w / 2, isPortrait ? 95 : 75);
    }

    // Layout Mobile Joystick & Action Buttons
    if (this.joystickBase) {
      const stickX = 65;
      const stickY = h - 75;
      this.joystickBase.setPosition(stickX, stickY);
      if (this.touchKnob) this.touchKnob.setPosition(stickX, stickY);
    }

    if (this.btnE) this.btnE.setPosition(w - 50, h - 75);
    if (this.btnC) this.btnC.setPosition(w - 120, h - 55);
    if (this.btnQ) this.btnQ.setPosition(w - 120, h - 120);
  }
}
