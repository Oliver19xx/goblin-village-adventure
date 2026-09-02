import { GameState } from './GameState';
import { SaveData } from '../types/game';

const SAVE_KEY = 'valentin_goblin_party_save_v1';

export class SaveSystem {
  public static saveGame(): void {
    const state = GameState.getInstance();
    const invArray: { id: string; count: number }[] = [];
    state.inventory.forEach(item => {
      if (item.count > 0) {
        invArray.push({ id: item.id, count: item.count });
      }
    });

    const friendsObj: { [k: string]: boolean } = {};
    state.recruitedFriends.forEach(f => { friendsObj[f] = true; });

    const upgradesObj: { [k: string]: boolean } = {};
    state.craftedUpgrades.forEach(u => { upgradesObj[u] = true; });

    const questsObj: { [k: string]: boolean } = {};
    state.quests.forEach(q => { questsObj[q.id] = q.isCompleted; });

    const itemsObj: { [k: string]: boolean } = {};
    state.collectedItemIds.forEach(i => { itemsObj[i] = true; });

    const data: SaveData = {
      version: 1,
      playerName: 'Valentin',
      currentZone: state.currentZone,
      inventory: invArray,
      recruitedFriends: friendsObj,
      craftedUpgrades: upgradesObj,
      completedQuests: questsObj,
      pickedItems: itemsObj,
      birthdayFinaleTriggered: state.birthdayFinaleActive,
      isCakeBaked: state.isCakeBaked,
      isCakePlaced: state.isCakePlaced
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  public static loadGame(): boolean {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;

    try {
      const data: SaveData = JSON.parse(raw);
      const state = GameState.getInstance();

      state.currentZone = data.currentZone || 'hub';

      // Restore items
      if (data.inventory) {
        data.inventory.forEach(entry => {
          const item = state.inventory.get(entry.id);
          if (item) item.count = entry.count;
        });
      }

      // Restore friends
      if (data.recruitedFriends) {
        Object.keys(data.recruitedFriends).forEach(fid => {
          if (data.recruitedFriends[fid]) state.recruitFriend(fid);
        });
      }

      // Restore upgrades
      if (data.craftedUpgrades) {
        Object.keys(data.craftedUpgrades).forEach(uid => {
          if (data.craftedUpgrades[uid]) {
            state.craftedUpgrades.add(uid);
            const r = state.craftingRecipes.find(cr => cr.id === uid);
            if (r) r.built = true;
          }
        });
      }

      // Restore quests
      if (data.completedQuests) {
        Object.keys(data.completedQuests).forEach(qid => {
          const q = state.quests.get(qid);
          if (q) {
            q.isCompleted = data.completedQuests[qid];
            q.steps.forEach(s => { s.isCompleted = true; });
          }
        });
      }

      // Restore picked items
      if (data.pickedItems) {
        Object.keys(data.pickedItems).forEach(iid => {
          if (data.pickedItems[iid]) state.collectedItemIds.add(iid);
        });
      }

      if (data.birthdayFinaleTriggered) {
        state.birthdayFinaleActive = true;
      }

      state.isCakeBaked = !!data.isCakeBaked;
      state.isCakePlaced = !!data.isCakePlaced;

      state.emit('inventory_changed');
      state.emit('quest_updated');
      return true;
    } catch (e) {
      console.error('Failed to load savegame:', e);
      return false;
    }
  }

  public static exportJSON(): void {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valentins_geburtstag_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public static importJSON(file: File, callback: (success: boolean) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        JSON.parse(text); // validate
        localStorage.setItem(SAVE_KEY, text);
        this.loadGame();
        callback(true);
      } catch {
        callback(false);
      }
    };
    reader.readAsText(file);
  }
}
