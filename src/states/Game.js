/* globals __DEV__ */
import Phaser from 'phaser'

import Ninja from '../sprites/Ninja'
import Baddie from '../sprites/Baddie'
import Boss from '../sprites/Boss'

import api from '../services/api'

const KILL_RATES_MAP = [{
    name: 'Newbie!',
    min: 0,
    max: 0
  },{
    name: 'First Blood!',
    min: 1,
    max: 1
  },{
    name: 'Double Kills!',
    min: 2,
    max: 2
  },{
    name: 'Triple Kills!',
    min: 3,
    max: 3
  },{
    name: 'Mega Kill!',
    min: 4,
    max: 6
  },{
    name: 'Unstoppedable!',
    min: 7,
    max: 9
  },{
    name: 'Ultra kill!',
    min: 10,
    max: 14
  },{
    name: 'Dominating!',
    min: 15,
    max: 19
  },{
    name: 'Monster Kill!',
    min: 20,
    max: 24
  },{
    name: 'God Like!',
    min: 25,
    max: 29
  },{
    name: 'Rampage!',
    min: 30
  }
]

const PLAYER_SIGN_TEXT = 'A Ninja has no name'
const DEFAULT_PLAYER_SIGN_LIMIT = 8

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
      startGamma: null,
      beta: null,
      gamma: null
    }

    if (window.DeviceOrientationEvent) {
      setTimeout(() => {
        window.addEventListener('deviceorientation', (eventData) => {
          if (that.orientation.startBeta === null) {
            that.orientation.startBeta = eventData.beta
          }

          if (that.orientation.startGamma === null) {
            that.orientation.startGamma = eventData.gamma
          }

          that.orientation.beta = eventData.beta
          that.orientation.gamma = eventData.gamma
          that.devText = eventData.beta + ', ' + eventData.gamma
        }, true);
      }, 500)
    }

    // Config (immutable)
    this.gameConfig = {
      recordingGame: false,
      sameBaddies: false,
      numOfBaddies: 20,
      allowNinjaPassBorder: false,
      ninjaLives: 3,
      countDown: 10,
      playerSignLimit: DEFAULT_PLAYER_SIGN_LIMIT,
      // dev: true
    }

    // Game inner states
    this.mainCanvas = document.getElementById('content').getElementsByTagName('canvas')[0]
    this.spriteScale = this.game.world.width / 600
    this.baddieStates = []
    this.gameLevel = 0
    this.gameRateText = KILL_RATES_MAP[0].name
    this.numOfBaddies = this.gameLevel
    this.longestTimeCount = this.gameConfig.countDown
    this.captureDataURLs = []
    this.countDown = this.gameConfig.countDown || 10

    // Get state from server
    // this.fetchTotalPlayCount()
    this.fetchPlayStat()

    // Measures
    this.initMeasure()

    // Listeners
  }

  preload () {}

  create () {
    this.createBackground1()
    this.createBackground2()
    this.createBackground3()

    // When in dev mode, output some more information
    if (this.gameConfig.dev) {
      this.createBackground4()
    }

    // this.createCountDownText()
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
  }

  update () {
    this.game.physics.arcade.overlap(this.ninja, this.baddies, this.collideNinjaBaddies, null, this)
    this.game.physics.arcade.overlap(this.ninja, this.boss, this.collideNinjaBoss, null, this)
  }

  render () { 
    // this.capturer.capture(this.mainCanvas)
  }

  // fetchTotalPlayCount () {
  //   let that = this
  //   this.totalPlayCountPromise = api.getPlayCountStat()
  //   .then((response) => {
  //     console.log('total play count', response.body.totalCount)
  //     that.totalPlayCount = response.body.totalCount
  //   })
  // }

  fetchPlayStat () {
    let that = this
    this.playStatByLevelPromise = api.getPlayStatByLevel()
    .then((response) => {
      console.log('play stat by level', response)
      that.playStatByLevel = response.body
    })
  }

  saveGameLog () {
    // Create game log
    let gameLog = {
      // TODO: create player signature
      sign: this.playerSignText || PLAYER_SIGN_TEXT,
      playTimes: this.measureStat.sessions.map((session) => {
        return {
          level: session.gameLevel,
          duration: session.end - session.start
        }
      }),
      level: this.gameLevel
    }

    // Save to server
    api.saveGameLog(gameLog)
    .then((response) => {
      console.log('save game log', response)
    }, (error) => {
      console.log('error', error)
    })

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
    let that = this,
        backgroundCtx = this.backgroundLayer2.getContext('2d'),
        width = this.game.world.width,
        height = this.game.world.height,
        fontSize = Math.floor(Math.min(width, height) / 20)

    backgroundCtx.clearRect(0, 0, width, height)
    backgroundCtx.font = Math.min(width, height) + 'px Bangers'
    backgroundCtx.fillStyle = 'rgba(124, 93, 96, 0.3)'
    backgroundCtx.fillText(this.gameLevel, width / 2, height / 2)

    // Update the count per level
    this.playStatByLevelPromise
    .then(() => {
      let currentLevelPlayCount = that.getPlayCountByLevel(that.playStatByLevel, that.gameLevel),
          nextLevelPlayCount = that.getPlayCountByLevel(that.playStatByLevel, that.gameLevel + 1),
          deadPlayCount = currentLevelPlayCount - nextLevelPlayCount,
          levelStatText = 'No one reach this level yet...'

      if (!that.ninja.alive) {
        levelStatText = 'You dead here ...'
      } else {
        if (deadPlayCount === 0) {
          levelStatText = 'No one dead at this level!'
        } else if (deadPlayCount === 1) { 
          levelStatText = 'Only one dead here!'
        } else {
          levelStatText = deadPlayCount + ' plays dead here!'
        }
      }

      backgroundCtx.font = fontSize + 'px Bangers'
      backgroundCtx.fillStyle = 'rgba(255, 170, 0, 0.7)'
      backgroundCtx.fillText(levelStatText, width / 2, fontSize * 1.5)

    })
  }

  // Background for kill boss counters
  createBackground3 () {
    // Add background if not exist
    if (!this.backgroundLayer3) {
      this.backgroundLayer3 = this.backgroundLayer3 || document.createElement('canvas')
      this.backgroundLayer3.classList.add('centerText')
      let width = this.game.world.width
      let height = this.game.world.height

      this.backgroundLayer3.width = width
      this.backgroundLayer3.height = height

      let backgroundCtx = this.backgroundLayer3.getContext('2d')
      backgroundCtx.fillStyle = 'rgba(124, 93, 96, 0.3)'
      backgroundCtx.font = Math.floor(Math.min(width, height) / 8) + 'px Bangers'
      backgroundCtx.textAlign = 'center'
      backgroundCtx.textBaseline = 'middle'

      document.getElementById('background3').appendChild(this.backgroundLayer3)

    }

    this.updateBackgroundLayer3()
  }

  updateBackgroundLayer3 () {
    let backgroundCtx = this.backgroundLayer3.getContext('2d'),
        width = this.game.world.width,
        height = this.game.world.height,
        fontSize = Math.floor(Math.min(width, height) / 8),
        rotateAngle = Math.PI * 2 * Math.random()

    // backgroundCtx.clearRect(0, 0, width, height)
    // backgroundCtx.rotate(rotateAngle)
    backgroundCtx.fillText(this.gameRateText, width * Math.random(), height * Math.random())
  }

  createBackground4 () {
    this.backgroundLayer4 = this.backgroundLayer4 || document.createElement('div')
    let width = this.game.world.width
    let height = this.game.world.height

    this.backgroundLayer4.width = width
    this.backgroundLayer4.height = height

    this.backgroundLayer4.innerText = this.devText

    if (document.getElementById('background4').childNodes.length === 0) {
      document.getElementById('background4').appendChild(this.backgroundLayer4)
    }
  }

  // createCountDownText () {
  //   this.countDown = this.gameConfig.countDown || 10
  //   // this.scoreText = this.game.add.text(16, this.game.world.height - 40, 'Remain: ' + this.countDown + 's', { fontSize: '32px', fill: '#FFF' })
  // }

  countSec () {
    if (this.countDown <= 0) {
      // Game over
      this.killNinja(this.ninja)
    }
    else {
      this.countDown = (this.countDown - 0.1).toFixed(1)
      // this.scoreText.text = 'Remain: ' + this.countDown + 's'

      this.createBackground1()

      if (this.gameConfig.dev) {
        this.createBackground4()
      }

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
    this.killNinja(ninja)
  }

  collideNinjaBoss (ninja, boss) {
    this.killBoss(ninja, boss)
  }

  killNinja (ninja) {
    let that = this
    
    // Capture
    this.captureDataURLs[0] = this.mainCanvas.toDataURL()

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
    this.captureDataURLs[0] = this.mainCanvas.toDataURL()

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
    
    // Stop current measure session
    this.endMeasureSession()

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
      gameLevel: this.gameLevel
    }

    this.measureStat.sessions.push(this.currentMeasureSession)

    return this.currentMeasureSession
  }

  endMeasureSession () {
    this.currentMeasureSession.end = Date.now()
    this.currentMeasureSession = null
  }

  // addMeasure (key) {

  //   switch(key) {
  //     case 'boss dead':
  //       this.currentMeasureSession.bossDeadTime.push(Date.now())

  //     default:
  //       this.currentMeasureSession.snapshots.push(this.baddieStates)
  //   }
  // }

  // record (key) {
  //   if (!this.currentMeasureSession) {
  //     return
  //   }

  //   // this.currentMeasureSession.name = key

  //   // After recording, end the current measure session
  //   this.endMeasureSession()
    
  // }

  printMeasure () {
    console.log('all:', this.measureStat)
  }

  ////// LEVELS
  nextLevel (nextStep = 1) {
    let that = this
    this.gameLevel += nextStep
    this.numOfBaddies = this.gameLevel

    // Get the kill rate
    let gameRate = _.find(KILL_RATES_MAP, (rate) => {
      let min = _.isNumber(rate.min) ? rate.min : -Infinity
      let max = _.isNumber(rate.max) ? rate.max : Infinity
      return that.gameLevel >= min && that.gameLevel <= max
    })

    this.gameRateText = gameRate.name

    this.createBackground2()
    this.createBackground3()
    this.addBaddie()

    // Start measure session
    this.startMeasureSession()

    // this.capturer.capture(this.mainCanvas)
  }

  // prevLevel (prevStep = 1) {
  //   this.gameLevel -= prevStep
  //   this.numOfBaddies = this.gameLevel
  //   this.removeBaddie()
  // }

  ////// GAME OVER
  gameOver () {
    let that = this
    // Stop count down timer
    clearTimeout(this.countSecTimout)

    // Stop measure session
    this.endMeasureSession()
    this.measureStat.end = Date.now()

    // Kill ninja if it's still alive
    if (this.ninja.alive) {
      this.ninja.kill()
    }

    // Update the kill boss count background
    this.createBackground2()

    // this.capturer.stop()
    // this.capturer.save()

    // Capture the backgrounds
    this.captureDataURLs[1] = this.backgroundLayer1.toDataURL()
    this.captureDataURLs[2] = this.backgroundLayer2.toDataURL()
    this.captureDataURLs[3] = this.backgroundLayer3.toDataURL()

    // this.state.start('Game Over', true, false, {
    //   killBossCount: this.gameLevel - 1,
    //   longestTimeCount: this.longestTimeCount,
    //   captureDataURLs: this.captureDataURLs
    // })

    // TODOs
    // Create images to share
    // console.log(this.createCapturePng())
    // Create game over text
    // this.gameRankPromise = new Promise((resolve, reject) => {
    //   // Load server game rank
    //   setTimeout(() => {
    //     resolve(51)
    //   }, 2000)
    // })
    // .then((val) => {
    //   console.log('game rank', val)
    //   that.gameRank = val
    // })

    // Create game over text
    this.createFrontground1()

    // Listen on restart trigger
    let restartKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    restartKey.onDown.addOnce(this.gameRestart, this)

    // Save game log
    this.saveGameLog()
  }

  createCapturePng () {
    let that = this,
        imageCanvasBuffer = document.createElement('canvas')

    imageCanvasBuffer.width = this.game.world.width
    imageCanvasBuffer.height = this.game.world.height

    let imageCanvasBufferCtx = imageCanvasBuffer.getContext('2d')

    // Mix all captured data urls 
    this.captureDataURLs.forEach((dataURL) => {
      let img = new Image()
      img.src = dataURL
      imageCanvasBufferCtx.drawImage(img, 0, 0)
    })

    // let img = new Image()
    // img.src = imageCanvasBuffer.toDataURL()
    // imageCanvasBufferCtx.drawImage(img, 0, 0)

    // Test: put the imageCanvasBuffer onto screen
    // document.getElementById('frontground1').appendChild(imageCanvasBuffer)

    // TODO: check if detached imageCanvasBuffer is memory leak
    return imageCanvasBuffer.toDataURL()
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
      this.gameOverTitle = document.createElement('h1')
      this.frontgroundContainer1.appendChild(this.gameOverTitle)

      // Show rank
      this.gameOverRank = document.createElement('span')
      this.frontgroundContainer1.appendChild(this.gameOverRank)

      // User signature
      this.playerSign = document.createElement('input')
      this.playerSign.classList.add('playerSign')
      this.playerSign.setAttribute('placeholder','Your name?')
      this.playerSign.setAttribute('maxlength', this.gameConfig.playerSignLimit || DEFAULT_PLAYER_SIGN_LIMIT)
      this.frontgroundContainer1.appendChild(this.playerSign)

      this.playerSign.addEventListener('change', (evt) => {
        that.playerSignText = evt.target.value
      })

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

      // Events listener globally
      this.frontgroundContainer1.addEventListener('touchstart', () =>  {
        that.playerSignText = that.playerSign.value.substring(0, this.gameConfig.playerSignLimit || DEFAULT_PLAYER_SIGN_LIMIT)
      })

      // Add front ground to document
      document.getElementById('frontground1').appendChild(this.frontgroundContainer1)
    }

    this.updateFrontground1()
  }

  updateFrontground1 () {
    let that = this

    this.gameOverTitle.innerText = this.gameRateText
    this.gameOverRank.innerText = 'Loading rank...'
    this.playerSign.setAttribute('value', this.playerSignText || '')

    // When total play count and game rank are resolved
    // we will show the detail information
    this.playStatByLevelPromise
    .then(() => {
      // Total play count is the same to anyone at first level
      let existingPlayCount,
          totalPlayCount,
          gameCountAtCurrentLevel, 
          gameRank,
          existingPlayStat,
          currentLevelStat

      // Get existing play stat
      // if (existingPlayStat = _.find(that.playStatByLevel, { _id: 0 })) {
      //   existingPlayCount = existingPlayStat.playCount
      // } else {
      //   existingPlayCount = 0
      // }
      existingPlayCount = that.getPlayCountByLevel(that.playStatByLevel)
      totalPlayCount = existingPlayCount + 1

      // Get current level stat
      // if (currentLevelStat = _.find(that.playStatByLevel, { _id: that.gameLevel })) {
      //   gameCountAtCurrentLevel = currentLevelStat.playCount
      // } else {
      //   gameCountAtCurrentLevel = 0
      // }
      gameCountAtCurrentLevel = that.getPlayCountByLevel(that.playStatByLevel, that.gameLevel)
      gameRank = gameCountAtCurrentLevel + 1

      that.gameOverRank.innerText = 'You rank ' 
        + gameRank 
        + ' from '
        + totalPlayCount
        + ' plays! (top ' 
        + (100 * gameRank / totalPlayCount).toFixed(2) 
        + '%) '

    })

    this.frontgroundContainer1.style.visibility = 'visible'
    
    // let frontGround1Wrapper = document.getElementById('frontground1')
    // if (frontGround1Wrapper.childNodes.length === 0) {
    //   frontGround1Wrapper.appendChild(this.frontgroundContainer1)
    // }
  }

  getPlayCountByLevel (playStatByLevel = [], level = 0) {
    // Get existing play stat
    let playCount = 0,
        playStat

    if (playStat = _.find(playStatByLevel, { _id: level })) {
      playCount = playStat.playCount
    }

    return playCount
  }

  createShareFontDataUrl () {
    let that = this,
        width = this.game.world.width,
        height = this.game.world.height,
        imageCanvasBuffer = document.createElement('canvas')

    imageCanvasBuffer.width = width
    imageCanvasBuffer.height = height

    let imageCanvasBufferCtx = imageCanvasBuffer.getContext('2d')

    // Create game rating text
    imageCanvasBufferCtx.fillStyle = 'rgba(255, 170, 0, 0.7)'
    imageCanvasBufferCtx.font = Math.floor(Math.min(width, height) / 10) + 'px Bangers'
    imageCanvasBufferCtx.textAlign = 'center'
    imageCanvasBufferCtx.textBaseline = 'middle'
    let gameRate = this.playerSignText ? this.playerSignText + ' got ' + this.gameRateText : this.gameRateText
    imageCanvasBufferCtx.fillText(gameRate, width / 2, height / 2)

    this.captureDataURLs[4] = imageCanvasBuffer.toDataURL()
    imageCanvasBufferCtx.clearRect(0, 0, width, height)

    // Creat game result text
    let fontSize = Math.floor(Math.min(width, height) / 20)
    imageCanvasBufferCtx.font = fontSize + 'px Bangers'
    imageCanvasBufferCtx.fillText(this.gameOverRank.innerText, width / 2, height / 2 + fontSize * 1.5)

    this.captureDataURLs[5] = imageCanvasBuffer.toDataURL()
    imageCanvasBufferCtx.clearRect(0, 0, width, height)

    // Share game url
    imageCanvasBufferCtx.font = fontSize + 'px sans-serif'
    imageCanvasBufferCtx.textBaseline = 'bottom'
    imageCanvasBufferCtx.fillText('Play at dotninja.herokuapp.com', width / 2, height - fontSize)

    this.captureDataURLs[6] = imageCanvasBuffer.toDataURL()
    imageCanvasBufferCtx.clearRect(0, 0, width, height)

  }

  gameRestart () {
    this.resetGame()
    this.state.start('Game')
  }

  resetGame () {
    let width = this.game.world.width
    let height = this.game.world.height
    this.captureDataURLs = []
    this.backgroundLayer3.getContext('2d').clearRect(0, 0, width, height)
    this.frontgroundContainer1.style.visibility = 'hidden'
  }

  shareGame () {
    let that = this
    // TODO: how to share game in wechat?
    // Need to wait for ranking information arrives
    this.playStatByLevelPromise
    .then(() => {
      // Create share text
      that.createShareFontDataUrl()
      window.open(that.createCapturePng())
    })
  }

}

// TODO:
// x1. player should die at some point
// x2. motivation to kill boss (time limit!)
// ?3. Personal ranking
// x4. All ranking
// x5. Share
// x6. Mobile support
// 7. Adaptive second count (using average time)
// 8. Show live rank
// 9. User signature
// 10. User top ranking list
