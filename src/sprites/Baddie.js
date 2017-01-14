import _ from 'lodash'

import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    this.game = game
    this.anchor.setTo(0.5)

    this.cursor = game.input.keyboard.createCursorKeys();

    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.bounce.x = 1;
    this.body.bounce.y = 1;

    // init speed
    const xVelocitySeed = (Math.random() - 0.5) * 2
    const yVelocitySeed = (Math.random() - 0.5) * 2

    this.currentVelocityX = xVelocitySeed > 0 ? 80 + xVelocitySeed * 120 : -80 + xVelocitySeed * 120
    this.currentVelocityY = yVelocitySeed > 0 ? 80 + yVelocitySeed * 120 : -80 + yVelocitySeed * 120
    
    this.body.velocity.x = this.currentVelocityX;
    this.body.velocity.y = this.currentVelocityY;
  }

  update () {


    // this.body.velocity.x = this.currentVelocityX;
    // this.body.velocity.y = this.currentVelocityY;

    // if (!this.hittingEdgeX && this.position.x >= game.world.width - this.width / 2) {
    //   this.currentVelocityX = -this.currentVelocityX;
    //   this.hittingEdgeX = true;
    // } else {
    //   this.hittingEdgeX = false;
    // }

    // // Basic move
    // if (this.cursor.left.isDown) {
    //   //  Move to the left
    //   this.body.velocity.x = -130;
    // }
    
    // if (this.cursor.right.isDown) {
    //   //  Move to the left
    //   this.body.velocity.x = 130;
    // }
    
    // if (this.cursor.up.isDown) {
    //   //  Move to the left
    //   this.body.velocity.y = -130;
    // }
    
    // if (this.cursor.down.isDown) {
    //   //  Move to the left
    //   this.body.velocity.y = 130;
    // }

  }

}
