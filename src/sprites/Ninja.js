import Phaser from 'phaser'

const NINJA_SPEED = 160

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset, options={} }) {
    super(game, x, y, asset)

    this.game = game
    this.anchor.setTo(0.5)
    this.cursor = game.input.keyboard.createCursorKeys();

    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;

    // Ninja move map
    this.ninjaMoveMap = {
      left: () => {
        //  Move to the left
        this.body.velocity.x = -NINJA_SPEED;

        // Ninja flip
        if (this.game.gameConfig.allowNinjaPassBorder) {
          if (this.position.x === this.width / 2) {
            this.position.x = this.game.world.width;
            //  Move to the left
            this.body.velocity.x = -NINJA_SPEED;
          }
        }
        
      },

      right: () => {
        //  Move to the left
        this.body.velocity.x = NINJA_SPEED;

        // Ninja flip
        if (this.game.gameConfig.allowNinjaPassBorder) {
          if (this.position.x === game.world.width - this.width / 2) {
            this.position.x = 0;
            //  Move to the left
            this.body.velocity.x = NINJA_SPEED;
          }
        }
      },

      up: () => {
        //  Move to the left
        this.body.velocity.y = -NINJA_SPEED;

        // Ninja flip
        if (this.game.gameConfig.allowNinjaPassBorder) {
          if (this.position.y === this.height / 2) {
            this.position.y = this.game.world.height;
            //  Move to the left
            this.body.velocity.y = -NINJA_SPEED;
          }
        }
      },

      down: () => {
        //  Move to the left
        this.body.velocity.y = NINJA_SPEED;

        // Ninja flip
        if (this.game.gameConfig.allowNinjaPassBorder) {
          if (this.position.y === game.world.height - this.width / 2) {
            this.position.y = 0;
            //  Move to the left
            this.body.velocity.y = NINJA_SPEED;
          }
        }
      }
    }

  }

  update () {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    // Basic move
    if (this.cursor.left.isDown) {
      this.ninjaMoveMap.left()
    }
    
    if (this.cursor.right.isDown) {
      this.ninjaMoveMap.right()
    }
    
    if (this.cursor.up.isDown) {
      this.ninjaMoveMap.up()
    }
    
    if (this.cursor.down.isDown) {
      this.ninjaMoveMap.down()
    }
  }

}
