/* globals __DEV__ */
import Phaser from 'phaser'
import Ninja from '../sprites/Ninja'
import Baddie from '../sprites/Baddie'

export default class extends Phaser.State {

  constructor () {
    super()

    this.ninjaEvents = []
    this.gameStartTimestamp = Date.now()
    this.baddieStates = []
  }

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

    // Add baddie
    this.baddies = this.game.add.group()
    this.createBaddies()

    this.createNinja()

  }

  update () {
    this.game.physics.arcade.overlap(this.ninja, this.baddies, this.collideNinjaBaddies, null, this)

    // Record last ninja move
    if (this.ninja.exists && !this.isRecording) {
      if (!this.leftIsDown && this.ninja.cursor.left.isDown) {
        this.ninjaEvents.push({
          timestamp: Date.now() - this.gameStartTimestamp,
          key: 'left',
          type: 'down'
        })
        this.leftIsDown = true
        console.log('key add', this.ninjaEvents)
      }

      if (this.leftIsDown && !this.ninja.cursor.left.isDown) {
        this.ninjaEvents.push({
          timestamp: Date.now() - this.gameStartTimestamp,
          key: 'left',
          type: 'up'
        })
        this.leftIsDown = false
        console.log('key add', this.ninjaEvents)
      }

      if (!this.rightIsDown && this.ninja.cursor.right.isDown) {
        this.ninjaEvents.push({
          timestamp: Date.now() - this.gameStartTimestamp,
          key: 'right',
          type: 'down'
        })
        this.rightIsDown = true
        console.log('key add', this.ninjaEvents)
      }

      if (this.rightIsDown && !this.ninja.cursor.right.isDown) {
        this.ninjaEvents.push({
          timestamp: Date.now() - this.gameStartTimestamp,
          key: 'right',
          type: 'up'
        })
        this.rightIsDown = false
        console.log('key add', this.ninjaEvents)
      }

      if (!this.upIsDown && this.ninja.cursor.up.isDown) {
        this.ninjaEvents.push({
          timestamp: Date.now() - this.gameStartTimestamp,
          key: 'up',
          type: 'down'
        })
        this.upIsDown = true
        console.log('key add', this.ninjaEvents)
      }

      if (this.upIsDown && !this.ninja.cursor.up.isDown) {
        this.ninjaEvents.push({
          timestamp: Date.now() - this.gameStartTimestamp,
          key: 'up',
          type: 'up'
        })
        this.upIsDown = false
        console.log('key add', this.ninjaEvents)
      }

      if (!this.downIsDown && this.ninja.cursor.down.isDown) {
        this.ninjaEvents.push({
          timestamp: Date.now() - this.gameStartTimestamp,
          key: 'down',
          type: 'down'
        })
        this.downIsDown = true
        console.log('key add', this.ninjaEvents)
      }

      if (this.downIsDown && !this.ninja.cursor.down.isDown) {
        this.ninjaEvents.push({
          timestamp: Date.now() - this.gameStartTimestamp,
          key: 'down',
          type: 'up'
        })
        this.downIsDown = false
        console.log('key add', this.ninjaEvents)
      }
    }
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

  createBaddies (baddieStates = []) {
    // Kill all existing baddies
    if (this.baddies) {
      this.baddies.forEach((baddie) => { baddie.kill() })
    }

    if (baddieStates.length === 0) {
      this.baddieStates = []
    }

    for (let i = 0; i < 30; i++) {
      let baddieState

      if (baddieStates.length) {
        baddieState = baddieStates[i]
      } else {
        // init speed
        const xVelocitySeed = (Math.random() - 0.5) * 2
        const yVelocitySeed = (Math.random() - 0.5) * 2

        baddieState = {
          game: this,
          x: this.world.centerX + (Math.random() - 0.5) * 2 * this.world.centerX,
          y: this.world.centerY + (Math.random() - 0.5) * 2 * this.world.centerY,
          asset: 'baddie',
          initVelocityX: xVelocitySeed > 0 ? 80 + xVelocitySeed * 120 : -80 + xVelocitySeed * 120,
          initVelocityY: yVelocitySeed > 0 ? 80 + yVelocitySeed * 120 : -80 + yVelocitySeed * 120
        }
      }
      
      this.baddieStates.push(baddieState)
      this.baddies.add(new Baddie(baddieState))
    }
  }

  createNinja (options = {}) {
    this.ninja = new Ninja({
      game: this,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'ninja',
      options
    })

    this.game.add.existing(this.ninja)

    this.createBaddies(this.baddieStates)

    this.gameStartTimestamp = Date.now()
  }

  collideNinjaBaddies (ninja, baddie) {
    this.killNinja(ninja, baddie)
  }

  killNinja (ninja, baddie) {
    let that = this,
        countDown = 3,
        options = {}
    
    this.stopCount()
    this.recordHighscore()
    ninja.kill()
    this.ninjaRespawn(countDown)

    this.isRecording = !this.isRecording

    options.isRecording = this.isRecording
    if (this.isRecording) {
      options.isRecording = true
      options.ninjaEvents = this.ninjaEvents
    } else {
      this.ninjaEvents = []
    }

    setTimeout(function () {
      that.createNinja(options)
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

  // Key press handling
  triggerPressKey () {
    let keyboardEvent = document.createEvent("KeyboardEvent"),
        initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";


    keyboardEvent[initMethod](
                       "keypress", // event type : keydown, keyup, keypress
                        true, // bubbles
                        true, // cancelable
                        window, // viewArg: should be window
                        false, // ctrlKeyArg
                        false, // altKeyArg
                        false, // shiftKeyArg
                        false, // metaKeyArg
                        40, // keyCodeArg : unsigned long the virtual key code, else 0
                        0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
    );
    document.dispatchEvent(keyboardEvent);
  }
}
