import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/Boot'
import SplashState from './states/Splash'
import GameState from './states/Game'
import GameOverState from './states/GameOver'

class Game extends Phaser.Game {

  constructor () {
    let width = document.documentElement.clientWidth
    let height = document.documentElement.clientHeight

    super(width, height, Phaser.CANVAS, 'content', null, true)
    
    // State manager
    this.state.add('Boot', BootState)
    this.state.add('Splash', SplashState)
    this.state.add('Game', GameState)
    this.state.add('Game Over', GameOverState)

    this.state.start('Boot')
  }
}

// width, height, renderer, parent, state, transparent, antialias, physicsConfig
window.game = new Game()
// For debug
window.dotninja = {
  debug: () => {
    document.querySelector('body').style.overflow = 'scroll'
    document.querySelectorAll('.gameLayer').forEach((layer) => { layer.style.position = 'relative' })
  }
}