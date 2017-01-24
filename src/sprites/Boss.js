import _ from 'lodash'

import Phaser from 'phaser'
import Baddie from './Baddie.js'

export default class extends Baddie {

  constructor ({ game, x, y, asset, initVelocityX, initVelocityY }) {
    super({game, x, y, asset, initVelocityX, initVelocityY})

    this.tint = 0xff7b60;
  }

  update () {

  }

}
