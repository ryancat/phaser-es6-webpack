/* globals __DEV__ */
import Phaser from 'phaser'

import Ninja from '../sprites/Ninja'
import Baddie from '../sprites/Baddie'
import Boss from '../sprites/Boss'

export default class extends Phaser.State {

  constructor () {
    super()
    // DEV only
    window.printM = this.printMeasure
  }

  init (options = {}) {
    console.log('game init', options)

    let that = this,
        device = this.game.device

    // make the game occuppy all available space, but respecting
    // aspect ratio – with letterboxing if needed
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    
    // Adding accelerator support for mobile
    this.orientation = {
      startBeta: null,
      startGamma: null
    }

    // if (device.touch && !device.desktop) {
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (eventData) => {
          if (that.orientation.startBeta === null) {
            that.orientation.startBeta = eventData.beta
          }

          if (that.orientation.startGamma === null) {
            that.orientation.startGamma = eventData.gamma
          }

          that.orientation.beta = eventData.beta
          that.orientation.gamma = eventData.gamma
        });
      }
    // }

    // Config (immutable)
    this.gameConfig = {
      recordingGame: false,
      sameBaddies: false,
      numOfBaddies: 20,
      allowNinjaPassBorder: false,
      ninjaLives: 3,
      countDown: 10
    }

    // Game inner states
    this.mainCanvas = document.getElementById('content').getElementsByTagName('canvas')[0]
    this.spriteScale = this.game.world.width / 600
    this.baddieStates = []
    this.gameLevel = 1
    this.numOfBaddies = this.gameLevel
    this.longestTimeCount = this.gameConfig.countDown
    this.captureDataURLs = []

    // Get state from server
    this.totalPlayCountPromise = new Promise((resolve, reject) => {
      // Get async counts
      setTimeout(() => {
        resolve(100)
      }, 5000)
    })
    .then((val) => {
      console.log('total play count', val)
      that.totalPlayCount = val
    })

    // Measures
    this.initMeasure()

    // Listeners
  }

  preload () {}

  create () {
    this.createBackground1()
    this.createBackground2()

    this.createCountDownText()
    // this.createHighScoreText()
    this.countSec()

    // Add Ninja
    this.createNinja({
      orientation: this.orientation
    })

    // Add baddie
    this.baddies = this.game.add.group()
    this.createBaddies()

    // Add boss
    this.createBoss()

    // Start recording gif
    // this.gifRecord = new GIF({
    //   workers: 10,
    //   quality: 10
    // })

    // let mainCanvas = document.getElementById('content').getElementsByTagName('canvas')[0]
    // this.gifRecord.addFrame(mainCanvas)
    // this.gifRecord.on('finished', (blob) => {
    // });

    // this.gifRecord.render()

    // this.capturer = new CCapture({ 
    //   format: 'jpg',
    //   quanlity: 10
    // })

    // this.capturer.start()
    
    // Capture
    this.captureDataURLs.push(this.mainCanvas.toDataURL('image/png'))
  }

  update () {
    this.game.physics.arcade.overlap(this.ninja, this.baddies, this.collideNinjaBaddies, null, this)
    this.game.physics.arcade.overlap(this.ninja, this.boss, this.collideNinjaBoss, null, this)
  }

  render () { 
    // this.capturer.capture(this.mainCanvas)
  }

  // Background for timeout counters
  createBackground1 () {
    // Add background if not exist
    if (!this.backgroundLayer1) {
      this.backgroundLayer1 = this.backgroundLayer1 || document.createElement('canvas')
      let width = this.game.world.width
      let height = this.game.world.height

      this.backgroundLayer1.width = width
      this.backgroundLayer1.height = height

      let backgroundCtx = this.backgroundLayer1.getContext('2d')

      document.getElementById('background1').appendChild(this.backgroundLayer1)

    }
    
    this.updateBackgroundLayer1()
  }

  updateBackgroundLayer1 () {
    // Add the count down progress
    let backgroundCtx = this.backgroundLayer1.getContext('2d')
    let countPercentage = (1 - Math.min(this.countDown / 10, 1)).toFixed(2)
    // let countPercentagePow = 1 - Math.min(Math.pow(this.countDown / 10, 2), 1)
    let width = this.game.world.width
    let height = this.game.world.height

    backgroundCtx.clearRect(0, 0, width, height)
    backgroundCtx.fillStyle = 'rgba(255' + ', 0, 0, ' + (0.2 * countPercentage).toFixed(2) + ')'
    backgroundCtx.fillRect(0, height * countPercentage, width, height)

  }

  // Background for kill boss counters
  createBackground2 () {
    // Add background if not exist
    if (!this.backgroundLayer2) {
      this.backgroundLayer2 = this.backgroundLayer2 || document.createElement('canvas')
      this.backgroundLayer2.classList.add('centerText')
      let width = this.game.world.width
      let height = this.game.world.height

      this.backgroundLayer2.width = width
      this.backgroundLayer2.height = height

      let backgroundCtx = this.backgroundLayer2.getContext('2d')
      backgroundCtx.fillStyle = 'rgba(124, 93, 96, 0.3)'
      backgroundCtx.font = Math.min(width, height) + 'px Bangers'
      backgroundCtx.textAlign = 'center'
      backgroundCtx.textBaseline = 'middle'

      document.getElementById('background2').appendChild(this.backgroundLayer2)

    }

    this.updateBackgroundLayer2()
  }

  updateBackgroundLayer2 () {
    let backgroundCtx = this.backgroundLayer2.getContext('2d')
    let width = this.game.world.width
    let height = this.game.world.height
    backgroundCtx.clearRect(0, 0, width, height)
    backgroundCtx.fillText(this.gameLevel, width / 2, height / 2)
  }

  createCountDownText () {
    this.countDown = this.gameConfig.countDown || 10
    // this.scoreText = this.game.add.text(16, this.game.world.height - 40, 'Remain: ' + this.countDown + 's', { fontSize: '32px', fill: '#FFF' })
  }

  countSec () {
    if (this.countDown <= 0) {
      // Game over
      this.gameOver()
    }
    else {
      this.countDown = (this.countDown - 0.1).toFixed(1)
      // this.scoreText.text = 'Remain: ' + this.countDown + 's'

      this.updateBackgroundLayer1()

      // Keep counting down
      this.countSecTimout = setTimeout(this.countSec.bind(this), 100)
    }
  }

  addSec (secondToAdd = 5) {
    this.countDown = (+this.countDown) + (+secondToAdd)
    this.longestTimeCount = Math.max(this.longestTimeCount, this.countDown)
  }

  // createHighScoreText () {
  //   this.highScores = [0]
  //   this.highScoreText = this.game.add.text(this.game.world.width - 50, this.game.world.height - 120, this.getHighScoreText(), { fontSize: '16px', fill: '#FFF' })
  // }

  // recordHighscore () {
  //   this.highScores.push(this.countDown)
  //   this.highScores = this.highScores.sort().reverse()
  //   if (this.highScores.length > 3) {
  //     this.highScores.pop()
  //   }
  //   this.highScoreText.text = this.getHighScoreText()
  // }

  // getHighScoreText () {
  //   let sortedHighScores = this.highScores.map((score) => {
  //     return score + 's'
  //   }).join('\n')

  //   return this.countDown + 's\n\n' + sortedHighScores
  // }

  createBaddies () {
    // Kill all existing baddies
    if (this.baddies) {
      this.baddies.forEach((baddie) => { baddie.kill() })
    }

    for (let i = 0; i < (this.numOfBaddies || 1); i++) {
      if (!this.baddieStates[i]) {
        this.baddieStates[i] = this.getNewBaddieState()
      }

      this.addBaddie(this.baddieStates[i])
    }
  }

  getNewBaddieState () {
    // init speed
    const xVelocitySeed = (Math.random() - 0.5) * 2
    const yVelocitySeed = (Math.random() - 0.5) * 2

    let getDim =  (center) => {
      return center + (Math.random() - 0.5) * 2 * center
    }

    let x, y

    do {
      x = getDim(this.world.centerX)
    } while (Math.abs(this.ninja.position.x - x) < 30)

    do {
      y = getDim(this.world.centerY)
    } while (Math.abs(this.ninja.position.y - y) < 30)

    return {
      game: this,
      x: x,
      y: y,
      asset: 'baddie',
      initVelocityX: xVelocitySeed > 0 ? 80 + xVelocitySeed * 120 : -80 + xVelocitySeed * 120,
      initVelocityY: yVelocitySeed > 0 ? 80 + yVelocitySeed * 120 : -80 + yVelocitySeed * 120
    }
  }

  addBaddie (baddieState) {
    if (!baddieState) {
      baddieState = this.getNewBaddieState()
      this.baddieStates.push(baddieState)
    }

    let baddie = new Baddie(baddieState)
    baddie.scale.setTo(this.spriteScale, this.spriteScale)

    return this.baddies.add(baddie)
  }

  // Randomly remove a baddie
  removeBaddie () {
    let baddieToRemove = this.baddies.removeChildAt(0)
    if (baddieToRemove) {
      baddieToRemove.kill()
    }
  }

  createBoss (options = {}) {
    let getDim =  (center) => {
      return center + (Math.random() - 0.5) * 2 * center
    }

    let x, y

    do {
      x = getDim(this.world.centerX)
    } while (Math.abs(this.ninja.position.x - x) < 30)

    do {
      y = getDim(this.world.centerY)
    } while (Math.abs(this.ninja.position.y - y) < 30)

    let bossState = {
      game: this,
      x: x,
      y: y,
      asset: 'baddie',
      initVelocityX: 50 * (1 + this.gameLevel / 10),
      initVelocityY: 50 * (1 + this.gameLevel / 10)
    }

    this.boss = new Boss(bossState)
    this.boss.scale.setTo(this.spriteScale, this.spriteScale)
    this.game.add.existing(this.boss)

  }

  createNinja (options = {}) {
    this.ninja = new Ninja({
      game: this,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'ninja',
      options
    })

    this.ninja.scale.setTo(this.spriteScale, this.spriteScale)

    this.game.add.existing(this.ninja)

    this.startMeasureSession()

    // if (this.gameConfig.sameBaddies === true) {
    //   this.createBaddies(this.baddieStates)
    // } else {
    //   this.createBaddies()
    // }
  }

  collideNinjaBaddies (ninja, baddie) {
    this.killNinja(ninja, baddie)
  }

  collideNinjaBoss (ninja, boss) {
    this.killBoss(ninja, boss)
  }

  killNinja (ninja, baddie) {
    let that = this
    
    // this.stopCount()
    // this.recordHighscore()
    ninja.kill()
    // this.ninjaRespawn(countDown)

    // setTimeout(function () {
    //   that.createNinja()
    //   that.secCount = 0
    //   that.countSec()
    // }, 1000 * countDown)

    // When ninja is killed, game over
    this.gameOver()

    // Ninja respawn soon
    // setTimeout(function () {
    //   that.createNinja()
    // }, 300)

    // // Record the current session
    // this.record()

    // // When ninja get killed, we are going to the prev level
    // this.prevLevel()

  }

  killBoss (ninja, boss) {
    let that = this
    // Capture the moment!
    this.captureDataURLs[0] = this.mainCanvas.toDataURL('image/png')

    // this.stopCount()
    // this.recordHighscore()
    boss.kill()
    // this.ninjaRespawn(countDown)

    // setTimeout(function () {
    //   that.createNinja()
    //   that.secCount = 0
    //   that.countSec()
    // }, 1000 * countDown)

    // this.state.start('Game Intro', true, false, {
    //   gameStage: this.gameStage
    // })
    // 
    
    // When we kill the boss, we are going to the next level
    this.nextLevel()

    // Killing boss reward player time
    this.addSec(this.gameLevel)

    // Boss will respawn soon
    this.createBoss()

  }

  // ninjaRespawn (countDown) {
  //   const countdownfn = () => {
  //     if (countDown >= 0) {
  //       this.scoreText.text = 'Respawn: ' + countDown-- + 's' 
  //       setTimeout(countdownfn, 1000)
  //     }
  //   }

  //   countdownfn()
  // }

  // Measure stat logics
  initMeasure () {
    this.measureStat = {
      sessions: [],
      start: Date.now(),
      end: -1
    }
  }

  startMeasureSession () {
    // End current measure session if exists
    if (this.currentMeasureSession) {
      this.endMeasureSession()
    }

    this.currentMeasureSession = {
      start: Date.now(),
      end: null,
      gameLevel: this.gameLevel,
      bossDeadTime: [],
      snapshots: []
    }

    this.measureStat.sessions.push(this.currentMeasureSession)

    return this.currentMeasureSession
  }

  endMeasureSession () {
    this.currentMeasureSession.end = Date.now()
    this.currentMeasureSession = null
  }

  addMeasure (key) {

    switch(key) {
      case 'boss dead':
        this.currentMeasureSession.bossDeadTime.push(Date.now())

      default:
        this.currentMeasureSession.snapshots.push(this.baddieStates)
    }
  }

  record (key) {
    if (!this.currentMeasureSession) {
      return
    }

    this.currentMeasureSession.name = key

    // After recording, end the current measure session
    this.endMeasureSession()
    
  }

  printMeasure () {
    console.log('all:', this.measureStat)
  }

  ////// LEVELS
  nextLevel (nextStep = 1) {
    this.gameLevel += nextStep
    this.numOfBaddies = this.gameLevel
    this.updateBackgroundLayer2()
    this.addBaddie()

    // this.capturer.capture(this.mainCanvas)
  }

  prevLevel (prevStep = 1) {
    this.gameLevel -= prevStep
    this.numOfBaddies = this.gameLevel
    this.removeBaddie()
  }

  ////// GAME OVER
  gameOver () {
    let that = this
    clearTimeout(this.countSecTimout)

    // this.capturer.stop()
    // this.capturer.save()

    // Capture the backgrounds
    this.captureDataURLs.push(this.backgroundLayer1.toDataURL('image/png'))
    this.captureDataURLs.push(this.backgroundLayer2.toDataURL('image/png'))

    // this.state.start('Game Over', true, false, {
    //   killBossCount: this.gameLevel - 1,
    //   longestTimeCount: this.longestTimeCount,
    //   captureDataURLs: this.captureDataURLs
    // })

    // TODOs
    // Create images to share
    console.log(this.createCapturePng())
    // Create game over text
    this.gameRankPromise = new Promise((resolve, reject) => {
      // Load server game rank
      setTimeout(() => {
        resolve(51)
      }, 2000)
    })
    .then((val) => {
      console.log('game rank', val)
      that.gameRank = val
    })

    this.createFrontground1()

    // Listen on restart trigger
    let restartKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    restartKey.onDown.addOnce(this.gameRestart, this)

  }

  createCapturePng () {
    let imageCanvasBuffer = document.createElement('canvas')
    let imageCanvasBufferCtx = imageCanvasBuffer.getContext('2d')
    this.captureDataURLs.forEach((dataURL) => {
      let img = new Image()
      img.src = dataURL
      imageCanvasBufferCtx.drawImage(img, 0, 0)
    })
    // TODO: check if detached imageCanvasBuffer is memory leak
    return imageCanvasBuffer.toDataURL('image/png')
  }

  // Front ground for game over text
  createFrontground1 () {
    let that = this

    if (!this.frontgroundContainer1) {
      this.frontgroundContainer1 = document.createElement('div')
      this.frontgroundContainer1.id = 'frontgroundContainer1'
      this.frontgroundContainer1.classList.add('centerText')
      let width = this.game.world.width
      let height = this.game.world.height
      let style = this.frontgroundContainer1.style
      style.width = width + 'px'
      style.height = height + 'px'
      

      // Show text
      let gameOverTitle = document.createElement('h1')
      gameOverTitle.innerText = 'GAME OVER'
      this.frontgroundContainer1.appendChild(gameOverTitle)

      // Show rank
      let gameOverRank = document.createElement('span')
      gameOverRank.id = 'gameOverRank'
      gameOverRank.innerText = 'Loading rank...'
      this.frontgroundContainer1.appendChild(gameOverRank)

      // Interactives
      let interactiveContainer = document.createElement('div')
      interactiveContainer.classList.add('horizontalAlign')
      this.frontgroundContainer1.appendChild(interactiveContainer)

      // Restart button
      let restartBtn = document.createElement('h2')
      restartBtn.innerText = 'Restart'
      interactiveContainer.appendChild(restartBtn)

      restartBtn.addEventListener('touchend', (evt) => {
        that.gameRestart()
      })

      // Share button
      let shareBtn = document.createElement('h2')
      shareBtn.innerText = 'Share'
      interactiveContainer.appendChild(shareBtn)

      shareBtn.addEventListener('touchend', (evt) => {
        that.shareGame()
      })

    }

    this.updateFrontground1()
  }

  updateFrontground1 () {
    let that = this
    let gameOverRank = this.frontgroundContainer1.querySelector('#gameOverRank')

    // When total play count and game rank are resolved
    // we will show the detail information
    Promise.all([this.totalPlayCountPromise, this.gameRankPromise])
    .then((values) => {
      gameOverRank.innerText = 'You rank ' 
        + that.gameRank 
        + ' (top ' 
        + (that.gameRank / that.totalPlayCount).toFixed(4) * 100
        + '%) from all players!'
    })
    
    let frontGround1Wrapper = document.getElementById('frontground1')
    if (frontGround1Wrapper.childNodes.length === 0) {
      frontGround1Wrapper.appendChild(this.frontgroundContainer1)
    }
  }

  // // Background for kill boss counters
  // createBackground2 () {
  //   // Add background
  //   this.backgroundLayer2 = this.backgroundLayer2 || document.createElement('canvas')
  //   this.backgroundLayer2.classList.add('centerText')
  //   let width = this.game.world.width
  //   let height = this.game.world.height

  //   this.backgroundLayer2.width = width
  //   this.backgroundLayer2.height = height

  //   let backgroundCtx = this.backgroundLayer2.getContext('2d')
  //   backgroundCtx.fillStyle = 'rgba(124, 93, 96, 0.3)'
  //   backgroundCtx.font = Math.min(width, height) + 'px Bangers'
  //   backgroundCtx.textAlign = 'center'
  //   backgroundCtx.textBaseline = 'middle'

  //   this.updateBackgroundLayer2()
  //   document.getElementById('background2').appendChild(this.backgroundLayer2)
  // }

  // updateBackgroundLayer2 () {
  //   let backgroundCtx = this.backgroundLayer2.getContext('2d')
  //   let width = this.game.world.width
  //   let height = this.game.world.height
  //   backgroundCtx.clearRect(0, 0, width, height)
  //   backgroundCtx.fillText(this.gameLevel, width / 2, height / 2)
  // }


  gameRestart () {
    this.resetGame()
    this.state.start('Game')
  }

  resetGame () {
    this.captureDataURLs = []
    this.frontgroundContainer1.parentNode.removeChild(this.frontgroundContainer1)
  }

  shareGame () {
    // TODO: how to share game in wechat?
    console.log('Try to share game...')
  }

}

// TODO:
// x1. player should die at some point
// x2. motivation to kill boss (time limit!)
// 3. Personal ranking
// 4. All ranking
// 5. Share
// 6. Mobile support
