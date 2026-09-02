import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { GameState } from '../systems/GameState';
import { SoundEngine } from '../systems/SoundEngine';
import { SaveSystem } from '../systems/SaveSystem';
import { ZoneId } from '../types/game';

interface WorldItem {
  id: string;
  itemId: string;
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Sprite;
  name: string;
}

interface Portal {
  targetZone: ZoneId;
  x: number;
  y: number;
  name: string;
  sprite: Phaser.GameObjects.Sprite;
}

export class WorldScene extends Phaser.Scene {
  public player!: Player;
  private npcs: NPC[] = [];
  private items: WorldItem[] = [];
  private portals: Portal[] = [];
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private hubUpgrades: Phaser.GameObjects.GameObject[] = [];

  private interactPrompt!: Phaser.GameObjects.Container;
  private promptText!: Phaser.GameObjects.Text;
  private activeInteractable: { type: 'npc' | 'item' | 'portal' | 'workbench'; data: unknown } | null = null;

  private zoneAtmosphereParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private discoLights: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super({ key: 'WorldScene' });
  }

  create(): void {
    const state = GameState.getInstance();

    // Setup Camera and World bounds
    this.physics.world.setBounds(0, 0, 960, 640);
    this.cameras.main.setBounds(0, 0, 960, 640);
    this.updateCameraZoom();
    this.scale.on('resize', this.updateCameraZoom, this);

    this.obstacles = this.physics.add.staticGroup();

    // Check debug URL params
    const params = new URLSearchParams(window.location.search);
    const targetZone = params.get('zone') as ZoneId;
    const demo = params.get('demo');

    if (demo === 'party' || demo === 'finale') {
      state.recruitFriend('olli');
      state.recruitFriend('leander');
      state.recruitFriend('candy');
      state.craftingRecipes.forEach(r => { r.built = true; state.craftedUpgrades.add(r.id); });
    }

    if (targetZone && (targetZone === 'kanal' || targetZone === 'skatehalle' || targetZone === 'autobahn' || targetZone === 'hub')) {
      state.currentZone = targetZone;
    }

    // Build Current Zone
    this.loadZone(state.currentZone);

    // Setup Interaction Prompt UI
    this.setupInteractPrompt();

    // Listen to GameState events
    state.on('upgrade_crafted', () => {
      if (state.currentZone === 'hub') {
        this.renderHubUpgrades();
      }
      SaveSystem.saveGame();
    });

    state.on('friend_recruited', () => {
      this.npcs.forEach(npc => npc.updateQuestIcon());
      SaveSystem.saveGame();
    });

    state.on('birthday_finale', () => {
      this.triggerFinaleCelebration();
    });

    // Keyboard interaction key
    this.input.keyboard?.on('keydown-E', () => this.handleInteraction());
    this.input.keyboard?.on('keydown-SPACE', () => this.handleInteraction());
    this.input.keyboard?.on('keydown-ENTER', () => this.handleInteraction());
  }

  public loadZone(zoneId: ZoneId): void {
    const state = GameState.getInstance();
    state.currentZone = zoneId;

    // Clean up previous zone elements
    this.obstacles.clear(true, true);
    this.npcs.forEach(n => n.destroy());
    this.npcs = [];
    this.items.forEach(i => i.sprite.destroy());
    this.items = [];
    this.portals.forEach(p => p.sprite.destroy());
    this.portals = [];
    this.hubUpgrades.forEach(u => u.destroy());
    this.hubUpgrades = [];
    this.discoLights.forEach(l => l.destroy());
    this.discoLights = [];
    if (this.zoneAtmosphereParticles) {
      this.zoneAtmosphereParticles.destroy();
    }

    // Render background & structures based on zone
    switch (zoneId) {
      case 'hub':
        this.buildHubZone();
        break;
      case 'kanal':
        this.buildKanalZone();
        break;
      case 'skatehalle':
        this.buildSkatehalleZone();
        break;
      case 'autobahn':
        this.buildAutobahnZone();
        break;
    }

    // Create / place player
    if (!this.player) {
      this.player = new Player(this, 480, 340);
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    } else {
      this.player.setPosition(480, 340);
    }

    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.player, this.npcs);

    // Save game on zone entry
    SaveSystem.saveGame();
  }

  // --- 1. HUB ZONE: Valentins Bauwagenplatz ---
  private buildHubZone(): void {
    // Ground: Grass with dirt paths
    for (let x = 0; x < 960; x += 32) {
      for (let y = 0; y < 640; y += 32) {
        const isPath = (x >= 400 && x <= 560) || (y >= 280 && y <= 380);
        this.add.image(x + 16, y + 16, isPath ? 'tile_dirt' : 'tile_grass').setDepth(0);
      }
    }

    // Boundary Fences
    for (let x = 0; x < 960; x += 32) {
      this.addWall(x + 16, 16);
      this.addWall(x + 16, 624);
    }
    for (let y = 32; y < 608; y += 32) {
      this.addWall(16, y + 16);
      this.addWall(944, y + 16);
    }

    // Valentins Bauwagen (Trailer)
    const bauwagen = this.obstacles.create(200, 160, 'prop_bauwagen');
    bauwagen.setDepth(5).refreshBody();

    // Workbench / Crafting Table
    const bench = this.obstacles.create(220, 240, 'tile_wall');
    bench.setTint(0xdaa520).setDepth(5).refreshBody();
    this.add.text(220, 205, '🔨 WERKBANK', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#ffd700',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(12);

    // Portals to the 3 Raves
    this.createPortal(840, 140, 'kanal', '🎧 ZUM KANAL-RAVE\n(Olli)');
    this.createPortal(840, 320, 'skatehalle', '🛹 ZUR SKATEHALLE\n(Leander)');
    this.createPortal(840, 500, 'autobahn', '🍬 ZUR AUTOBAHN-BRÜCKE\n(Candy)');

    // Render Friends if recruited
    const state = GameState.getInstance();
    if (state.isFriendRecruited('olli')) {
      const olliNpc = new NPC(this, 360, 220, 'olli', '🎧 Olli', true);
      this.npcs.push(olliNpc);
    }
    if (state.isFriendRecruited('leander')) {
      const leanderNpc = new NPC(this, 580, 220, 'leander', '🛹 Leander', true);
      this.npcs.push(leanderNpc);
    }
    if (state.isFriendRecruited('candy')) {
      const candyNpc = new NPC(this, 480, 180, 'candy', '🍬 Candy', true);
      this.npcs.push(candyNpc);
    }

    // Spawn Respawning Material nodes
    this.spawnMaterialItem('mat_wood_1', 'wood', 140, 420, 'Holzstapel');
    this.spawnMaterialItem('mat_wood_2', 'wood', 320, 500, 'Bauholz');
    this.spawnMaterialItem('mat_scrap_1', 'scrap', 680, 450, 'Kabelkiste');
    this.spawnMaterialItem('mat_glow_1', 'glowstick', 480, 520, 'Knicklicht-Päckchen');

    // Render built Hub Upgrades
    this.renderHubUpgrades();

    // Ambient floating musical particles
    this.zoneAtmosphereParticles = this.add.particles(0, 0, 'particle_note', {
      x: { min: 100, max: 860 },
      y: { min: 100, max: 540 },
      lifespan: 3000,
      speedY: { min: -20, max: -40 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      frequency: 600
    }).setDepth(20);
  }

  // --- 2. KANAL ZONE (Ollis Rave) ---
  private buildKanalZone(): void {
    // Water at bottom, Grass at top
    for (let x = 0; x < 960; x += 32) {
      for (let y = 0; y < 640; y += 32) {
        if (y >= 440) {
          this.add.image(x + 16, y + 16, 'tile_water').setDepth(0);
        } else {
          this.add.image(x + 16, y + 16, 'tile_grass').setDepth(0);
        }
      }
    }

    // Boundary walls
    for (let x = 0; x < 960; x += 32) {
      this.addWall(x + 16, 16);
      this.addWall(x + 16, 624);
    }
    for (let y = 32; y < 608; y += 32) {
      this.addWall(16, y + 16);
      this.addWall(944, y + 16);
    }

    // Water obstacle border
    for (let x = 0; x < 960; x += 64) {
      const w = this.obstacles.create(x + 32, 440, 'tile_wall');
      w.setVisible(false).refreshBody();
    }

    // Portal back to Hub
    this.createPortal(100, 200, 'hub', '🧌 ZURÜCK ZUM HUB\n(Bauwagenplatz)');

    // Olli NPC (if not already recruited)
    const state = GameState.getInstance();
    if (!state.isFriendRecruited('olli')) {
      const olliNpc = new NPC(this, 480, 220, 'olli', '🎧 Olli (Kanal-DJ)');
      this.npcs.push(olliNpc);

      // DJ Turntables next to Olli
      this.add.image(520, 220, 'prop_dj_booth').setDepth(5);
    }

    // Quest Items to collect
    if (state.getItemCount('vinyl') === 0 && !state.isFriendRecruited('olli')) {
      this.spawnQuestItem('quest_item_vinyl', 'vinyl', 760, 360, 'Ollis Master-Vinyl');
    }
    if (state.getItemCount('audio_cable') === 0 && !state.isFriendRecruited('olli')) {
      this.spawnQuestItem('quest_item_cable', 'audio_cable', 260, 390, 'Gold-Klinkenkabel');
    }

    // Material pickups
    this.spawnMaterialItem('kanal_wood_1', 'wood', 380, 140, 'Treibholz');
    this.spawnMaterialItem('kanal_wood_2', 'wood', 680, 160, 'Holzplanken');
    this.spawnMaterialItem('kanal_scrap_1', 'scrap', 840, 260, 'Alte Lautsprecherkabel');
    this.spawnMaterialItem('kanal_glow_1', 'glowstick', 580, 360, 'Wasserfestes Knicklicht');
  }

  // --- 3. SKATEHALLE ZONE (Leanders Rave) ---
  private buildSkatehalleZone(): void {
    // Concrete floor
    for (let x = 0; x < 960; x += 32) {
      for (let y = 0; y < 640; y += 32) {
        this.add.image(x + 16, y + 16, 'tile_concrete').setDepth(0);
      }
    }

    // Boundaries
    for (let x = 0; x < 960; x += 32) {
      this.addWall(x + 16, 16);
      this.addWall(x + 16, 624);
    }
    for (let y = 32; y < 608; y += 32) {
      this.addWall(16, y + 16);
      this.addWall(944, y + 16);
    }

    // Skate Ramps & Props
    const ramp1 = this.obstacles.create(280, 160, 'prop_skate_ramp');
    ramp1.setDepth(5).refreshBody();

    const ramp2 = this.obstacles.create(680, 160, 'prop_skate_ramp');
    ramp2.setDepth(5).refreshBody();

    // Portal back to Hub
    this.createPortal(100, 320, 'hub', '🧌 ZURÜCK ZUM HUB\n(Bauwagenplatz)');

    // Leander NPC
    const state = GameState.getInstance();
    if (!state.isFriendRecruited('leander')) {
      const leanderNpc = new NPC(this, 480, 280, 'leander', '🛹 Leander (Skater)');
      this.npcs.push(leanderNpc);
    }

    // Quest Items
    if (state.getItemCount('skate_wheels') === 0 && !state.isFriendRecruited('leander')) {
      this.spawnQuestItem('quest_item_wheels', 'skate_wheels', 780, 480, 'High-Speed Rollen');
    }
    if (state.getItemCount('energy_drink') === 0 && !state.isFriendRecruited('leander')) {
      this.spawnQuestItem('quest_item_energy', 'energy_drink', 240, 480, 'Goblin-Energy Dose');
    }

    // Materials
    this.spawnMaterialItem('skate_wood_1', 'wood', 380, 450, 'Skate-Sperrholz');
    this.spawnMaterialItem('skate_scrap_1', 'scrap', 580, 490, 'Kugellager & Schrauben');
    this.spawnMaterialItem('skate_glow_1', 'glowstick', 820, 220, 'Neon-Griptape-Licht');
  }

  // --- 4. AUTOBAHNBRÜCKE ZONE (Candys Rave) ---
  private buildAutobahnZone(): void {
    // Dark Asphalt floor
    for (let x = 0; x < 960; x += 32) {
      for (let y = 0; y < 640; y += 32) {
        this.add.image(x + 16, y + 16, 'tile_asphalt').setDepth(0);
      }
    }

    // Boundaries
    for (let x = 0; x < 960; x += 32) {
      this.addWall(x + 16, 16);
      this.addWall(x + 16, 624);
    }
    for (let y = 32; y < 608; y += 32) {
      this.addWall(16, y + 16);
      this.addWall(944, y + 16);
    }

    // Massive Highway Concrete Pillars (Obstacles)
    const p1 = this.obstacles.create(300, 200, 'tile_concrete');
    p1.setScale(2.5, 4).setTint(0x22222b).setDepth(5).refreshBody();

    const p2 = this.obstacles.create(660, 200, 'tile_concrete');
    p2.setScale(2.5, 4).setTint(0x22222b).setDepth(5).refreshBody();

    // Portal back to Hub
    this.createPortal(100, 320, 'hub', '🧌 ZURÜCK ZUM HUB\n(Bauwagenplatz)');

    // Candy NPC
    const state = GameState.getInstance();
    if (!state.isFriendRecruited('candy')) {
      const candyNpc = new NPC(this, 480, 260, 'candy', '🍬 Candy (Glow-Queen)');
      this.npcs.push(candyNpc);
    }

    // Strobe & Laser Lights
    for (let i = 0; i < 4; i++) {
      const light = this.add.circle(200 + i * 180, 100, 40, 0xff00ea, 0.25).setDepth(1);
      this.tweens.add({
        targets: light,
        alpha: { from: 0.1, to: 0.6 },
        scale: { from: 0.8, to: 1.3 },
        duration: 400 + i * 150,
        yoyo: true,
        repeat: -1
      });
      this.discoLights.push(light);
    }

    // Quest Items
    if (state.getItemCount('fog_plug') === 0 && !state.isFriendRecruited('candy')) {
      this.spawnQuestItem('quest_item_plug', 'fog_plug', 300, 480, 'Nebel-Zündkerze');
    }
    if (state.getItemCount('glow_syrup') === 0 && !state.isFriendRecruited('candy')) {
      this.spawnQuestItem('quest_item_syrup', 'glow_syrup', 660, 480, 'Glitzer-Sirup');
    }

    // Materials
    this.spawnMaterialItem('auto_glow_1', 'glowstick', 480, 440, 'Mega-Knicklicht');
    this.spawnMaterialItem('auto_glow_2', 'glowstick', 800, 220, 'Neon-Armband');
    this.spawnMaterialItem('auto_scrap_1', 'scrap', 200, 480, 'Nebelwerfer-Schrott');
    this.spawnMaterialItem('auto_wood_1', 'wood', 760, 440, 'Paletten-Holz');

    // Fog particles
    this.zoneAtmosphereParticles = this.add.particles(0, 0, 'particle_sparkle', {
      x: { min: 100, max: 860 },
      y: { min: 100, max: 540 },
      lifespan: 2500,
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.5, end: 0 },
      frequency: 250
    }).setDepth(20);
  }

  // --- Render Hub Upgrades dynamically ---
  private renderHubUpgrades(): void {
    const state = GameState.getInstance();

    // 1. String Lights (Deko)
    if (state.craftedUpgrades.has('upgrade_lights')) {
      const lights1 = this.add.image(360, 100, 'prop_string_lights').setDepth(15);
      const lights2 = this.add.image(580, 100, 'prop_string_lights').setDepth(15);
      this.hubUpgrades.push(lights1, lights2);
    }

    // 2. DJ Booth & Speakers (Sound Upgrade)
    if (state.craftedUpgrades.has('upgrade_sound')) {
      const dj = this.add.image(360, 260, 'prop_dj_booth').setDepth(6);
      const spk1 = this.add.image(300, 250, 'prop_speakers').setDepth(6);
      const spk2 = this.add.image(420, 250, 'prop_speakers').setDepth(6);
      this.hubUpgrades.push(dj, spk1, spk2);
    }

    // 3. Skate Lounge & Ramp (Activity Upgrade)
    if (state.craftedUpgrades.has('upgrade_chill')) {
      const ramp = this.add.image(620, 260, 'prop_skate_ramp').setDepth(6);
      this.hubUpgrades.push(ramp);
    }

    // 4. Glow Drink Bar (Drinks Upgrade)
    if (state.craftedUpgrades.has('upgrade_bar')) {
      const bar = this.add.image(480, 230, 'prop_drink_bar').setDepth(6);
      this.hubUpgrades.push(bar);
    }

    // 5. Giant Birthday Cake (Finale)
    if (state.craftedUpgrades.has('upgrade_cake')) {
      const cake = this.add.image(480, 360, 'prop_birthday_cake').setDepth(7);
      this.hubUpgrades.push(cake);
    }
  }

  private addWall(x: number, y: number): void {
    const wall = this.obstacles.create(x, y, 'tile_wall');
    wall.setDepth(2).refreshBody();
  }

  private createPortal(x: number, y: number, targetZone: ZoneId, name: string): void {
    const sprite = this.add.sprite(x, y, 'prop_portal').setDepth(4);
    
    // Label
    const text = this.add.text(x, y - 36, name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#00ffcc',
      align: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(12);

    this.portals.push({ targetZone, x, y, name, sprite });
    this.hubUpgrades.push(text);
  }

  private spawnMaterialItem(id: string, itemId: string, x: number, y: number, name: string): void {
    const state = GameState.getInstance();
    const itemData = state.inventory.get(itemId);
    const texture = itemData ? itemData.iconTexture : 'item_wood';

    const sprite = this.add.sprite(x, y, texture).setDepth(3);

    // Cute floating tween
    this.tweens.add({
      targets: sprite,
      y: y - 4,
      duration: 1000 + Math.random() * 500,
      yoyo: true,
      repeat: -1
    });

    this.items.push({ id, itemId, x, y, sprite, name });
  }

  private spawnQuestItem(id: string, itemId: string, x: number, y: number, name: string): void {
    const state = GameState.getInstance();
    if (state.collectedItemIds.has(id)) return;

    const itemData = state.inventory.get(itemId);
    const texture = itemData ? itemData.iconTexture : 'item_vinyl';

    const sprite = this.add.sprite(x, y, texture).setDepth(3);
    
    // Golden pulse glow
    this.tweens.add({
      targets: sprite,
      scale: 1.25,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    this.items.push({ id, itemId, x, y, sprite, name });
  }

  private setupInteractPrompt(): void {
    this.interactPrompt = this.add.container(0, 0).setDepth(100).setVisible(false);
    
    const bg = this.add.rectangle(0, 0, 160, 26, 0x111118, 0.85);
    bg.setStrokeStyle(1.5, 0xff007f);

    this.promptText = this.add.text(0, 0, '[E] Interagieren', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.interactPrompt.add([bg, this.promptText]);
  }

  update(time: number, delta: number): void {
    if (this.player) {
      this.player.update(time, delta);
    }
    this.npcs.forEach(n => n.update(time, delta));

    this.checkNearbyInteractables();
  }

  private checkNearbyInteractables(): void {
    if (!this.player) return;
    const px = this.player.x;
    const py = this.player.y;
    const interactDist = 48;

    this.activeInteractable = null;

    // 1. Check Workbench (in Hub)
    if (GameState.getInstance().currentZone === 'hub' && Phaser.Math.Distance.Between(px, py, 220, 240) < interactDist) {
      this.activeInteractable = { type: 'workbench', data: null };
      this.showPrompt(220, 210, '[E] Werkbank öffnen');
      return;
    }

    // 2. Check NPCs
    for (const npc of this.npcs) {
      if (Phaser.Math.Distance.Between(px, py, npc.x, npc.y) < interactDist) {
        this.activeInteractable = { type: 'npc', data: npc };
        this.showPrompt(npc.x, npc.y - 42, `[E] Mit ${npc.displayName} sprechen`);
        return;
      }
    }

    // 3. Check Pickable Items
    for (const item of this.items) {
      if (Phaser.Math.Distance.Between(px, py, item.x, item.y) < interactDist) {
        this.activeInteractable = { type: 'item', data: item };
        this.showPrompt(item.x, item.y - 20, `[E] ${item.name} aufsammeln`);
        return;
      }
    }

    // 4. Check Portals
    for (const portal of this.portals) {
      if (Phaser.Math.Distance.Between(px, py, portal.x, portal.y) < interactDist + 10) {
        this.activeInteractable = { type: 'portal', data: portal };
        this.showPrompt(portal.x, portal.y - 48, `[E] Teleportieren`);
        return;
      }
    }

    this.interactPrompt.setVisible(false);
  }

  private showPrompt(x: number, y: number, text: string): void {
    this.interactPrompt.setPosition(x, y).setVisible(true);
    this.promptText.setText(text);
  }

  public handleInteraction(): void {
    if (!this.activeInteractable) return;

    const state = GameState.getInstance();
    const uiScene = this.scene.get('UIScene') as unknown as {
      openDialogue: (dialogueId: string) => void;
      openCraftingMenu: () => void;
      showToast: (msg: string) => void;
    };

    switch (this.activeInteractable.type) {
      case 'workbench':
        uiScene.openCraftingMenu();
        break;

      case 'npc': {
        const npc = this.activeInteractable.data as NPC;
        SoundEngine.getInstance().playTalk();

        if (state.isFriendRecruited(npc.friendId)) {
          uiScene.openDialogue(`${npc.friendId}_hub`);
        } else {
          const quest = state.quests.get(`quest_${npc.friendId}`);
          if (quest && quest.steps[0].isCompleted && quest.steps[1].isCompleted) {
            uiScene.openDialogue(`${npc.friendId}_complete`);
          } else {
            uiScene.openDialogue(`${npc.friendId}_intro`);
          }
        }
        break;
      }

      case 'item': {
        const worldItem = this.activeInteractable.data as WorldItem;
        const isMaterial = ['wood', 'scrap', 'glowstick'].includes(worldItem.itemId);
        const amount = isMaterial ? 2 : 1;
        
        state.addItem(worldItem.itemId, amount);
        if (!isMaterial) {
          state.collectedItemIds.add(worldItem.id);
        }

        // Particle sparkle on collect
        this.add.particles(worldItem.x, worldItem.y, 'particle_sparkle', {
          lifespan: 600,
          speed: { min: 30, max: 80 },
          scale: { start: 1.2, end: 0 },
          quantity: 10
        });

        // Floating text above player
        const floatTxt = this.add.text(this.player.x, this.player.y - 20, `+${amount} ${worldItem.name}`, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '13px',
          color: isMaterial ? '#ffd700' : '#00ffcc',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(150);

        this.tweens.add({
          targets: floatTxt,
          y: floatTxt.y - 30,
          alpha: 0,
          duration: 1200,
          onComplete: () => floatTxt.destroy()
        });

        // Remove item from scene list
        worldItem.sprite.destroy();
        this.items = this.items.filter(i => i !== worldItem);
        this.interactPrompt.setVisible(false);
        this.activeInteractable = null;

        // If material, schedule respawn after 8 seconds
        if (isMaterial) {
          this.time.delayedCall(8000, () => {
            if (state.currentZone === this.zoneIdFromScene()) {
              this.spawnMaterialItem(worldItem.id, worldItem.itemId, worldItem.x, worldItem.y, worldItem.name);
            }
          });
        }

        uiScene.showToast(`+${amount} ${worldItem.name} gesammelt!`);
        break;
      }

      case 'portal': {
        const portal = this.activeInteractable.data as Portal;
        SoundEngine.getInstance().playWarp();

        // Fade transition
        this.cameras.main.fade(250, 15, 10, 25, false, (_cam: unknown, progress: number) => {
          if (progress === 1) {
            this.loadZone(portal.targetZone);
            this.cameras.main.fadeIn(250, 15, 10, 25);
          }
        });
        break;
      }
    }
  }

  private updateCameraZoom(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    if (w < 850 || h < 650) {
      this.cameras.main.setZoom(1.35);
    } else {
      this.cameras.main.setZoom(1.0);
    }
  }

  private zoneIdFromScene(): ZoneId {
    return GameState.getInstance().currentZone;
  }

  public triggerFinaleCelebration(): void {
    if (this.player) {
      this.player.isDancing = true;
    }

    // Confetti Fireworks in Hub
    this.add.particles(480, 200, 'particle_confetti', {
      lifespan: 3000,
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      gravityY: 150,
      scale: { start: 1.5, end: 0.5 },
      quantity: 15,
      frequency: 200
    }).setDepth(50);
  }
}
