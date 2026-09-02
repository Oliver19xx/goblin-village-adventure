export type ZoneId = 'hub' | 'kanal' | 'skatehalle' | 'autobahn';

export interface Item {
  id: string;
  name: string;
  description: string;
  category: 'material' | 'quest' | 'special';
  iconTexture: string;
  count: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'decoration' | 'sound' | 'drinks' | 'activity' | 'finale';
  costs: { itemId: string; amount: number }[];
  built: boolean;
  requiredFriendId?: string;
  unlockText: string;
}

export interface QuestStep {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  friendId: string;
  description: string;
  steps: QuestStep[];
  isCompleted: boolean;
  rewardText: string;
}

export interface DialogueNode {
  id: string;
  speaker: 'valentin' | 'olli' | 'leander' | 'candy' | 'narrator';
  speakerName: string;
  text: string;
  options?: {
    label: string;
    nextNodeId?: string;
    action?: string;
  }[];
}

export interface SaveData {
  version: number;
  playerName: string;
  currentZone: ZoneId;
  inventory: { id: string; count: number }[];
  recruitedFriends: { [friendId: string]: boolean };
  craftedUpgrades: { [recipeId: string]: boolean };
  completedQuests: { [questId: string]: boolean };
  pickedItems: { [itemId: string]: boolean };
  birthdayFinaleTriggered: boolean;
  isCakeBaked?: boolean;
  isCakePlaced?: boolean;
}
