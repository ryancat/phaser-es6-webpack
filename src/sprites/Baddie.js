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
      this.body.velocity.x = -130;
    }
    
    if (this.cursor.right.isDown) {
      //  Move to the left
      this.body.velocity.x = 130;
    }
    
    if (this.cursor.up.isDown) {
      //  Move to the left
      this.body.velocity.y = -130;
    }
    
    if (this.cursor.down.isDown) {
      //  Move to the left
      this.body.velocity.y = 130;
    }

  }

}
