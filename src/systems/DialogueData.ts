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

  // --- LEANDER (Agile Scrum Master im Coworking-Bunker) ---
  leander_intro: {
    id: 'leander_intro',
    speaker: 'leander',
    speakerName: '📋 Leander (Scrum Master)',
    text: 'Yo Valentin! HAPPY BIRTHDAY, mein Bester! 🎉 Ich stecke mitten im Sprint-Planning für deinen Geburtstag, aber wir haben einen kritischen Blocker im Backlog! Ohne meinen goldenen Post-It-Block und einen doppelten Hafer-Espresso bricht die Team-Velocity ein. Kannst du die Impediments beseitigen?',
    options: [
      { label: 'Klar Leander! Ich finde deine Post-Its & Espresso!', nextNodeId: 'leander_accept' },
      { label: 'Was steht auf den goldenen Post-Its?', nextNodeId: 'leander_lore' }
    ]
  },
  leander_lore: {
    id: 'leander_lore',
    speaker: 'leander',
    speakerName: '📋 Leander (Scrum Master)',
    text: 'Das sind die Core User Stories für deine Party: Subwoofer-Alignment, Bass-Drop-Testing und Cake-Deployment! Ohne die Stories ist die Definition of Done nicht erreichbar!',
    options: [
      { label: 'Alles klar, ich hol die Sachen!', nextNodeId: 'leander_accept' }
    ]
  },
  leander_accept: {
    id: 'leander_accept',
    speaker: 'leander',
    speakerName: '📋 Leander (Scrum Master)',
    text: 'Top! Schau mal drüben am Kanban-Board und beim Barista-Tresen nach. Sobald der Blocker resolved ist, packe ich die Retro-Lounge und den Tischkicker ein und deploye mich zu dir!',
    options: [
      { label: 'Sprint gestartet!', action: 'close' }
    ]
  },
  leander_waiting: {
    id: 'leander_waiting',
    speaker: 'leander',
    speakerName: '📋 Leander (Scrum Master)',
    text: 'Post-Its und Espresso noch nicht im Sprint? Check mal die Kaffeemaschine und die Standup-Ecke ganz hinten im Coworking-Bunker!',
    options: [
      { label: 'Bin dran!', action: 'close' }
    ]
  },
  leander_complete: {
    id: 'leander_complete',
    speaker: 'leander',
    speakerName: '📋 Leander (Scrum Master)',
    text: '*Schlürf* AHHH, dieser Espresso bringt 120% Velocity! Und die goldenen Post-Its kleben perfekt am Board! Definition of Done ist erfüllt! Ich packe den Kanban-Kicker ein und feiere mit dir am Hub!',
    options: [
      { label: 'Ab zum Bauwagenplatz!', action: 'recruit_leander' }
    ]
  },
  leander_hub: {
    id: 'leander_hub',
    speaker: 'leander',
    speakerName: '📋 Leander (Scrum Master)',
    text: 'Hier am Hub stimmt die Team-Velocity einfach! Wenn du an deiner Werkbank die Agile Retro-Lounge baust, fordern wir Olli zu einer Runde Tischkicker heraus! Happy Birthday!',
    options: [
      { label: 'Agile feiern!', action: 'close' }
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

  // --- HENNING (Bio-Bauer & Cannabis Social Club Betreiber) ---
  henning_intro: {
    id: 'henning_intro',
    speaker: 'henning',
    speakerName: '🌿 Henning (Bio-Bauer & CSC-Host)',
    text: 'Moin Valentin! Herzlichen Glückwunsch zum Geburtstag, mein Bester! 🎂🌿 Ich wollte schon längst zu deinem Rave tuckern, aber hier auf dem Bio-Bauernhof steht die Ernte für unseren Cannabis Social Club an! Mir fehlen noch meine goldenen Zauber-Samen und der Kristall-Vaporizer... Kannst du kurz helfen?',
    options: [
      { label: 'Klar Henning! Ich suche Saatgut & Vaporizer!', nextNodeId: 'henning_accept' },
      { label: 'Was macht die Zauber-Samen so besonders?', nextNodeId: 'henning_lore' }
    ]
  },
  henning_lore: {
    id: 'henning_lore',
    speaker: 'henning',
    speakerName: '🌿 Henning (Bio-Bauer & CSC-Host)',
    text: 'Das ist 100% Bio-zertifiziertes Gourmet-Saatgut mit feinsten Terpenen! Völlig legal angebaut im CSC "Goblin Green". Wenn der Vaporizer dampft, duftet der ganze Bauwagenplatz nach wilden Kräutern und Entspannung pur!',
    options: [
      { label: 'Das passt perfekt zum Rave! Ich hole sie!', nextNodeId: 'henning_accept' }
    ]
  },
  henning_accept: {
    id: 'henning_accept',
    speaker: 'henning',
    speakerName: '🌿 Henning (Bio-Bauer & CSC-Host)',
    text: 'Wunderbar! Schau mal drüben im Gewächshaus und beim alten Traktor nach. Sobald wir alles haben, werfe ich den Traktor an und bringe die gemütlichsten Hanf-Sofas und Kräuter-Nebelwerfer zu dir!',
    options: [
      { label: 'Ich bin schon am Suchen!', action: 'close' }
    ]
  },
  henning_waiting: {
    id: 'henning_waiting',
    speaker: 'henning',
    speakerName: '🌿 Henning (Bio-Bauer & CSC-Host)',
    text: 'Saatgut und Vaporizer noch nicht gefunden? Schau mal zwischen den Hanfpflanzen und drüben beim Traktor nach!',
    options: [
      { label: 'Ich suche weiter!', action: 'close' }
    ]
  },
  henning_complete: {
    id: 'henning_complete',
    speaker: 'henning',
    speakerName: '🌿 Henning (Bio-Bauer & CSC-Host)',
    text: 'Klasse, da sind die Zauber-Samen! Und der Kristall-Vaporizer glänzt wie eine Eins! Valentin, du bist ein echter Ehren-Bauer! Ich lade die Bio-Hanf-Lounge auf den Traktor und tucker rüber zu deinem Party-Hub!',
    options: [
      { label: 'Auf geht\'s zur Party, Henning!', action: 'recruit_henning' }
    ]
  },
  henning_hub: {
    id: 'henning_hub',
    speaker: 'henning',
    speakerName: '🌿 Henning (Bio-Bauer & CSC-Host)',
    text: 'Herrlich, diese Party-Atmosphäre am Bauwagenplatz! Valentin, bester Geburtstag ever! Wenn du an deiner Werkbank die Bio-Hanf-Lounge baust, sorgt der Kräuter-Nebel für absolute Wohlfühl-Vibes!',
    options: [
      { label: 'Chillig weiterfeiern, Henning!', action: 'close' }
    ]
  },

  // --- FINALE DIALOGUE ---
  finale_dialogue: {
    id: 'finale_dialogue',
    speaker: 'narrator',
    speakerName: '🎉 DIE GEBURTSTAGS-PARTY DES JAHRHUNDERTS!',
    text: 'Alle Freunde sind versammelt! Olli lässt die Subwoofer wummern, Scrum Master Leander feiert das beste Sprint-Review aller Zeiten, Candy verzaubert mit Glitzer-Punch, Bio-Bauer Henning sorgt für die chilligsten Hanf-Vibes und der riesige Geburtstagskuchen leuchtet im Zentrum! ALLES GUTE ZUM GEBURTSTAG, VALENTIN! 🧌🎂✨🌿🥳',
    options: [
      { label: 'DANKE AN ALLE! WEITERFEIERN! 🪩', action: 'close' }
    ]
  }
};
