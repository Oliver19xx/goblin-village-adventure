import Phaser from 'phaser';
import { Item, ZoneId, CraftingRecipe, Quest } from '../types/game';
import { SoundEngine } from './SoundEngine';

export class GameState extends Phaser.Events.EventEmitter {
  private static instance: GameState;

  public currentZone: ZoneId = 'hub';
  public inventory: Map<string, Item> = new Map();
  public recruitedFriends: Set<string> = new Set();
  public craftedUpgrades: Set<string> = new Set();
  public collectedItemIds: Set<string> = new Set();
  public completedQuests: Set<string> = new Set();
  public birthdayFinaleActive: boolean = false;
  public isCakeBaked: boolean = false;
  public isCakePlaced: boolean = false;

  public quests: Map<string, Quest> = new Map();
  public craftingRecipes: CraftingRecipe[] = [];

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  private constructor() {
    super();
    this.initDefaultItems();
    this.initQuests();
    this.initCraftingRecipes();
  }

  private initDefaultItems(): void {
    const itemCatalog: Item[] = [
      { id: 'wood', name: 'Bauholz-Balken', description: 'Stabile Bretter für Boxen, Bar & Möbel.', category: 'material', iconTexture: 'item_wood', count: 0 },
      { id: 'scrap', name: 'Elektronik-Kabel', description: 'Geflochtene Kabel & Platinen für die Soundanlage.', category: 'material', iconTexture: 'item_scrap', count: 0 },
      { id: 'glowstick', name: 'Neon-Knicklicht', description: 'Leuchtet giftgrün und pink im Dunkeln!', category: 'material', iconTexture: 'item_glowstick', count: 0 },
      { id: 'vinyl', name: 'Ollis Master-Vinyl', description: 'Die legendäre 180g Rave-Platte mit dem perfekten Beat.', category: 'quest', iconTexture: 'item_vinyl', count: 0 },
      { id: 'audio_cable', name: 'Gold-Klinkenkabel', description: 'Vergoldetes 6.3mm Kabel für kristallklaren Sound.', category: 'quest', iconTexture: 'item_audio_cable', count: 0 },
      { id: 'skate_wheels', name: 'High-Speed Rollen', description: 'Keramik-Kugellager für 360-Flips in der Halfpipe.', category: 'quest', iconTexture: 'item_skate_wheels', count: 0 },
      { id: 'energy_drink', name: 'Goblin-Energy Dose', description: 'Schmeckt nach grünen Äpfeln & reinem Adrenalin.', category: 'quest', iconTexture: 'item_energy_drink', count: 0 },
      { id: 'glow_syrup', name: 'Glitzer-Sirup', description: 'Candys Geheimzutat für den leuchtenden Geburtstagspunch.', category: 'quest', iconTexture: 'item_glow_syrup', count: 0 },
      { id: 'fog_plug', name: 'Nebelmaschinen-Zündkerze', description: 'Bringt die Nebelwerfer wieder auf 100% Dampf.', category: 'quest', iconTexture: 'item_fog_plug', count: 0 },
    ];

    itemCatalog.forEach(item => this.inventory.set(item.id, { ...item }));
  }

