import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    this.game = game
    this.anchor.setTo(0.5)

    this.cursor = game.input.keyboard.createCursorKeys();

    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
  }

  update () {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    // Basic move
    if (this.cursor.left.isDown) {
      //  Move to the left
      this.body.velocity.x = -150;
    }
    
    if (this.cursor.right.isDown) {
      //  Move to the left
      this.body.velocity.x = 150;
    }
    
    if (this.cursor.up.isDown) {
      //  Move to the left
      this.body.velocity.y = -150;
    }
    
    if (this.cursor.down.isDown) {
      //  Move to the left
      this.body.velocity.y = 150;
    }

    // Ninja flip
    if (this.position.x === this.width / 2) {
      if (this.cursor.left.isDown) {
        this.position.x = this.game.world.width;
        //  Move to the left
        this.body.velocity.x = -150;
      }
    }

    if (this.position.x === game.world.width - this.width / 2) {
      if (this.cursor.right.isDown) {
        this.position.x = 0;
        //  Move to the left
        this.body.velocity.x = 150;
      }
    }

    if (this.position.y === this.height / 2) {
      if (this.cursor.up.isDown) {
        this.position.y = this.game.world.height;
        //  Move to the left
        this.body.velocity.y = -150;
      }
    }

    if (this.position.y === game.world.height - this.width / 2) {
      if (this.cursor.down.isDown) {
        this.position.y = 0;
        //  Move to the left
        this.body.velocity.y = 150;
      }
    }

  }

}
