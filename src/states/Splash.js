import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    // this.ninja = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'ninja')
    // this.baddie = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'baddie')
    // centerGameObjects([this.loaderBg, this.loaderBar])

    // this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    // this.load.image('', 'assets/images/mushroom2.png')
    this.load.image('ninja', './assets/images/ninja.png')
    this.load.image('baddie', './assets/images/baddie.png')
  }

  create () {
    this.state.start('Game')
  }

}