  private initQuests(): void {
    this.quests.set('quest_olli', {
      id: 'quest_olli',
      friendId: 'olli',
      title: 'Ollis Kanal-Bass-Rettung',
      description: 'Finde Ollis vergoldetes Klinkenkabel und seine Master-Vinyl am Kanal-Ufer, damit er zum Bauwagenplatz kommen kann.',
      steps: [
        { id: 'cable', text: 'Gold-Klinkenkabel im Schilf finden', isCompleted: false },
        { id: 'vinyl', text: 'Master-Vinyl aus dem Bootwrack bergen', isCompleted: false },
        { id: 'return', text: 'Sprich wieder mit Olli am Kanal', isCompleted: false }
      ],
      isCompleted: false,
      rewardText: 'Olli kommt zu Valentins Party und baut den Bass auf!'
    });

    this.quests.set('quest_leander', {
      id: 'quest_leander',
      friendId: 'leander',
      title: 'Leanders Skatehallen-Tuning',
      description: 'Leander kann ohne neue Skateboard-Rollen und eine Dose Goblin-Energy die Skatehalle nicht verlassen.',
      steps: [
        { id: 'wheels', text: 'High-Speed Rollen in der Werkstatt finden', isCompleted: false },
        { id: 'energy', text: 'Goblin-Energy Drink im Snack-Automaten finden', isCompleted: false },
        { id: 'return', text: 'Sprich wieder mit Leander in der Skatehalle', isCompleted: false }
      ],
      isCompleted: false,
      rewardText: 'Leander feiert mit und bringt Skate-Vibes auf den Bauwagenplatz!'
    });

    this.quests.set('quest_candy', {
      id: 'quest_candy',
      friendId: 'candy',
      title: 'Candys Neon-Glow-Explosion',
      description: 'Unter der Autobahnbrücke braucht Candy Glitzer-Sirup und eine Nebel-Zündkerze für den perfekten Rave.',
      steps: [
        { id: 'plug', text: 'Nebelmaschinen-Zündkerze hinter den Pfeilern finden', isCompleted: false },
        { id: 'syrup', text: 'Glitzer-Sirup am Rave-Tresen einsammeln', isCompleted: false },
        { id: 'return', text: 'Sprich wieder mit Candy unter der Brücke', isCompleted: false }
      ],
      isCompleted: false,
      rewardText: 'Candy bringt die Lichterketten, Laser & die Bar zu Valentin!'
    });

    this.quests.set('quest_finale', {
      id: 'quest_finale',
      friendId: 'valentin',
      title: '🎂 Das Große Geburtstags-Finale',
      description: 'Versammle alle Freunde, backe den Geburtstagskuchen und platziere ihn auf dem Tisch in der Mitte!',
      steps: [
        { id: 'friends', text: 'Alle 3 Freunde (Olli, Leander, Candy) zur Party holen', isCompleted: false },
        { id: 'bake_cake', text: 'Geburtstagskuchen an der Werkbank backen', isCompleted: false },
        { id: 'place_cake', text: 'Kuchen auf dem Tisch in der Mitte platzieren', isCompleted: false }
      ],
      isCompleted: false,
      rewardText: 'Die Party des Jahrhunderts ist eröffnet! Happy Birthday, Valentin!'
    });
  }

  private initCraftingRecipes(): void {
    this.craftingRecipes = [
      {
        id: 'upgrade_lights',
        name: 'Bunte Lichterketten & Discokugel',
        description: 'Tausende glitzernde Lämpchen. Braucht Candy für die Neon-Lichtshow.',
        icon: 'prop_string_lights',
        category: 'decoration',
        costs: [
          { itemId: 'scrap', amount: 3 },
          { itemId: 'glowstick', amount: 3 }
        ],
        requiredFriendId: 'candy',
        built: false,
        unlockText: 'Die Party-Lichterketten strahlen jetzt in vollem Glanz!'
      },
      {
        id: 'upgrade_sound',
        name: 'DJ-Pult & Mega-Subwoofer Stack',
        description: 'Wird freigeschaltet, sobald Olli gerettet ist. Bringt druckvollen Bass!',
        icon: 'prop_dj_booth',
        category: 'sound',
        costs: [
          { itemId: 'wood', amount: 4 },
          { itemId: 'scrap', amount: 4 }
        ],
        requiredFriendId: 'olli',
        built: false,
        unlockText: 'Das DJ-Pult steht! Olli lässt die Bässe wummern!'
      },
      {
        id: 'upgrade_chill',
        name: 'Skater-Lounge & Mini-Ramp',
        description: 'Wird freigeschaltet, wenn Leander gerettet ist. Gemütliche Sofas & Rampen.',
        icon: 'prop_skate_ramp',
        category: 'activity',
        costs: [
          { itemId: 'wood', amount: 5 },
          { itemId: 'scrap', amount: 2 }
        ],
        requiredFriendId: 'leander',
        built: false,
        unlockText: 'Die Skater-Lounge ist fertig! Leander zeigt fette Tricks!'
      },
      {
        id: 'upgrade_bar',
        name: 'Glow-Drink-Bar & Zauberpunch',
        description: 'Wird freigeschaltet, sobald Candy gerettet ist. Bunte Neon-Drinks für alle!',
        icon: 'prop_drink_bar',
        category: 'drinks',
        costs: [
          { itemId: 'wood', amount: 3 },
          { itemId: 'glowstick', amount: 4 }
        ],
        requiredFriendId: 'candy',
        built: false,
        unlockText: 'Candys Glow-Bar ist eröffnet! Der Glitzer-Punch perlt!'
      },
      {
        id: 'upgrade_cake',
        name: 'Der Gigantische Geburtstagskuchen 🎂',
        description: 'Das krönende Meisterwerk für Valentins Geburtstag! Wird freigeschaltet, wenn Olli, Leander & Candy da sind.',
        icon: 'prop_birthday_cake',
        category: 'finale',
        costs: [
          { itemId: 'wood', amount: 4 },
          { itemId: 'scrap', amount: 3 },
          { itemId: 'glowstick', amount: 4 }
        ],
        requiresAllFriends: true,
        built: false,
        unlockText: '🎂 Kuchen erfolgreich gebacken! Bringe ihn zum Partytisch in die Mitte!'
      }
    ];
  }

