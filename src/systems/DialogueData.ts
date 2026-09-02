import { DialogueNode } from '../types/game';

export const DIALOGUES: { [key: string]: DialogueNode } = {
  // --- OLLI (DJ am Kanal) ---
  olli_intro: {
    id: 'olli_intro',
    speaker: 'olli',
    speakerName: '🎧 Olli (Kanal-DJ)',
    text: 'Yo Valentin! ALLES GUTE ZUM GEBURTSTAG, Bro! 🎂 Ich wollte längst bei dir sein, aber mein Set ist gecrasht: Mein vergoldetes Klinkenkabel und meine Master-Vinyl sind ins Schilf gefallen! Ohne die gibt es keinen Rave... Kannst du sie suchen?',
    options: [
      { label: 'Klar Olli! Ich find dein Zeug im Schilf!', nextNodeId: 'olli_accept' },
      { label: 'Was macht die Vinyl so besonders?', nextNodeId: 'olli_lore' }
    ]
  },
  olli_lore: {
    id: 'olli_lore',
    speaker: 'olli',
    speakerName: '🎧 Olli (Kanal-DJ)',
    text: 'Das ist eine 180g Sonderpressung mit den tiefsten Goblin-Subbässen der Welt! Wenn die läuft, vibrieren sogar die Enten im Kanal im 4/4-Takt!',
    options: [
      { label: 'Alles klar, ich hole sie!', nextNodeId: 'olli_accept' }
    ]
  },
  olli_accept: {
    id: 'olli_accept',
    speaker: 'olli',
    speakerName: '🎧 Olli (Kanal-DJ)',
    text: 'Ehren-Goblin! Such am Ufer und beim alten Bootwrack. Sobald wir alles haben, packe ich mein Pult und die Boxen ein und wir starten den Sound auf deinem Bauwagenplatz!',
    options: [
      { label: 'Bin schon unterwegs!', action: 'close' }
    ]
  },
  olli_waiting: {
    id: 'olli_waiting',
    speaker: 'olli',
    speakerName: '🎧 Olli (Kanal-DJ)',
    text: 'Hast du das Goldkabel und die Vinyl schon gefunden? Schau mal links im dichten Schilf und beim alten Holzkahn!',
    options: [
      { label: 'Ich suche weiter!', action: 'close' }
    ]
  },
  olli_complete: {
    id: 'olli_complete',
    speaker: 'olli',
    speakerName: '🎧 Olli (Kanal-DJ)',
    text: 'JAAAAA! Da ist die Platte! Und das Goldkabel glänzt wie neu! Valentin, du bist eine absolute Legende! Ich schnapp mir mein Equipment und düse rüber zum Bauwagenplatz. Lass uns die Bässe aufdrehen!',
    options: [
      { label: 'Geil! Wir sehen uns am Hub!', action: 'recruit_olli' }
    ]
  },
  olli_hub: {
    id: 'olli_hub',
    speaker: 'olli',
    speakerName: '🎧 Olli (Kanal-DJ)',
    text: 'BOOM! Der Bass drückt richtig im Magen! Valentin, bester Geburtstag ever! Wenn du an deiner Werkbank das DJ-Pult baust, schieb ich die Regler bis zum Anschlag!',
    options: [
      { label: 'Feier weiter, Olli!', action: 'close' }
    ]
  },

  // --- LEANDER (Skater in der Skatehalle) ---
  leander_intro: {
    id: 'leander_intro',
    speaker: 'leander',
    speakerName: '🛹 Leander (Skater-Goblin)',
    text: 'Yo Valentin! HAPPY BIRTHDAY, mein Bester! 🎉 Ich wollte gerade ' + 'nen 540-Kickflip über die Quarterpipe landen, da sind mir die Kugellager zerfetzt! Und mein eigener Akku ist auch leer... Ich brauch High-Speed Rollen und eine Dose Goblin-Energy!',
    options: [
      { label: 'Ich find deine Rollen & Energy!', nextNodeId: 'leander_accept' },
      { label: 'Wie war der Trick sonst so?', nextNodeId: 'leander_trick' }
    ]
  },
  leander_trick: {
    id: 'leander_trick',
    speaker: 'leander',
    speakerName: '🛹 Leander (Skater-Goblin)',
    text: 'Er war so unfassbar steil, dass die Funken von der Coping geflogen sind! Aber ohne neue Rollen rollt hier gar nix mehr.',
    options: [
      { label: 'Ich hol die Ersatzteile!', nextNodeId: 'leander_accept' }
    ]
  },
  leander_accept: {
    id: 'leander_accept',
    speaker: 'leander',
    speakerName: '🛹 Leander (Skater-Goblin)',
    text: 'Mega! Schau mal in der hinteren Werkstatt-Ecke und beim Snack-Automaten nach. Sobald mein Board fit ist, pack ich Rampen und Sofas ein und wir rocken deinen Bauwagenplatz!',
    options: [
      { label: 'Auf gehts!', action: 'close' }
    ]
  },
  leander_waiting: {
    id: 'leander_waiting',
    speaker: 'leander',
    speakerName: '🛹 Leander (Skater-Goblin)',
    text: 'Rollen und Energy noch nicht am Start? Check mal die Rampenkanten und die Kisten ganz oben in der Halle!',
    options: [
      { label: 'Bin dran!', action: 'close' }
    ]
  },
  leander_complete: {
    id: 'leander_complete',
    speaker: 'leander',
    speakerName: '🛹 Leander (Skater-Goblin)',
    text: '*Tssssk - Gluck gluck* AHHH, die Energy ballert direkt in die Goblin-Waden! Und die Rollen drehen wie Butter! Valentin, danke Mann! Ich bring die chilligsten Skate-Sofas mit zu deiner Party!',
    options: [
      { label: 'Ab zum Bauwagenplatz!', action: 'recruit_leander' }
    ]
  },
  leander_hub: {
    id: 'leander_hub',
    speaker: 'leander',
    speakerName: '🛹 Leander (Skater-Goblin)',
    text: 'Der Platz hier hat den besten Flow! Wenn du die Skater-Lounge baust, zeig ich Grinds über den Biertisch! Lass krachen, Geburtstagskind!',
    options: [
      { label: 'Hell yeah!', action: 'close' }
    ]
  },

  // --- CANDY (Neon Rave Queen unter der Brücke) ---
  candy_intro: {
    id: 'candy_intro',
    speaker: 'candy',
    speakerName: '🍬 Candy (Glow-Queen)',
    text: 'VALENTIIIIIN!! HAPPY BIRTHDAY TO YOUUU! ✨💖 Schau mal wie die Laser hier unter der Autobahnbrücke strahlen! Aber Katastrophe: Meine Nebelmaschine spuckt nur noch Pusteblumen und mein Glitzer-Sirup für deinen Geburtstagspunch ist verschollen!',
    options: [
      { label: 'Keine Sorge Candy, ich kümmere mich darum!', nextNodeId: 'candy_accept' },
      { label: 'Was kann der Glitzer-Sirup?', nextNodeId: 'candy_lore' }
    ]
  },
  candy_lore: {
    id: 'candy_lore',
    speaker: 'candy',
    speakerName: '🍬 Candy (Glow-Queen)',
    text: 'Wenn man davon trinkt, leuchten die Goblin-Ohren pink und im Schwarzlicht funkeln alle Zähne! Absolutes Party-Must-Have!',
    options: [
      { label: 'Das brauchen wir unbedingt!', nextNodeId: 'candy_accept' }
    ]
  },
  candy_accept: {
    id: 'candy_accept',
    speaker: 'candy',
    speakerName: '🍬 Candy (Glow-Queen)',
    text: 'Jaaa! Such bitte hinter den großen Betonpfeilern nach der Nebel-Zündkerze und der Sirup-Flasche! Danach schleppe ich alle meine Lichterketten und die Bar zu dir!',
    options: [
      { label: 'Ich beeil mich!', action: 'close' }
    ]
  },
  candy_waiting: {
    id: 'candy_waiting',
    speaker: 'candy',
    speakerName: '🍬 Candy (Glow-Queen)',
    text: 'Glitzert es schon? Schau mal zwischen den Graffiti-Pfeilern und den Bauzäunen nach der Zündkerze und dem Sirup!',
    options: [
      { label: 'Ich such weiter!', action: 'close' }
    ]
  },
  candy_complete: {
    id: 'candy_complete',
    speaker: 'candy',
    speakerName: '🍬 Candy (Glow-Queen)',
    text: '*FSSSHHHH* Der Nebelwerfer pumpt! Und der Sirup funkelt magisch! VALENTIN DU BIST EIN SCHATZ! Ich packe sofort Lichterketten, Stroboskope und die Zauber-Bar ein. Wir sehen uns auf deinem Bauwagenplatz!',
    options: [
      { label: 'Auf die beste Party!', action: 'recruit_candy' }
    ]
  },
  candy_hub: {
    id: 'candy_hub',
    speaker: 'candy',
    speakerName: '🍬 Candy (Glow-Queen)',
    text: 'OMG Valentin, guck mal wie alles leuchtet! Wir glitzern alle im Takt! Bau an der Werkbank die Glow-Bar und den Riesen-Kuchen, dann geht die Party erst so richtig ab!',
    options: [
      { label: 'Let\'s glow!', action: 'close' }
    ]
  },

  // --- FINALE DIALOGUE ---
  finale_dialogue: {
    id: 'finale_dialogue',
    speaker: 'narrator',
    speakerName: '🎉 DIE GEBURTSTAGS-PARTY DES JAHRHUNDERTS!',
    text: 'Alle Freunde sind versammelt! Olli lässt die Subwoofer wummern, Leander springt waghalsige Tricks, Candy verzaubert alle mit Glitzer-Punch und der riesige Geburtstagskuchen leuchtet mit 1000 Kerzen! ALLES GUTE ZUM GEBURTSTAG, VALENTIN! 🧌🎂✨🥳',
    options: [
      { label: 'DANKE AN ALLE! WEITERFEIERN! 🪩', action: 'close' }
    ]
  }
};
