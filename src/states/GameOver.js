import Phaser from 'phaser'

export default class extends Phaser.State {

  init (stateProp = {}) {
    this.stateProp = stateProp
    let restartKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    restartKey.onDown.addOnce(this.gameRestart, this)
  }

  create () {

    let gameOverText = "Game Over\nYou killed " 
      + (this.stateProp.killBossCount || 0)
      + " bosses!\nYour longest time count is " 
      + (this.stateProp.longestTimeCount || 0)
      + "s\nPress Space key to restart..."

    let text = this.add.text(
      this.world.centerX, 
      this.game.height * 0.1, 
      gameOverText, 
      { font: '16px Arial', fill: '#dddddd', align: 'center' })

    text.anchor.setTo(0.5, 0.5)

    // const bannerText = 'Phaser + ES6 + Webpack'
    // let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    // banner.font = 'Bangers'
    // banner.padding.set(10, 16)
    // banner.fontSize = 40
    // banner.fill = '#77BFA3'
    // banner.smoothed = false
    // banner.anchor.setTo(0.5)
  }

  update () {
    if (this.game.input.pointer1.isDown) {
      this.gameRestart()
    }
  }

  gameRestart () {
    this.state.start('Game')
  }

}
