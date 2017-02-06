/* globals __DEV__ */
import Phaser from 'phaser'

import Ninja from '../sprites/Ninja'
import Baddie from '../sprites/Baddie'
import Boss from '../sprites/Boss'

import api from '../services/api'
import GameLayer from '../gameModels/GameLayer'

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
      window.addEventListener('deviceorientation', (eventData) => {
        if (that.orientation.startBeta === null) {
          that.orientation.startBeta = eventData.beta
        }

        if (that.orientation.startGamma === null) {
          that.orientation.startGamma = eventData.gamma
        }

        that.orientation.beta = eventData.beta
        that.orientation.gamma = eventData.gamma

        that.devText = that.orientation.startGamma
          + ', ' 
          + (that.orientation.startGamma + 180)
          + ', '
          + (that.orientation.startGamma - 180)
      }, true);
    }

    // Config (immutable)
    this.gameConfig = {
      recordingGame: false,
      sameBaddies: false,
      numOfBaddies: 20,
      allowNinjaPassBorder: false,
      ninjaLives: 3,
      countDown: 100,
      playerSignLimit: DEFAULT_PLAYER_SIGN_LIMIT,
      // dev: true
    }

    // Game inner states
    this.mainCanvas = document.getElementById('content').getElementsByTagName('canvas')[0]
    this.spriteScale = 0.8
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
    let that = this

    // Create all layers for game
    this.createLayers()

    // When in dev mode, output some more information
    if (this.gameConfig.dev) {
      this.createBackground4()
    }

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

  }

  update () {
    this.game.physics.arcade.overlap(this.ninja, this.baddies, this.collideNinjaBaddies, null, this)
    this.game.physics.arcade.overlap(this.ninja, this.boss, this.collideNinjaBoss, null, this)
  }

  render () { 
    // this.capturer.capture(this.mainCanvas)
  }

  /////////////////////////////
  /// Create layer functions //
  /////////////////////////////
  createLayers () {
    let that = this,
        width = this.game.world.width,
        height = this.game.world.height

    // Background layer 1: timeout counter
    this.backgroundLayer1 = this.backgroundLayer1 || new GameLayer({
      container: document.getElementById('background1'),
      context: this,
      update: this.updateBackground1
    })
    this.backgroundLayer1.update()

    // Background layer 2: kill boss counter
    this.backgroundLayer2 = this.backgroundLayer2 || new GameLayer({
      container: document.getElementById('background2'),
      context: this,
      update: this.updateBackground2,
      classname: 'centerText',
      style: {
        fillStyle: 'rgba(124, 93, 96, 0.3)',
        font: Math.min(width, height) + 'px Bangers',
        textAlign: 'center',
        textBaseline: 'middle'
      }
    })
    this.backgroundLayer2.update()

    // Background layer 3: game rate layer
    this.backgroundLayer3 = this.backgroundLayer3 || new GameLayer({
      container: document.getElementById('background3'),
      context: this,
      update: this.updateBackground3,
      classname: 'centerText',
      style: {
        fillStyle: 'rgba(124, 93, 96, 0.3)',
        font: Math.floor(Math.min(width, height) / 8) + 'px Bangers',
        textAlign: 'center',
        textBaseline: 'middle'
      }
    })
    this.backgroundLayer3.update()

    // Frontground layer 1: game over layer
    // Game over title
    let gameOverTitleElement = document.createElement('h1')
    gameOverTitleElement.classList.add('gameoverTitle')

    // Game rank
    let gameRankElement = document.createElement('span')
    gameRankElement.classList.add('gameRank')

    // Player signature
    let playerSignElement = document.createElement('input')
    playerSignElement.classList.add('playerSign')
    playerSignElement.setAttribute('placeholder','Your name?')
    playerSignElement.setAttribute('maxlength', this.gameConfig.playerSignLimit || DEFAULT_PLAYER_SIGN_LIMIT)
    playerSignElement.addEventListener('change', (evt) => {
      that.playerSignText = evt.target.value
    })

    // Interactive container
    let interactiveContainer = document.createElement('div')
    interactiveContainer.classList.add('horizontalAlign')

    // Restart button
    let restartBtn = document.createElement('h2')
    restartBtn.innerText = 'Restart'
    restartBtn.addEventListener('touchend', (evt) => {
      that.gameRestart()
    })
    interactiveContainer.appendChild(restartBtn)

    // Share button
    let shareBtn = document.createElement('h2')
    shareBtn.innerText = 'Share'
    shareBtn.addEventListener('touchend', (evt) => {
      that.shareGame()
    })
    interactiveContainer.appendChild(shareBtn)

    // Putting things together
    this.frontgroundLayer1 = this.frontgroundLayer1 || new GameLayer({
      container: document.getElementById('frontground1'),
      context: this,
      type: 'div',
      layerId: 'frontground1Container',
      update: this.updateFrontground1,
      classname: 'centerText',
      isHidden: true,
      contents: [
        gameOverTitleElement,
        gameRankElement,
        playerSignElement,
        interactiveContainer
      ]
    })
    this.listenFrontground1()
    this.frontgroundLayer1.update()

    // Frontground layer 2
    // Create shared image
    let image = new Image()
    image.classList.add('shareImage')

    // The description of shared image
    let description = document.createElement('span')
    description.classList.add('shareImageDescription')
    description.innerText = 'Save the image and share!'

    // The close button for shared image
    let closeBtn = document.createElement('button')
    closeBtn.classList.add('shareImageCloseBtn')
    closeBtn.innerText = 'X'
    closeBtn.addEventListener('click', () => {
      that.frontgroundLayer2.hide()
    })

    // Put things together
    this.frontgroundLayer2 = this.frontgroundLayer2 || new GameLayer({
      container: document.getElementById('frontground2'),
      type: 'div',
      classname: 'centerText',
      context: this,
      isHidden: true,
      style: {
        backgroundColor: 'white'
      },
      update: this.updateFrontground2,
      contents: [
        image,
        description,
        closeBtn
      ]
    })

    // For debug
    dotninja.layers = [
      this.backgroundLayer1,
      this.backgroundLayer2,
      this.backgroundLayer3,
      this.frontgroundLayer1
    ]

  }


  /////////////////////////////
  /// Update layer functions //
  /////////////////////////////
  // Background for timeout counters
  updateBackground1 () {
    // Add the count down progress
    let backgroundCtx = this.backgroundLayer1.context
    let countPercentage = (1 - Math.min(this.countDown / 10, 1)).toFixed(2)
    // let countPercentagePow = 1 - Math.min(Math.pow(this.countDown / 10, 2), 1)
    let width = this.backgroundLayer1.element.width
    let height = this.backgroundLayer1.element.height

    backgroundCtx.clearRect(0, 0, width, height)
    backgroundCtx.fillStyle = 'rgba(255' + ', 0, 0, ' + (0.2 * countPercentage).toFixed(2) + ')'
    backgroundCtx.fillRect(0, height * countPercentage, width, height)
  }

  // Background for kill boss counters
  updateBackground2 () {
    let that = this,
        backgroundCtx = this.backgroundLayer2.context,
        width = this.backgroundLayer2.element.width,
        height = this.backgroundLayer2.element.height,
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

  // Background for game rate text
  updateBackground3 () {
    let backgroundCtx = this.backgroundLayer3.context,
        width = this.backgroundLayer3.element.width,
        height = this.backgroundLayer3.element.height,
        fontSize = Math.floor(Math.min(width, height) / 8)

    backgroundCtx.fillText(this.gameRateText, width * Math.random(), height * Math.random())
  }

  updateFrontground1 () {
    let that = this,
        frontgroundLayer1Element = this.frontgroundLayer1.element,
        gameOverTitleElement = frontgroundLayer1Element.querySelector('.gameoverTitle'),
        gameRankElement = frontgroundLayer1Element.querySelector('.gameRank'),
        playerSignElement = frontgroundLayer1Element.querySelector('.playerSign')

    gameOverTitleElement.innerText = this.gameRateText
    gameRankElement.innerText = 'Loading rank...'
    playerSignElement.setAttribute('value', this.playerSignText || '')

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

      existingPlayCount = that.getPlayCountByLevel(that.playStatByLevel)
      totalPlayCount = existingPlayCount + 1

      gameCountAtCurrentLevel = that.getPlayCountByLevel(that.playStatByLevel, that.gameLevel)
      gameRank = gameCountAtCurrentLevel + 1

      gameRankElement.innerText = 'You rank ' 
        + gameRank 
        + ' from '
        + totalPlayCount
        + ' plays! (top ' 
        + (100 * gameRank / totalPlayCount).toFixed(2) 
        + '%) '

    })
  }

  listenFrontground1 () {
    let that = this
    // Make sure user signature is no longer than 8 characters
    this.frontgroundLayer1.element.addEventListener('touchstart', () =>  {
      let playerSignElement = that.frontgroundLayer1.element.querySelector('.playerSign')
      that.playerSignText = playerSignElement.value.substring(0, that.gameConfig.playerSignLimit || DEFAULT_PLAYER_SIGN_LIMIT)
    })
  }

  updateFrontground2 () {
    // Create share text
    this.createShareImageText()

    // Create shared image
    let image = this.frontgroundLayer2.element.querySelector('.shareImage')
    image.src = this.createCapturePng()
  }

  //////////////////////////
  /// Communication to BE //
  //////////////////////////

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

  // Dev background 4
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

  countSec () {
    if (this.countDown <= 0) {
      // Game over
      this.killNinja(this.ninja)
    }
    else {
      this.countDown = (this.countDown - 0.1).toFixed(1)
      // this.scoreText.text = 'Remain: ' + this.countDown + 's'

      this.backgroundLayer1.update()

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

  ////////////////////
  /// Baddies logic //
  ////////////////////
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

  /////////////////
  /// Boss logic //
  /////////////////
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

  killBoss (ninja, boss) {
    let that = this
    // Capture the moment!
    this.captureDataURLs[0] = this.mainCanvas.toDataURL()

    boss.kill()
    
    // Stop current measure session
    this.endMeasureSession()

    // When we kill the boss, we are going to the next level
    this.nextLevel()

    // Killing boss reward player time
    this.addSec(this.gameLevel)

    // Boss will respawn soon
    this.createBoss()

  }

  //////////////////
  /// Ninja logic //
  //////////////////
  createNinja (options = {}) {
    this.ninja = new Ninja({
      game: this,
      x: this.world.centerX,
      y: this.world.centerY,
      // asset: 'ninja',
      asset: 'roundIcon01',
      options
    })

    this.ninja.scale.setTo(this.spriteScale, this.spriteScale)

    this.game.add.existing(this.ninja)

    this.startMeasureSession()
  }

  killNinja (ninja) {
    let that = this
    
    // Capture
    this.captureDataURLs[0] = this.mainCanvas.toDataURL()

    ninja.kill()

    // When ninja is killed, game over
    this.gameOver()

  }

  ////////////////////
  /// Collide logic //
  ////////////////////
  collideNinjaBaddies (ninja, baddie) {
    this.killNinja(ninja)
  }

  collideNinjaBoss (ninja, boss) {
    this.killBoss(ninja, boss)
  }

  ////////////////////////
  /// Measurement logic //
  ////////////////////////
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

  printMeasure () {
    console.log('all:', this.measureStat)
  }

  /////////////////////////
  /// Level update logic //
  /////////////////////////
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

    this.backgroundLayer2.update()
    this.backgroundLayer3.update()
    this.addBaddie()

    // Start measure session
    this.startMeasureSession()
  }

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
    this.backgroundLayer2.update()

    // Capture the backgrounds
    this.captureDataURLs[1] = this.backgroundLayer1.element.toDataURL()
    this.captureDataURLs[2] = this.backgroundLayer2.element.toDataURL()
    this.captureDataURLs[3] = this.backgroundLayer3.element.toDataURL()

    // Create game over text
    this.frontgroundLayer1.update()
    this.frontgroundLayer1.show()

    // Listen on restart trigger
    let restartKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    restartKey.onDown.addOnce(this.gameRestart, this)

    // Save game log
    this.saveGameLog()
  }

  /////////////////
  /// Game utils //
  /////////////////
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

    // TODO: check if detached imageCanvasBuffer is memory leak
    return imageCanvasBuffer.toDataURL()
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

  createShareImageText () {
    let that = this,
        width = this.game.world.width,
        height = this.game.world.height,
        imageCanvasBuffer = document.createElement('canvas'),
        frontgroundLayer1Element = this.frontgroundLayer1.element,
        gameRankElement = frontgroundLayer1Element.querySelector('.gameRank')

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
    imageCanvasBufferCtx.fillText(gameRankElement.innerText, width / 2, height / 2 + fontSize * 1.5)

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
    this.backgroundLayer3.context.clearRect(0, 0, width, height)
    this.frontgroundLayer1.hide()
  }

  shareGame () {
    let that = this
    // TODO: how to share game in wechat?
    // Need to wait for ranking information arrives
    this.playStatByLevelPromise
    .then(() => {
      that.updateFrontground2()
      that.frontgroundLayer2.show()
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
// x8. Show live rank
// x9. User signature
// 10. User top ranking list
// 11. Add more immediate feedback when kill boss
// 12. Add simple super power
// 13. Add more stat for user for a series of play
// 14. Add top rank name list
// 15. multi player?
// 16. Fix angle issue for accelerator meter
// 17. Add icon character
