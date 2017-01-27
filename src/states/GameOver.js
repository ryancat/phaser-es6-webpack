import Phaser from 'phaser'

export default class extends Phaser.State {

  init (stateProp = {}) {
    this.stateProp = stateProp
    let restartKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    restartKey.onDown.addOnce(this.gameRestart, this)
  }

  create () {
    // let mainCanvas = document.getElementById('content').getElementsByTagName('canvas')[0]
    // this.captureImgDataURL = mainCanvas.toDataURL('image/png')

    // Create background layer3 
    this.createBackground3()

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

  // TODO: USE this.stateProp.captureDataURLs to draw one image and one text canvas layer

  // Background for text layer
  createBackground3 () {
    // Add background
    this.backgroundLayer3 = document.createElement('div')
    this.backgroundLayer3.classList.add('centerText')
    let width = this.game.world.width
    let height = this.game.world.height

    this.backgroundLayer3.style.width = width + 'px'
    this.backgroundLayer3.style.height = height + 'px'
    this.backgroundLayer3.style.color = '#FFFFFF'
    this.backgroundLayer3.style.fontFamily = 'Bangers'

    this.updateBackgroundLayer3()

    document.getElementById('background3').appendChild(this.backgroundLayer3)
  }

  updateBackgroundLayer3 () {

    // Background
    let captureImgElement = document.createElement('img')
    captureImgElement.classList.add('captureImg')
    captureImgElement.setAttribute('src', this.stateProp.captureDataURL)
    this.backgroundLayer3.appendChild(captureImgElement)

    // Show text
    let gameOverText = "<h1>Game Over</h1>\n<h3>You killed " 
      + (this.stateProp.killBossCount || 0) 
      + " bosses</h3>\n<h3>Your longest time count is " 
      + (this.stateProp.longestTimeCount || 0) 
      + "s</h3>\n<h1 class=\"restart\">Restart!</h1>"

    let gameOverTextElement = document.createElement('div')
    gameOverTextElement.innerHTML = gameOverText

    // let text = this.add.text(
    //   this.world.centerX, 
    //   this.game.height * 0.1, 
    //   gameOverText, 
    //   { font: '16px Arial', fill: '#dddddd', align: 'center' })

    this.backgroundLayer3.appendChild(gameOverTextElement)

  }

  gameRestart () {
    this.resetBackgroundLayer()
    this.state.start('Game')
  }

  resetBackgroundLayer () {
    this.backgroundLayer3.parentNode.removeChild(this.backgroundLayer3)
  }

}