  public addItem(itemId: string, amount: number = 1): void {
    const item = this.inventory.get(itemId);
    if (item) {
      item.count += amount;
      this.emit('inventory_changed');
      SoundEngine.getInstance().playPickup();
      this.checkQuestItemUpdates();
    }
  }

  public removeItem(itemId: string, amount: number = 1): boolean {
    const item = this.inventory.get(itemId);
    if (item && item.count >= amount) {
      item.count -= amount;
      this.emit('inventory_changed');
      return true;
    }
    return false;
  }

  public getItemCount(itemId: string): number {
    return this.inventory.get(itemId)?.count ?? 0;
  }

  public recruitFriend(friendId: string): void {
    this.recruitedFriends.add(friendId);
    
    // Update music layering
    if (friendId === 'olli') SoundEngine.getInstance().enableBass = true;
    if (friendId === 'leander') SoundEngine.getInstance().enableLead = true;
    if (friendId === 'candy') SoundEngine.getInstance().enableArp = true;

    // Check Finale Quest Step 1 (All 3 friends recruited)
    const finaleQuest = this.quests.get('quest_finale');
    if (finaleQuest && this.recruitedFriends.size >= 3) {
      finaleQuest.steps[0].isCompleted = true;
    }

    this.emit('friend_recruited', friendId);
    this.emit('quest_updated');
  }

  public isFriendRecruited(friendId: string): boolean {
    return this.recruitedFriends.has(friendId);
  }

  public craftUpgrade(recipeId: string): boolean {
    const recipe = this.craftingRecipes.find(r => r.id === recipeId);
    if (!recipe || recipe.built) return false;

    // Check all friends requirement (for Birthday Cake)
    if (recipe.requiresAllFriends && this.recruitedFriends.size < 3) {
      return false;
    }

    // Check specific friend requirement
    if (recipe.requiredFriendId && !this.isFriendRecruited(recipe.requiredFriendId)) {
      return false;
    }

    // Check costs
    for (const cost of recipe.costs) {
      if (this.getItemCount(cost.itemId) < cost.amount) {
        return false;
      }
    }

    // Deduct
    for (const cost of recipe.costs) {
      this.removeItem(cost.itemId, cost.amount);
    }

    recipe.built = true;
    this.craftedUpgrades.add(recipeId);
    SoundEngine.getInstance().playCraft();

    if (recipeId === 'upgrade_cake') {
      this.isCakeBaked = true;
      const finaleQuest = this.quests.get('quest_finale');
      if (finaleQuest) {
        finaleQuest.steps[1].isCompleted = true;
      }
      this.emit('cake_baked');
      this.emit('quest_updated');
    }

    this.emit('upgrade_crafted', recipe);
    return true;
  }

