import _ from 'lodash'

import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset, initVelocityX, initVelocityY }) {
    super(game, x, y, asset)

    this.game = game
    this.anchor.setTo(0.5)

    this.cursor = game.input.keyboard.createCursorKeys();

    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.bounce.x = 1;
    this.body.bounce.y = 1;

    this.currentVelocityX = initVelocityX
    this.currentVelocityY = initVelocityY

    this.body.velocity.x = this.currentVelocityX;
    this.body.velocity.y = this.currentVelocityY;

    this.tint = 0xff7b60
  }

  update () {

  }

}
