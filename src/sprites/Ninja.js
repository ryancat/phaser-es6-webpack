import Phaser from 'phaser'
import _ from 'lodash'

const NINJA_SPEED = 160
const SPEED_SENSITIVITY = 13

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset, options={} }) {
    super(game, x, y, asset)

    this.game = game
    this.anchor.setTo(0.5)
    this.cursor = game.input.keyboard.createCursorKeys();

    this.orientation = options.orientation || {}

    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;

    // Ninja move map
    this.ninjaMoveMap = {
      left: () => {
        this.body.velocity.x = -NINJA_SPEED
      },

      right: () => {
        this.body.velocity.x = NINJA_SPEED
      },

      up: () => {
        this.body.velocity.y = -NINJA_SPEED
      },

      down: () => {
        this.body.velocity.y = NINJA_SPEED
      },

      horizontal: (multiplier) => {
        this.body.velocity.x = NINJA_SPEED * multiplier / SPEED_SENSITIVITY
      },

      vertical: (multiplier) => {
        this.body.velocity.y = NINJA_SPEED * multiplier / SPEED_SENSITIVITY
      }
    }

  }

  update () {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    let gamma0 = this.orientation.startGamma,
        gamma = this.orientation.gamma,
        dGamma = gamma - gamma0,
        gammaMax = gamma0 + 180,
        gammaMin = gamma0 - 180,
        beta0 = this.orientation.startBeta,
        beta = this.orientation.beta,
        dBeta = beta - beta0,
        betaMax = beta0 + 180,
        betaMin = beta0 - 180,
        gammaMultiplier = dGamma,
        betaMultiplier = dBeta

    // Basic move for mobile
    if (dGamma > gammaMax) {
      gammaMultiplier = dGamma - 360
    } else if (dGamma < gammaMin) {
      gammaMultiplier = dGamma + 360
    }

    if (dBeta > betaMax) {
      betaMultiplier = dBeta - 360
    } else if (dBeta < betaMin) {
      betaMultiplier = dBeta + 360
    }

    this.game.devText += ', ' + gamma + ', ' + gammaMultiplier

    this.ninjaMoveMap.horizontal(gammaMultiplier)
    // this.ninjaMoveMap.vertical(betaMultiplier)

    // Basic move for desktop
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
