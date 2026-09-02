# 🧌 Valentins Geburtstag: Die Goblin-Rave-Odyssee 🎂✨

Ein charmantes, gemütliches 2D Top-Down Browser-Abenteuerspiel mit Crafting, Quest-Tagebuch, dynamischem Chiptune/Techno-Web-Audio-Layering und vollem Mobile-Touch-Support!

---

## 📖 Die Geschichte
Heute feiert der Goblin **Valentin** seinen Geburtstag! Um die legendärste Geburtstagsparty aller Zeiten zu schmeißen, muss Valentin seinen verlassenen Bauwagenplatz in einen Rave-Hotspot verwandeln. Doch seine besten Freunde feiern verstreut auf geheimen Underground-Raves in der ganzen Stadt:

1. **🎧 Olli (Kanal-Rave)**: Hat sein Master-Vinyl und vergoldetes Klinkenkabel im Schilf verloren.
2. **🛹 Leander (Skatehalle)**: Braucht High-Speed Keramik-Rollen und eiskalte Goblin-Energy für sein Board.
3. **🍬 Candy (Autobahnbrücke)**: Sucht eine Zündkerze für ihre Nebelmaschine und Glitzer-Sirup für den Geburtstagspunch.

Reise über die Teleport-Portale zu den Raves, hilf deinen Freunden, sammle Bauholz, Kabel und Knicklichter und baue an deiner Werkbank das DJ-Pult, die Skater-Lounge, die Glow-Bar und den **Gigantischen Geburtstagskuchen** auf!

---

## 🗺️ Die Zonen

- **🧌 Valentins Party-Hub (Bauwagenplatz):** Dein Basislager mit Werkbank, Portalen und erweiterbarer Party-Dekoration.
- **🎧 Kanal-Open-Air:** Rave am Wasser mit Schilf, Bootwrack und Chillout-Klängen.
- **🛹 Skatehalle:** Warehouse mit Rampen, Quarterpipes und schnellen Skate-Vibes.
- **🍬 Autobahnbrücke:** Untergrund-Rave mit Betonpfeilern, Stroboskop-Lichtern und Nebelwerfern.

---

## 🎮 Steuerung

| Taste | Aktion |
|---|---|
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> / Pfeiltasten | Valentin bewegen |
| <kbd>E</kbd> / <kbd>Leertaste</kbd> / <kbd>Enter</kbd> | Interagieren / Sprechen / Items aufheben / Portale betreten |
| <kbd>C</kbd> | Werkbank & Party-Crafting öffnen |
| <kbd>Q</kbd> | Quest-Tagebuch öffnen |
| <kbd>M</kbd> | Musik & Soundeffekte stummschalten / aktivieren |
| **Mobile / Touch** | Virtueller Analog-Stick (unten links) & Action-Buttons `E`, `C`, `Q` (unten rechts) |

---

## 🚀 Spiel starten

```bash
# In den Projektordner wechseln
cd /Users/olli/Documents/projects/goblin-village-adventure

# Entwicklungs-Server starten
npm run dev
```

Öffne anschließend die im Terminal angezeigte URL (z. B. `http://localhost:5175/`) im Browser!

---

## 🛠️ Technologien
- **Phaser 3** (v3.88+) – 2D WebGL / Canvas Game Framework
- **TypeScript & Vite** – Schnelle Entwicklung und saubere Typisierung
- **Web Audio API** – Dynamisch mehrspuriger Chiptune/Synthwave Sound-Synthesizer mit beat-synchronem Layering (Bass, Lead, Arpeggios, Drums)
- **LocalStorage & JSON** – Automatisches Speichern des Spielfortschritts
