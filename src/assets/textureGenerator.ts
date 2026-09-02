import Phaser from 'phaser';

/**
 * Enhanced High-Fidelity Pixel-Art Texture Generator for Phaser 3.
 * Produces vibrant, detailed, shaded 2D retro sprites and tiles.
 */
export class TextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    this.createTileTextures(scene);
    this.createCharacterSprites(scene);
    this.createPropTextures(scene);
    this.createItemIcons(scene);
    this.createParticleTextures(scene);
    this.createUITextures(scene);
  }

  private static createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // --- TILES ---
  private static createTileTextures(scene: Phaser.Scene): void {
    // 1. Lush Grass Tile (Hub)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#224d26';
      ctx.fillRect(0, 0, 32, 32);
      
      // Grass tufts & shading
      const bladeColors = ['#2c6331', '#377a3d', '#499b50', '#1c3d1f'];
      for (let x = 0; x < 32; x += 4) {
        for (let y = 0; y < 32; y += 4) {
          const c = bladeColors[(x * 3 + y * 7) % bladeColors.length];
          ctx.fillStyle = c;
          ctx.fillRect(x + 1, y + 1, 2, 2);
        }
      }
      // Decorative daisies & tiny magic mushrooms
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 6, 2, 2);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(7, 7, 1, 1);

      ctx.fillStyle = '#ff3366';
      ctx.fillRect(22, 18, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(23, 20, 1, 2);
      scene.textures.addCanvas('tile_grass', canvas);
    }

    // 2. Cobblestone / Dirt Path Tile
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(0, 0, 32, 32);
      
      // Individual cobblestone stones
      const drawStone = (x: number, y: number, w: number, h: number) => {
        ctx.fillStyle = '#2d1f13'; // shadow
        ctx.fillRect(x + 1, y + 1, w, h);
        ctx.fillStyle = '#6e4e30'; // base stone
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#8c643f'; // top highlight
        ctx.fillRect(x, y, w, Math.max(1, Math.floor(h / 3)));
        ctx.fillStyle = '#9e734a';
        ctx.fillRect(x + 1, y, Math.max(1, w - 2), 1);
      };

      drawStone(2, 2, 12, 10);
      drawStone(16, 2, 14, 8);
      drawStone(2, 14, 14, 8);
      drawStone(18, 12, 12, 10);
      drawStone(6, 24, 12, 6);
      drawStone(20, 24, 10, 6);
      scene.textures.addCanvas('tile_dirt', canvas);
    }

    // 3. Concrete Tile with Graffiti (Skatehalle)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#313542';
      ctx.fillRect(0, 0, 32, 32);
      
      // Concrete slabs & seams
      ctx.fillStyle = '#3e4454';
      ctx.fillRect(1, 1, 30, 30);
      ctx.fillStyle = '#22252e';
      ctx.fillRect(0, 31, 32, 1);
      ctx.fillRect(31, 0, 1, 32);

      // Surface scuffs & metal bolts in corners
      ctx.fillStyle = '#5c647a';
      ctx.fillRect(3, 3, 2, 2);
      ctx.fillRect(27, 3, 2, 2);
      ctx.fillRect(3, 27, 2, 2);
      ctx.fillRect(27, 27, 2, 2);

      // Neon skate tag paint streak
      ctx.fillStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.fillRect(8, 12, 14, 2);
      ctx.fillStyle = 'rgba(255, 0, 128, 0.45)';
      ctx.fillRect(12, 14, 12, 2);
      scene.textures.addCanvas('tile_concrete', canvas);
    }

    // 4. Asphalt Pavement with Neon Reflections (Autobahnbrücke)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#14131a';
      ctx.fillRect(0, 0, 32, 32);
      
      // Tarmac grain
      for (let i = 0; i < 30; i++) {
        const px = (i * 11) % 32;
        const py = (i * 19) % 32;
        ctx.fillStyle = i % 2 === 0 ? '#1f1e29' : '#292736';
        ctx.fillRect(px, py, 2, 2);
      }

      // Wet puddle reflecting purple/magenta neon rave lights
      ctx.fillStyle = 'rgba(180, 0, 255, 0.25)';
      ctx.beginPath();
      ctx.ellipse(16, 16, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 255, 230, 0.35)';
      ctx.fillRect(12, 15, 8, 2);
      scene.textures.addCanvas('tile_asphalt', canvas);
    }

    // 5. Water Tile with Waves & Foam (Canal)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#133959';
      ctx.fillRect(0, 0, 32, 32);

      // Water layers
      ctx.fillStyle = '#1b4d78';
      ctx.fillRect(0, 4, 32, 6);
      ctx.fillRect(0, 18, 32, 6);

      // Wave highlights & cyan shimmer
      ctx.fillStyle = '#3a8bc7';
      ctx.fillRect(4, 5, 12, 2);
      ctx.fillRect(18, 19, 10, 2);
      ctx.fillStyle = '#7ec5f7';
      ctx.fillRect(8, 5, 4, 1);
      ctx.fillRect(22, 19, 4, 1);

      // Water surface foam
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(2, 10, 6, 1);
      ctx.fillRect(20, 24, 8, 1);
      scene.textures.addCanvas('tile_water', canvas);
    }

    // 6. Wooden Wall & Fence Tile
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#3a2412';
      ctx.fillRect(0, 0, 32, 32);

      // Vertical wood planks with grain
      const drawPlank = (x: number) => {
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(x, 0, 9, 32);
        ctx.fillStyle = '#7a4e28';
        ctx.fillRect(x + 1, 0, 7, 32);
        ctx.fillStyle = '#945f32';
        ctx.fillRect(x + 2, 0, 2, 32); // plank highlight
        // Wood grain knot
        ctx.fillStyle = '#452b16';
        ctx.fillRect(x + 3, 12, 3, 4);
        ctx.fillRect(x + 4, 13, 1, 2);
        // Iron nail
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 4, 4, 2, 2);
        ctx.fillRect(x + 4, 26, 2, 2);
      };

      drawPlank(1);
      drawPlank(11);
      drawPlank(21);
      scene.textures.addCanvas('tile_wall', canvas);
    }

    // 7. Modern Coworking Tech Parquet Tile
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#1e1b2e';
      ctx.fillRect(0, 0, 32, 32);
      // Clean wood parquet strips
      ctx.fillStyle = '#2d2745';
      ctx.fillRect(1, 1, 30, 14);
      ctx.fillRect(1, 17, 30, 14);
      ctx.fillStyle = '#3c345c';
      ctx.fillRect(2, 2, 28, 3);
      ctx.fillRect(2, 18, 28, 3);
      // Subtle cyan data glow seam
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(0, 15, 32, 1);
      scene.textures.addCanvas('tile_coworking', canvas);
    }

    // 8. Rich Farm Soil & Sprout Tile (Bauernhof)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#382314';
      ctx.fillRect(0, 0, 32, 32);
      // Soil texture
      for (let i = 0; i < 20; i++) {
        const sx = (i * 13) % 32;
        const sy = (i * 17) % 32;
        ctx.fillStyle = i % 2 === 0 ? '#4d321d' : '#29180c';
        ctx.fillRect(sx, sy, 3, 3);
      }
      // Green sprouts
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(6, 8, 2, 4);
      ctx.fillRect(5, 7, 4, 2);
      ctx.fillRect(20, 22, 2, 4);
      ctx.fillRect(19, 21, 4, 2);
      scene.textures.addCanvas('tile_farm', canvas);
    }
  }

  // --- CHARACTERS ---
  private static createCharacterSprites(scene: Phaser.Scene): void {
    // Valentin (Main Character)
    this.createGoblinSpritesheet(scene, 'valentin', {
      skinBase: '#4da64d',
      skinLight: '#73c773',
      skinShadow: '#286b28',
      clothes: '#ff007f', // vibrant magenta rave shirt
      pants: '#1e1c2b',
      shoes: '#00ffff',
      hatColor: '#ffd700',
      hasPartyHat: true
    });

    // Olli (DJ am Kanal)
    this.createGoblinSpritesheet(scene, 'olli', {
      skinBase: '#4fa85c',
      skinLight: '#78c983',
      skinShadow: '#2a6b33',
      clothes: '#7822d6', // purple hoodie
      pants: '#181424',
      shoes: '#ffea00',
      hasHeadphones: true,
      hasSunglasses: true
    });

    // Leander (Agile Scrum Master im Coworking-Bunker)
    this.createGoblinSpritesheet(scene, 'leander', {
      skinBase: '#3f9e57',
      skinLight: '#67bf7c',
      skinShadow: '#216334',
      clothes: '#0284c7', // agile tech-blue hoodie
      pants: '#1e293b',
      shoes: '#38bdf8',
      hasScrumGlasses: true,
      hasScrumLanyard: true
    });

    // Candy (Rave-Queen unter Autobahnbrücke)
    this.createGoblinSpritesheet(scene, 'candy', {
      skinBase: '#58b868',
      skinLight: '#85d993',
      skinShadow: '#31783d',
      clothes: '#ff00aa', // neon pink holographic top
      pants: '#2d0a3d',
      shoes: '#00ffcc',
      hasRaveAntenna: true,
      hasGlowCheeks: true
    });

    // Henning (Bio-Bauer & Cannabis Social Club Betreiber)
    this.createGoblinSpritesheet(scene, 'henning', {
      skinBase: '#4fa85c',
      skinLight: '#7cd989',
      skinShadow: '#266930',
      clothes: '#ca8a04', // rustic plaid flannel shirt
      pants: '#166534', // green farmer dungarees
      shoes: '#854d0e', // sturdy brown boots
      hasFarmerHat: true,
      hasOveralls: true
    });
  }

  private static createGoblinSpritesheet(
    scene: Phaser.Scene,
    name: string,
    opts: {
      skinBase: string;
      skinLight: string;
      skinShadow: string;
      clothes: string;
      pants: string;
      shoes: string;
      hatColor?: string;
      hasPartyHat?: boolean;
      hasHeadphones?: boolean;
      hasSunglasses?: boolean;
      hasSkaterCap?: boolean;
      hasScrumGlasses?: boolean;
      hasScrumLanyard?: boolean;
      hasFarmerHat?: boolean;
      hasOveralls?: boolean;
      hasRaveAntenna?: boolean;
      hasGlowCheeks?: boolean;
    }
  ): void {
    const states = ['idle', 'walk1', 'walk2', 'dance'];

    states.forEach((state, idx) => {
      const { canvas, ctx } = this.createCanvas(32, 32);
      
      const bounce = state === 'walk1' ? -1 : state === 'walk2' ? 1 : state === 'dance' ? (idx % 2 === 0 ? -2 : 2) : 0;
      const legOffset = state === 'walk1' ? -2 : state === 'walk2' ? 2 : 0;

      // 1. Soft Ambient Shadow
      ctx.fillStyle = 'rgba(8, 4, 18, 0.45)';
      ctx.beginPath();
      ctx.ellipse(16, 30, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Expressive Goblin Ears (pointed)
      // Left Ear
      ctx.fillStyle = opts.skinShadow;
      ctx.beginPath();
      ctx.moveTo(7, 12 + bounce);
      ctx.lineTo(0, 14 + bounce);
      ctx.lineTo(7, 18 + bounce);
      ctx.fill();
      ctx.fillStyle = opts.skinBase;
      ctx.beginPath();
      ctx.moveTo(7, 13 + bounce);
      ctx.lineTo(2, 14 + bounce);
      ctx.lineTo(7, 17 + bounce);
      ctx.fill();
      // Inner Ear Pink
      ctx.fillStyle = '#e8789d';
      ctx.fillRect(4, 14 + bounce, 2, 2);

      // Right Ear
      ctx.fillStyle = opts.skinShadow;
      ctx.beginPath();
      ctx.moveTo(25, 12 + bounce);
      ctx.lineTo(32, 14 + bounce);
      ctx.lineTo(25, 18 + bounce);
      ctx.fill();
      ctx.fillStyle = opts.skinBase;
      ctx.beginPath();
      ctx.moveTo(25, 13 + bounce);
      ctx.lineTo(30, 14 + bounce);
      ctx.lineTo(25, 17 + bounce);
      ctx.fill();
      // Inner Ear Pink
      ctx.fillStyle = '#e8789d';
      ctx.fillRect(26, 14 + bounce, 2, 2);

      // 3. Head & Face
      // Base Head
      ctx.fillStyle = opts.skinShadow;
      ctx.fillRect(7, 7 + bounce, 18, 14);
      ctx.fillStyle = opts.skinBase;
      ctx.fillRect(8, 8 + bounce, 16, 12);
      ctx.fillStyle = opts.skinLight;
      ctx.fillRect(9, 8 + bounce, 14, 4); // Forehead highlight

      // Round Goblin Nose
      ctx.fillStyle = opts.skinShadow;
      ctx.fillRect(14, 14 + bounce, 4, 4);
      ctx.fillStyle = opts.skinLight;
      ctx.fillRect(15, 14 + bounce, 2, 2);

      // Big Animated Eyes
      if (state === 'dance') {
        // Happy closed curved eyes ^ ^
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(11, 13 + bounce, 3, Math.PI, 0);
        ctx.arc(21, 13 + bounce, 3, Math.PI, 0);
        ctx.stroke();
      } else {
        // Wide open expressive eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(9, 11 + bounce, 5, 5);
        ctx.fillRect(18, 11 + bounce, 5, 5);
        // Pupils
        ctx.fillStyle = '#0f1712';
        ctx.fillRect(11, 12 + bounce, 3, 3);
        ctx.fillRect(18, 12 + bounce, 3, 3);
        // Catchlight sparkles
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(11, 12 + bounce, 1, 1);
        ctx.fillRect(18, 12 + bounce, 1, 1);
      }

      // Friendly smile & Goblin Fang
      ctx.fillStyle = '#1c301d';
      ctx.fillRect(12, 18 + bounce, 8, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(13, 18 + bounce, 2, 2); // Cute little tooth/fang

      // 4. Body & Outfit
      // Shirt / Jacket
      ctx.fillStyle = opts.clothes;
      ctx.fillRect(9, 21 + bounce, 14, 6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(10, 21 + bounce, 12, 2); // collar highlight

      // Arms
      if (state === 'dance') {
        // Arms waving high in the air!
        ctx.fillStyle = opts.skinBase;
        ctx.fillRect(5, 10 + bounce, 4, 11);
        ctx.fillRect(23, 10 + bounce, 4, 11);
        ctx.fillStyle = opts.skinLight;
        ctx.fillRect(5, 10 + bounce, 4, 3);
        ctx.fillRect(23, 10 + bounce, 4, 3);
      } else {
        ctx.fillStyle = opts.skinBase;
        ctx.fillRect(6, 21 + bounce + (state === 'walk1' ? -2 : 2), 3, 6);
        ctx.fillRect(23, 21 + bounce + (state === 'walk2' ? -2 : 2), 3, 6);
      }

      // Pants & Shoes
      ctx.fillStyle = opts.pants;
      ctx.fillRect(10, 26, 5, 2);
      ctx.fillRect(17, 26, 5, 2);
      // Shoes with highlights
      ctx.fillStyle = opts.shoes;
      ctx.fillRect(9, 28 + (legOffset > 0 ? -1 : 0), 6, 3);
      ctx.fillRect(17, 28 + (legOffset < 0 ? -1 : 0), 6, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(9, 28 + (legOffset > 0 ? -1 : 0), 2, 1);
      ctx.fillRect(17, 28 + (legOffset < 0 ? -1 : 0), 2, 1);

      // --- Character Specific Details ---

      // Valentin: Golden Birthday Cone Hat with Pom-Pom
      if (opts.hasPartyHat) {
        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.moveTo(16, 0 + bounce);
        ctx.lineTo(9, 7 + bounce);
        ctx.lineTo(23, 7 + bounce);
        ctx.fill();
        // Golden Stripes
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(12, 4 + bounce, 8, 2);
        // Fluffy pom-pom
        ctx.beginPath();
        ctx.arc(16, 0 + bounce, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Olli: Pro DJ Headphones & Aviator Sunglasses
      if (opts.hasHeadphones) {
        // Headphone headband
        ctx.fillStyle = '#22222e';
        ctx.fillRect(6, 5 + bounce, 20, 3);
        // Ear cups with glowing cyan LED ring
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(4, 6 + bounce, 4, 8);
        ctx.fillRect(24, 6 + bounce, 4, 8);
        ctx.fillStyle = '#111';
        ctx.fillRect(5, 7 + bounce, 2, 6);
        ctx.fillRect(25, 7 + bounce, 2, 6);
      }
      if (opts.hasSunglasses) {
        // Dark reflective glasses
        ctx.fillStyle = '#100b1a';
        ctx.fillRect(8, 10 + bounce, 7, 5);
        ctx.fillRect(17, 10 + bounce, 7, 5);
        ctx.fillRect(15, 11 + bounce, 2, 2);
        // Purple glow reflection
        ctx.fillStyle = '#b300ff';
        ctx.fillRect(9, 11 + bounce, 4, 1);
        ctx.fillRect(18, 11 + bounce, 4, 1);
      }

      // Leander: Scrum Master Stylish Glasses & Company Lanyard / Badge
      if (opts.hasScrumGlasses) {
        ctx.fillStyle = '#0f172a';
        ctx.strokeRect(8, 10 + bounce, 6, 5);
        ctx.strokeRect(18, 10 + bounce, 6, 5);
        ctx.fillRect(14, 12 + bounce, 4, 1); // Bridge
        // Blue light anti-glare reflection
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(9, 11 + bounce, 2, 2);
        ctx.fillRect(19, 11 + bounce, 2, 2);
      }
      if (opts.hasScrumLanyard) {
        // Neon green / yellow company lanyard with pass badge
        ctx.fillStyle = '#eab308';
        ctx.fillRect(15, 21 + bounce, 2, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, 25 + bounce, 4, 3); // Badge card
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(15, 26 + bounce, 2, 1);
      }

      // Henning: Rustic Straw Farmer Hat & Overalls with Cannabis Leaf
      if (opts.hasFarmerHat) {
        // Hat brim
        ctx.fillStyle = '#d97706';
        ctx.fillRect(4, 5 + bounce, 24, 3);
        // Hat crown
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(9, 1 + bounce, 14, 5);
        // Green hatband
        ctx.fillStyle = '#15803d';
        ctx.fillRect(9, 4 + bounce, 14, 2);
      }
      if (opts.hasOveralls) {
        // Dungaree straps
        ctx.fillStyle = '#166534';
        ctx.fillRect(10, 21 + bounce, 2, 5);
        ctx.fillRect(20, 21 + bounce, 2, 5);
        // Golden buckle buttons
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(10, 24 + bounce, 2, 2);
        ctx.fillRect(20, 24 + bounce, 2, 2);
        // Mini Cannabis Leaf badge on chest
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(15, 23 + bounce, 2, 3);
        ctx.fillRect(14, 24 + bounce, 4, 1);
      }

      // Candy: Glow Rave Antenna & Glitter Cheeks
      if (opts.hasRaveAntenna) {
        // Headband
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(7, 6 + bounce, 18, 2);
        // Spring Antennas with glowing neon balls
        ctx.fillStyle = '#ff00ea';
        ctx.fillRect(10, 1 + bounce, 2, 5);
        ctx.fillRect(20, 1 + bounce, 2, 5);
        ctx.beginPath();
        ctx.arc(11, 1 + bounce, 3, 0, Math.PI * 2);
        ctx.arc(21, 1 + bounce, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (opts.hasGlowCheeks) {
        ctx.fillStyle = 'rgba(255, 0, 128, 0.7)';
        ctx.fillRect(8, 14 + bounce, 4, 3);
        ctx.fillRect(20, 14 + bounce, 4, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(9, 15 + bounce, 1, 1);
        ctx.fillRect(21, 15 + bounce, 1, 1);
      }

      scene.textures.addCanvas(`${name}_${state}`, canvas);
    });
  }

  // --- PROPS & UPGRADES ---
  private static createPropTextures(scene: Phaser.Scene): void {
    // 1. DJ Booth / Turnables Desk (64x36)
    {
      const { canvas, ctx } = this.createCanvas(64, 36);
      // Desk Base with metallic finish
      ctx.fillStyle = '#181524';
      ctx.fillRect(2, 8, 60, 26);
      ctx.fillStyle = '#2c253d';
      ctx.fillRect(4, 10, 56, 12);
      // Front LED Display / Logo
      ctx.fillStyle = '#0c0a12';
      ctx.fillRect(12, 23, 40, 9);
      ctx.fillStyle = '#ff007f';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ BASS ⚡', 15, 30);

      // Left Turntable with glossy Vinyl
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(16, 16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00ffcc';
      ctx.beginPath();
      ctx.arc(16, 16, 3, 0, Math.PI * 2);
      ctx.fill();
      // Tone arm
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(24, 11);
      ctx.lineTo(19, 16);
      ctx.stroke();

      // Right Turntable
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(48, 16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(48, 16, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ddd';
      ctx.beginPath();
      ctx.moveTo(56, 11);
      ctx.lineTo(51, 16);
      ctx.stroke();

      // Center Mixer LED Equalizer bars
      const eqColors = ['#00ff66', '#00ff66', '#ffe600', '#ff0055'];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = eqColors[i];
        ctx.fillRect(30 + i * 2, 17 - i * 2, 1.5, i * 2 + 3);
      }
      scene.textures.addCanvas('prop_dj_booth', canvas);
    }

    // 2. Mega Concert Speakers (32x54)
    {
      const { canvas, ctx } = this.createCanvas(32, 54);
      // Cabinet
      ctx.fillStyle = '#101016';
      ctx.fillRect(2, 2, 28, 50);
      ctx.fillStyle = '#22222e';
      ctx.strokeRect(3.5, 3.5, 25, 47);

      // Corner Protectors
      ctx.fillStyle = '#66667a';
      ctx.fillRect(2, 2, 3, 3);
      ctx.fillRect(27, 2, 3, 3);
      ctx.fillRect(2, 49, 3, 3);
      ctx.fillRect(27, 49, 3, 3);

      // Tweeter Horn (Top)
      ctx.fillStyle = '#1b1b24';
      ctx.fillRect(8, 6, 16, 8);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(10, 8, 12, 4);

      // Mid-Woofer (Middle)
      ctx.fillStyle = '#2d2d3d';
      ctx.beginPath();
      ctx.arc(16, 23, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a4a61';
      ctx.beginPath();
      ctx.arc(16, 23, 3, 0, Math.PI * 2);
      ctx.fill();

      // Massive Sub-Woofer (Bottom) with glowing neon ring
      ctx.fillStyle = '#2d2d3d';
      ctx.beginPath();
      ctx.arc(16, 40, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#575773';
      ctx.beginPath();
      ctx.arc(16, 40, 4, 0, Math.PI * 2);
      ctx.fill();
      // Glowing Cyan Pulse Ring
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(16, 40, 10, 0, Math.PI * 2);
      ctx.stroke();
      scene.textures.addCanvas('prop_speakers', canvas);
    }

    // 3. Glowing Festoon String Lights (96x20)
    {
      const { canvas, ctx } = this.createCanvas(96, 20);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.bezierCurveTo(30, 18, 66, 18, 96, 4);
      ctx.stroke();

      const bulbColors = ['#ff007f', '#00ffcc', '#ffe600', '#ff00ea', '#00ff44', '#ff6600'];
      for (let i = 0; i < 9; i++) {
        const x = 8 + i * 10;
        const y = 4 + Math.sin((i / 8) * Math.PI) * 11;
        const col = bulbColors[i % bulbColors.length];

        // Soft Radial Glow
        const grad = ctx.createRadialGradient(x, y, 1, x, y, 6);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, col);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - 6, y - 6, 12, 12);

        // Bulb center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      scene.textures.addCanvas('prop_string_lights', canvas);
    }

    // 4. Glow Cocktail Drink Bar (56x36)
    {
      const { canvas, ctx } = this.createCanvas(56, 36);
      // Dark Wooden Counter
      ctx.fillStyle = '#26170d';
      ctx.fillRect(2, 12, 52, 22);
      ctx.fillStyle = '#4a2c16';
      ctx.fillRect(0, 10, 56, 5);
      ctx.fillStyle = '#6b4122';
      ctx.fillRect(0, 10, 56, 2);

      // Back Shelf with glowing neon bottles
      ctx.fillStyle = '#00ffcc'; // Curaçao
      ctx.fillRect(6, 3, 4, 7);
      ctx.fillStyle = '#ff007f'; // Raspberry
      ctx.fillRect(13, 2, 4, 8);
      ctx.fillStyle = '#ffe600'; // Banana
      ctx.fillRect(20, 4, 4, 6);
      ctx.fillStyle = '#a600ff'; // Magic Elixir
      ctx.fillRect(27, 2, 4, 8);

      // Glowing Punch Bowl with bubbling mist
      ctx.fillStyle = 'rgba(255, 0, 128, 0.85)';
      ctx.beginPath();
      ctx.arc(42, 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Magic sparkle bubbles rising
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, 4, 2, 2);
      ctx.fillRect(44, 2, 1.5, 1.5);
      scene.textures.addCanvas('prop_drink_bar', canvas);
    }

    // 5. Deluxe 3-Tier Birthday Cake (40x40)
    {
      const { canvas, ctx } = this.createCanvas(40, 40);
      // Bottom Tier (Pink Chocolate)
      ctx.fillStyle = '#c75877';
      ctx.fillRect(4, 22, 32, 14);
      ctx.fillStyle = '#fff0f5'; // Vanilla frosting drip
      ctx.fillRect(3, 20, 34, 4);
      ctx.fillRect(7, 24, 3, 4);
      ctx.fillRect(19, 24, 4, 5);
      ctx.fillRect(29, 24, 3, 3);

      // Middle Tier (Mint Matcha)
      ctx.fillStyle = '#55b376';
      ctx.fillRect(9, 12, 22, 9);
      ctx.fillStyle = '#ffffff'; // White frosting
      ctx.fillRect(8, 10, 24, 3);

      // Top Tier (Lemon Glaze)
      ctx.fillStyle = '#e8b835';
      ctx.fillRect(14, 5, 12, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(13, 4, 14, 2);

      // 3 Glowing Birthday Candles with animated flames
      const candlePositions = [16, 20, 24];
      candlePositions.forEach(cx => {
        // Candle Stick
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(cx, 1, 2, 4);
        // Flame
        ctx.fillStyle = '#ff3300';
        ctx.beginPath();
        ctx.arc(cx + 1, -0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(cx, -1, 2, 2);
      });
      scene.textures.addCanvas('prop_birthday_cake', canvas);
    }

    // 6. Realistic Skate Halfpipe Mini (56x36)
    {
      const { canvas, ctx } = this.createCanvas(56, 36);
      // Ramp curvature
      ctx.fillStyle = '#6e4e30';
      ctx.beginPath();
      ctx.moveTo(2, 4);
      ctx.quadraticCurveTo(28, 34, 54, 4);
      ctx.lineTo(54, 34);
      ctx.lineTo(2, 34);
      ctx.closePath();
      ctx.fill();

      // Top Coping Rail (Metal pipe)
      ctx.fillStyle = '#a6b8c7';
      ctx.fillRect(0, 3, 56, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 3, 56, 1);

      // Yellow/Black Hazard Caution stripes on sides
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(4, 8, 4, 24);
      ctx.fillRect(48, 8, 4, 24);
      scene.textures.addCanvas('prop_skate_ramp', canvas);
    }

    // 7. Vintage Goblin Party Bauwagen / Trailer (80x56)
    {
      const { canvas, ctx } = this.createCanvas(80, 56);
      // Wooden Green Body
      ctx.fillStyle = '#1c4d3d';
      ctx.fillRect(6, 12, 68, 36);
      ctx.fillStyle = '#296e57';
      for (let y = 14; y < 46; y += 6) {
        ctx.fillRect(6, y, 68, 4); // Wood plank lines
      }

      // Curved Teal Roof
      ctx.fillStyle = '#398f72';
      ctx.beginPath();
      ctx.ellipse(40, 12, 36, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Warm glowing window with party light
      ctx.fillStyle = '#ffeb60';
      ctx.fillRect(14, 20, 18, 16);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(14, 20, 18, 16);
      // Window cross
      ctx.beginPath();
      ctx.moveTo(23, 20);
      ctx.lineTo(23, 36);
      ctx.moveTo(14, 28);
      ctx.lineTo(32, 28);
      ctx.stroke();

      // Wooden Door with Brass Knob
      ctx.fillStyle = '#6b3c1a';
      ctx.fillRect(48, 22, 18, 26);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(51, 34, 3, 3);

      // Large Wagon Wheels
      const drawWheel = (wx: number) => {
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(wx, 50, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8a6544';
        ctx.beginPath();
        ctx.arc(wx, 50, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(wx, 50, 2, 0, Math.PI * 2);
        ctx.fill();
      };
      drawWheel(22);
      drawWheel(58);
      scene.textures.addCanvas('prop_bauwagen', canvas);
    }

    // 8. Swirling Cosmic Portal Arc (36x52)
    {
      const { canvas, ctx } = this.createCanvas(36, 52);
      // Stone / Tech Frame
      ctx.fillStyle = '#181226';
      ctx.fillRect(2, 2, 32, 48);
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.strokeRect(3, 3, 30, 46);

      // Swirling Vortex
      const radGrad = ctx.createRadialGradient(18, 26, 2, 18, 26, 16);
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.3, '#ff00ea');
      radGrad.addColorStop(0.7, '#6600ff');
      radGrad.addColorStop(1, '#00e5ff');
      ctx.fillStyle = radGrad;
      ctx.fillRect(6, 6, 24, 40);

      // Glowing Portal Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('WARP', 8, 28);
      scene.textures.addCanvas('prop_portal', canvas);
    }

    // 9. Festive Party Center Table (56x32)
    {
      const { canvas, ctx } = this.createCanvas(56, 32);
      // Wooden legs
      ctx.fillStyle = '#4a2c16';
      ctx.fillRect(6, 16, 6, 14);
      ctx.fillRect(44, 16, 6, 14);

      // Purple & Gold Festive Tablecloth
      ctx.fillStyle = '#2d1447';
      ctx.fillRect(2, 6, 52, 18);
      ctx.fillStyle = '#491d75';
      ctx.fillRect(2, 6, 52, 4);

      // Neon fringe trim
      ctx.fillStyle = '#ff007f';
      for (let x = 2; x < 54; x += 4) {
        ctx.fillRect(x, 22, 3, 3);
      }

      // Golden Centerpiece Platter
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(16, 4, 24, 3);
      ctx.fillRect(24, 7, 8, 2);

      scene.textures.addCanvas('prop_party_table', canvas);
    }

    // 10. Kanban Standup Board (64x44)
    {
      const { canvas, ctx } = this.createCanvas(64, 44);
      // Silver aluminum frame
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, 2, 60, 40);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(4, 4, 56, 36);

      // Title bar
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(4, 4, 56, 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6px sans-serif';
      ctx.fillText('SPRINT 42 KANBAN', 6, 10);

      // 3 Columns: TO DO / IN PROG / DONE
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(22, 12); ctx.lineTo(22, 40);
      ctx.moveTo(42, 12); ctx.lineTo(42, 40);
      ctx.stroke();

      // Post-It Notes
      const notes = [
        { x: 6, y: 14, col: '#facc15' },
        { x: 13, y: 14, col: '#f472b6' },
        { x: 6, y: 22, col: '#38bdf8' },
        { x: 24, y: 14, col: '#facc15' },
        { x: 32, y: 14, col: '#4ade80' },
        { x: 24, y: 23, col: '#f472b6' },
        { x: 44, y: 14, col: '#4ade80' },
        { x: 52, y: 14, col: '#4ade80' },
        { x: 44, y: 22, col: '#4ade80' },
        { x: 52, y: 22, col: '#4ade80' },
      ];
      notes.forEach(n => {
        ctx.fillStyle = n.col;
        ctx.fillRect(n.x, n.y, 6, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(n.x + 1, n.y + 2, 4, 1);
        ctx.fillRect(n.x + 1, n.y + 4, 3, 1);
      });

      scene.textures.addCanvas('prop_kanban_board', canvas);
    }

    // 11. Agile Retro Lounge & Foosball Kicker (72x40)
    {
      const { canvas, ctx } = this.createCanvas(72, 40);
      // Modern Blue/Purple Lounge Sofas
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(4, 12, 28, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(6, 14, 24, 8);
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(4, 32, 28, 4);

      // Foosball Table (Tischkicker)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(38, 14, 30, 22);
      ctx.fillStyle = '#15803d'; // Green Pitch
      ctx.fillRect(40, 16, 26, 18);
      // White pitch lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(42, 18, 22, 14);
      ctx.beginPath();
      ctx.arc(53, 25, 3, 0, Math.PI * 2);
      ctx.stroke();
      // Chrome player rods
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(36, 20, 34, 1.5);
      ctx.fillRect(36, 28, 34, 1.5);
      // Mini Players (Blue & Red)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(45, 19, 2, 3);
      ctx.fillRect(59, 19, 2, 3);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(45, 27, 2, 3);
      ctx.fillRect(59, 27, 2, 3);

      scene.textures.addCanvas('prop_retro_lounge', canvas);
    }

    // 12. Rustic Barn & CSC Headquarters (72x60)
    {
      const { canvas, ctx } = this.createCanvas(72, 60);
      // Red Barn Wood Structure
      ctx.fillStyle = '#831843';
      ctx.fillRect(4, 18, 64, 40);
      ctx.fillStyle = '#9f1239';
      ctx.fillRect(6, 20, 60, 36);

      // Roof (Gabled Peak)
      ctx.fillStyle = '#4c0519';
      ctx.beginPath();
      ctx.moveTo(36, 2);
      ctx.lineTo(2, 20);
      ctx.lineTo(70, 20);
      ctx.fill();

      // White Trim Lines
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(36, 4);
      ctx.lineTo(4, 20);
      ctx.lineTo(68, 20);
      ctx.closePath();
      ctx.stroke();

      // Large Double Barn Doors with X-Brace
      ctx.fillStyle = '#451a03';
      ctx.fillRect(22, 28, 28, 28);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(22, 28, 28, 28);
      ctx.beginPath();
      ctx.moveTo(22, 28); ctx.lineTo(36, 56);
      ctx.moveTo(36, 28); ctx.lineTo(22, 56);
      ctx.moveTo(36, 28); ctx.lineTo(50, 56);
      ctx.moveTo(50, 28); ctx.lineTo(36, 56);
      ctx.stroke();

      // Glowing Neon CSC Sign over door
      ctx.fillStyle = '#052e16';
      ctx.fillRect(18, 19, 36, 7);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.strokeRect(18, 19, 36, 7);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 5.5px sans-serif';
      ctx.fillText('🌿 CSC SOCIAL CLUB', 19, 24.5);

      scene.textures.addCanvas('prop_barn', canvas);
    }

    // 13. Green Farm Tractor (52x36)
    {
      const { canvas, ctx } = this.createCanvas(52, 36);
      // Green Engine Hood & Body
      ctx.fillStyle = '#15803d';
      ctx.fillRect(8, 12, 26, 14);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(10, 14, 22, 4);

      // Yellow Grill & Exhaust Pipe
      ctx.fillStyle = '#facc15';
      ctx.fillRect(8, 14, 3, 10);
      ctx.fillStyle = '#475569';
      ctx.fillRect(24, 2, 3, 12);
      ctx.fillRect(23, 1, 5, 2);

      // Cabin Glass Frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(30, 6, 16, 16);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillRect(32, 8, 12, 12);

      // Big Rear Wheel & Smaller Front Wheel
      const drawTractorWheel = (x: number, y: number, r: number) => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawTractorWheel(14, 26, 7);
      drawTractorWheel(38, 24, 11);

      scene.textures.addCanvas('prop_tractor', canvas);
    }

    // 14. Lush Glowing Cannabis Plant (32x40)
    {
      const { canvas, ctx } = this.createCanvas(32, 40);
      // Terracotta Flowerpot
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(8, 26, 16, 12);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(6, 24, 20, 3);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(8, 27, 16, 2);

      // Thick stalk
      ctx.fillStyle = '#166534';
      ctx.fillRect(15, 10, 2, 16);

      // Serrated Fan Leaves (7 pointed lobes)
      const drawLeaf = (cx: number, cy: number, rot: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-6, -0.5, 12, 1);
        ctx.restore();
      };
      drawLeaf(16, 16, 0);
      drawLeaf(16, 16, -0.6);
      drawLeaf(16, 16, 0.6);
      drawLeaf(16, 16, -1.2);
      drawLeaf(16, 16, 1.2);
      drawLeaf(16, 8, 0);
      drawLeaf(16, 8, -0.7);
      drawLeaf(16, 8, 0.7);

      // Sparkling resin trichomes / glow
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(15, 4, 2, 2);
      ctx.fillRect(11, 10, 2, 2);
      ctx.fillRect(19, 10, 2, 2);

      scene.textures.addCanvas('prop_weed_plant', canvas);
    }

    // 15. Bio-Hanf Smoke Lounge Upgrade (72x36)
    {
      const { canvas, ctx } = this.createCanvas(72, 36);
      // Emerald Green Velvet Lounge Sofas
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(4, 10, 64, 24);
      ctx.fillStyle = '#059669';
      ctx.fillRect(6, 12, 60, 10);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(8, 12, 56, 3);

      // Wooden Coffee Table with Glass Herb Bowl
      ctx.fillStyle = '#78350f';
      ctx.fillRect(24, 20, 24, 12);
      ctx.fillStyle = '#065f46';
      ctx.fillRect(32, 15, 8, 5);
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.arc(36, 15, 3, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('prop_smoke_lounge', canvas);
    }

    // 16. Emerald Green Cosmic Portal (36x52)
    {
      const { canvas, ctx } = this.createCanvas(36, 52);
      // Wood & Moss Tech Frame
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(2, 2, 32, 48);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(3, 3, 30, 46);

      // Green Swirling Vortex
      const radGrad = ctx.createRadialGradient(18, 26, 2, 18, 26, 16);
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.3, '#4ade80');
      radGrad.addColorStop(0.7, '#15803d');
      radGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = radGrad;
      ctx.fillRect(6, 6, 24, 40);

      // Glowing Portal Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('FARM', 8, 28);
      scene.textures.addCanvas('prop_portal_green', canvas);
    }
  }

  // --- ITEM ICONS ---
  private static createItemIcons(scene: Phaser.Scene): void {
    // 1. Wood Bundle
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#6e4420';
      ctx.fillRect(3, 4, 18, 6);
      ctx.fillRect(3, 13, 18, 6);
      ctx.fillStyle = '#9c6637';
      ctx.fillRect(4, 5, 16, 2);
      ctx.fillRect(4, 14, 16, 2);
      // Rope binding
      ctx.fillStyle = '#e6c875';
      ctx.fillRect(8, 3, 3, 17);
      ctx.fillRect(15, 3, 3, 17);
      scene.textures.addCanvas('item_wood', canvas);
    }

    // 2. Electronic Scrap & Gold Jack
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(3, 20);
      ctx.bezierCurveTo(8, 2, 16, 22, 21, 6);
      ctx.stroke();
      // Gold Connector Jack
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(18, 4, 5, 5);
      ctx.fillRect(1, 18, 5, 5);
      scene.textures.addCanvas('item_scrap', canvas);
    }

    // 3. Neon Glowstick
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(8, 2, 8, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 4, 4, 16);
      // Lanyard loop on top
      ctx.strokeStyle = '#00cc52';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(9, 1, 6, 3);
      scene.textures.addCanvas('item_glowstick', canvas);
    }

    // 4. Master Vinyl (180g)
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#0d0d12';
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.fill();
      // Grooves sheen
      ctx.strokeStyle = '#282836';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.arc(12, 12, 6, 0, Math.PI * 2);
      ctx.stroke();
      // Center Pink Label & Spindle hole
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(12, 12, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, 12, 1, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('item_vinyl', canvas);
    }

    // 5. Gold Audio Cable
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 1.6);
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(18, 8, 5, 4);
      ctx.fillStyle = '#222';
      ctx.fillRect(16, 9, 2, 2);
      scene.textures.addCanvas('item_audio_cable', canvas);
    }

    // 6. Skateboard Wheels
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      // Red Urethane Wheel
      ctx.fillStyle = '#ff2255';
      ctx.beginPath();
      ctx.arc(8, 12, 6, 0, Math.PI * 2);
      ctx.arc(16, 12, 6, 0, Math.PI * 2);
      ctx.fill();
      // Chrome Bearings
      ctx.fillStyle = '#e6edf2';
      ctx.beginPath();
      ctx.arc(8, 12, 3, 0, Math.PI * 2);
      ctx.arc(16, 12, 3, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('item_skate_wheels', canvas);
    }

    // 7. Goblin Energy Drink
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#00ffcc';
      ctx.fillRect(7, 3, 10, 18);
      ctx.fillStyle = '#00bfa5';
      ctx.fillRect(7, 3, 2, 18);
      // Neon Lightning Bolt
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.moveTo(13, 6);
      ctx.lineTo(10, 12);
      ctx.lineTo(13, 12);
      ctx.lineTo(11, 18);
      ctx.lineTo(15, 11);
      ctx.lineTo(12, 11);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas('item_energy_drink', canvas);
    }

    // 8. Glow Sirup Bottle
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#ff00ea';
      ctx.fillRect(6, 6, 12, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 8, 3, 10); // glass shine
      // Cork
      ctx.fillStyle = '#9c6637';
      ctx.fillRect(9, 2, 6, 4);
      scene.textures.addCanvas('item_glow_syrup', canvas);
    }

    // 9. Fog Machine Spark Plug
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#c5ccd4';
      ctx.fillRect(8, 4, 8, 14);
      ctx.fillStyle = '#7a8594';
      ctx.fillRect(8, 8, 8, 4);
      // Electric Arc Tip
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(10, 18, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 19, 2, 2);
      scene.textures.addCanvas('item_fog_plug', canvas);
    }

    // 10. Golden Post-It Block (Scrum Master Leander)
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(4, 5, 16, 16);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(3, 4, 16, 16);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(4, 5, 14, 3);
      // Checklist marks
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6, 10, 2, 2);
      ctx.fillRect(10, 10, 7, 1);
      ctx.fillRect(6, 14, 2, 2);
      ctx.fillRect(10, 14, 7, 1);
      scene.textures.addCanvas('item_sticky_notes', canvas);
    }

    // 11. Double Oat Espresso (Scrum Master Leander)
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      // White ceramic cup
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(5, 6, 14, 14);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(6, 6, 12, 13);
      // Cup handle
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.strokeRect(17, 8, 4, 8);
      // Rich crema coffee surface
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, 7, 10, 4);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(8, 8, 8, 2);
      // Latte art heart
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 8, 2, 2);
      scene.textures.addCanvas('item_espresso', canvas);
    }

    // 12. Magic Bio Cannabis Seeds (Henning)
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      // Burlap Seed Pouch
      ctx.fillStyle = '#78350f';
      ctx.fillRect(5, 7, 14, 14);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(6, 8, 12, 12);
      // Tied pouch top
      ctx.fillStyle = '#facc15';
      ctx.fillRect(8, 4, 8, 4);
      // Green Leaf Stamp
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(11, 11, 2, 6);
      ctx.fillRect(9, 13, 6, 2);
      scene.textures.addCanvas('item_magic_seeds', canvas);
    }

    // 13. Crystal Vaporizer / Herbal Bong (Henning)
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      // Glass Base Chamber
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(12, 17, 6, 0, Math.PI * 2);
      ctx.fill();
      // Glowing green herbal water
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(12, 18, 4, 0, Math.PI * 2);
      ctx.fill();
      // Glass neck
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(11, 3, 3, 11);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 2, 5, 2); // mouthpiece
      scene.textures.addCanvas('item_vintage_bong', canvas);
    }
  }

  // --- PARTICLES ---
  private static createParticleTextures(scene: Phaser.Scene): void {
    // 1. Confetti
    {
      const { canvas, ctx } = this.createCanvas(6, 6);
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(0, 0, 6, 6);
      scene.textures.addCanvas('particle_confetti', canvas);
    }

    // 2. Glow Sparkle
    {
      const { canvas, ctx } = this.createCanvas(12, 12);
      const radGrad = ctx.createRadialGradient(6, 6, 1, 6, 6, 6);
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.4, 'rgba(0, 255, 230, 0.9)');
      radGrad.addColorStop(1, 'rgba(0, 255, 230, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, 12, 12);
      scene.textures.addCanvas('particle_sparkle', canvas);
    }

    // 3. Music Note
    {
      const { canvas, ctx } = this.createCanvas(14, 14);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(8, 2, 2, 8);
      ctx.fillRect(8, 2, 5, 3);
      ctx.beginPath();
      ctx.arc(7, 10, 3.5, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('particle_note', canvas);
    }
  }

  // --- UI TEXTURES ---
  private static createUITextures(scene: Phaser.Scene): void {
    // Exclamation Icon
    {
      const { canvas, ctx } = this.createCanvas(22, 22);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(11, 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('!', 9, 15);
      scene.textures.addCanvas('icon_quest_exclamation', canvas);
    }

    // Checkmark Icon
    {
      const { canvas, ctx } = this.createCanvas(22, 22);
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(11, 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('✓', 7, 14);
      scene.textures.addCanvas('icon_quest_complete', canvas);
    }

    // Touch Joystick Base & Knob
    {
      const { canvas, ctx } = this.createCanvas(96, 96);
      ctx.fillStyle = 'rgba(20, 14, 33, 0.65)';
      ctx.beginPath();
      ctx.arc(48, 48, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      scene.textures.addCanvas('ui_stick_base', canvas);
    }
    {
      const { canvas, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = 'rgba(255, 0, 128, 0.85)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      scene.textures.addCanvas('ui_stick_knob', canvas);
    }
  }
}
