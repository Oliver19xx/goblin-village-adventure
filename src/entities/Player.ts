import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed: number = 160;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  // Virtual joystick vector for mobile (-1 to 1)
  public joystickVector: { x: number; y: number } = { x: 0, y: 0 };
  public isInteracting: boolean = false;
  public isDancing: boolean = false;

  private walkTimer: number = 0;
  private walkFrame: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'valentin_idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(18, 14);
    this.setOffset(7, 18);
    this.setDepth(10);

    this.setupControls();
  }

  private setupControls(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = this.scene.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
      }) as typeof this.wasdKeys;
    }
  }

  public update(_time: number, delta: number): void {
    if (this.isDancing) {
      this.setVelocity(0, 0);
      this.setTexture('valentin_dance');
      return;
    }

    let vx = 0;
    let vy = 0;

    // Keyboard Input
    if (this.cursors && this.wasdKeys) {
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
      if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
      if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;
    }

    // Joystick Input override/blend
    if (Math.abs(this.joystickVector.x) > 0.1 || Math.abs(this.joystickVector.y) > 0.1) {
      vx = this.joystickVector.x;
      vy = this.joystickVector.y;
    }

    // Normalize diagonal velocity
    const length = Math.sqrt(vx * vx + vy * vy);
    if (length > 0) {
      vx = (vx / length) * this.moveSpeed;
      vy = (vy / length) * this.moveSpeed;
      this.setVelocity(vx, vy);

      // Flip sprite based on direction
      if (vx < 0) this.setFlipX(true);
      else if (vx > 0) this.setFlipX(false);

      // Walk cycle animation
      this.walkTimer += delta;
      if (this.walkTimer > 150) {
        this.walkTimer = 0;
        this.walkFrame = this.walkFrame === 1 ? 2 : 1;
        this.setTexture(`valentin_walk${this.walkFrame}`);
      }
    } else {
      this.setVelocity(0, 0);
      this.setTexture('valentin_idle');
    }
  }
}