  public placeCake(): boolean {
    if (!this.isCakeBaked || this.isCakePlaced) return false;
    this.isCakePlaced = true;

    const finaleQuest = this.quests.get('quest_finale');
    if (finaleQuest) {
      finaleQuest.steps[2].isCompleted = true;
      finaleQuest.isCompleted = true;
      this.completedQuests.add('quest_finale');
    }

    this.triggerBirthdayFinale();
    this.emit('cake_placed');
    this.emit('quest_updated');
    return true;
  }

  public checkQuestItemUpdates(): void {
    // Check Olli's Quest
    const olliQuest = this.quests.get('quest_olli');
    if (olliQuest && !olliQuest.isCompleted) {
      if (this.getItemCount('audio_cable') > 0) olliQuest.steps[0].isCompleted = true;
      if (this.getItemCount('vinyl') > 0) olliQuest.steps[1].isCompleted = true;
      if (olliQuest.steps[0].isCompleted && olliQuest.steps[1].isCompleted) {
        olliQuest.steps[2].isCompleted = true;
      }
    }

    // Check Leander's Quest
    const leanderQuest = this.quests.get('quest_leander');
    if (leanderQuest && !leanderQuest.isCompleted) {
      if (this.getItemCount('skate_wheels') > 0) leanderQuest.steps[0].isCompleted = true;
      if (this.getItemCount('energy_drink') > 0) leanderQuest.steps[1].isCompleted = true;
      if (leanderQuest.steps[0].isCompleted && leanderQuest.steps[1].isCompleted) {
        leanderQuest.steps[2].isCompleted = true;
      }
    }

    // Check Candy's Quest
    const candyQuest = this.quests.get('quest_candy');
    if (candyQuest && !candyQuest.isCompleted) {
      if (this.getItemCount('fog_plug') > 0) candyQuest.steps[0].isCompleted = true;
      if (this.getItemCount('glow_syrup') > 0) candyQuest.steps[1].isCompleted = true;
      if (candyQuest.steps[0].isCompleted && candyQuest.steps[1].isCompleted) {
        candyQuest.steps[2].isCompleted = true;
      }
    }

    // Check Finale Quest
    const finaleQuest = this.quests.get('quest_finale');
    if (finaleQuest) {
      if (this.recruitedFriends.size >= 3) finaleQuest.steps[0].isCompleted = true;
      if (this.isCakeBaked) finaleQuest.steps[1].isCompleted = true;
      if (this.isCakePlaced) {
        finaleQuest.steps[2].isCompleted = true;
        finaleQuest.isCompleted = true;
      }
    }

    this.emit('quest_updated');
  }

  public getPartyProgress(): number {
    // 3 friends (20% each = 60%) + 4 upgrades (7.5% each = 30%) + cake baked (5%) + cake placed (5%) = 100%
    let progress = 0;
    progress += this.recruitedFriends.size * 20;

    const baseUpgrades = ['upgrade_lights', 'upgrade_sound', 'upgrade_chill', 'upgrade_bar'];
    baseUpgrades.forEach(u => {
      if (this.craftedUpgrades.has(u)) progress += 7.5;
    });

    if (this.isCakeBaked) progress += 5;
    if (this.isCakePlaced) progress += 5;

    return Math.min(100, Math.round(progress));
  }

  public triggerBirthdayFinale(): void {
    this.birthdayFinaleActive = true;
    SoundEngine.getInstance().enableFinale = true;
    SoundEngine.getInstance().playBirthdayFanfare();
    this.emit('birthday_finale');
  }

  public resetGame(): void {
    this.inventory.clear();
    this.recruitedFriends.clear();
    this.craftedUpgrades.clear();
    this.collectedItemIds.clear();
    this.completedQuests.clear();
    this.birthdayFinaleActive = false;
    this.isCakeBaked = false;
    this.isCakePlaced = false;
    SoundEngine.getInstance().enableBass = false;
    SoundEngine.getInstance().enableLead = false;
    SoundEngine.getInstance().enableArp = false;
    SoundEngine.getInstance().enableFinale = false;
    
    this.initDefaultItems();
    this.initQuests();
    this.initCraftingRecipes();
    this.currentZone = 'hub';
    this.emit('game_reset');
  }
}
