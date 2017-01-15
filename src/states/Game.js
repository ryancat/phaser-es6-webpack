/* globals __DEV__ */
import Phaser from 'phaser'
import Ninja from '../sprites/Ninja'
import Baddie from '../sprites/Baddie'

export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    // const bannerText = 'Phaser + ES6 + Webpack'
    // let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    // banner.font = 'Bangers'
    // banner.padding.set(10, 16)
    // banner.fontSize = 40
    // banner.fill = '#77BFA3'
    // banner.smoothed = false
    // banner.anchor.setTo(0.5)

    this.createScoreText()
    this.createHighScoreText()
    this.countSec()
    this.createNinja()

    // Add baddie
    this.baddies = this.game.add.group()

    for (let i = 0; i < 30; i++) {
      this.baddies.add(new Baddie({
        game: this,
        x: this.world.centerX + Math.random() * this.world.centerX,
        y: this.world.centerY + Math.random() * this.world.centerY,
        asset: 'baddie'
      }))
    }
  }

  update () {
    this.game.physics.arcade.overlap(this.ninja, this.baddies, this.collideNinjaBaddies, null, this)


  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.ninja, 32, 32)
    }
  }

  createScoreText () {
    this.secCount = 0
    this.scoreText = this.game.add.text(16, this.game.world.height - 40, 'score: ' + this.secCount + 's', { fontSize: '32px', fill: '#FFF' })
  }

  countSec () {
    this.scoreText.text = 'score: ' + this.secCount++ + 's'
    this.countSecTimout = setTimeout(this.countSec.bind(this), 1000)
  }

  stopCount () {
    clearTimeout(this.countSecTimout)
  }

  createHighScoreText () {
    this.highScores = [0]
    this.highScoreText = this.game.add.text(this.game.world.width - 50, this.game.world.height - 120, this.getHighScoreText(), { fontSize: '16px', fill: '#FFF' })
  }

  recordHighscore () {
    this.highScores.push(this.secCount)
    this.highScores = this.highScores.sort().reverse()
    if (this.highScores.length > 3) {
      this.highScores.pop()
    }
    this.highScoreText.text = this.getHighScoreText()
  }

  getHighScoreText () {
    let sortedHighScores = this.highScores.map((score) => {
      return score + 's'
    }).join('\n')

    return this.secCount + 's\n\n' + sortedHighScores
  }

  createNinja () {
    this.ninja = new Ninja({
      game: this,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'ninja'
    })

    this.game.add.existing(this.ninja)
  }

  collideNinjaBaddies (ninja, baddie) {
    this.killNinja(ninja, baddie)
  }

  killNinja (ninja, baddie) {
    let that = this,
        countDown = 3
    
    this.stopCount()
    this.recordHighscore()
    ninja.kill()
    this.ninjaRespawn(countDown)

    setTimeout(function () {
      that.createNinja()
      that.secCount = 0
      that.countSec()
    }, 1000 * countDown)

  }

  ninjaRespawn (countDown) {
    const countdownfn = () => {
      if (countDown >= 0) {
        this.scoreText.text = 'Respawn: ' + countDown-- + 's' 
        setTimeout(countdownfn, 1000)
      }
    }

    countdownfn()
  }
}
