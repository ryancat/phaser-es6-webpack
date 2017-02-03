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
    this.load.image('roundIcon01', './assets/images/48/RoundIcons-Free-Set-01.png')
    this.load.image('roundIcon02', './assets/images/48/RoundIcons-Free-Set-02.png')
    this.load.image('roundIcon03', './assets/images/48/RoundIcons-Free-Set-03.png')
    this.load.image('roundIcon04', './assets/images/48/RoundIcons-Free-Set-04.png')
    this.load.image('roundIcon05', './assets/images/48/RoundIcons-Free-Set-05.png')
    this.load.image('roundIcon06', './assets/images/48/RoundIcons-Free-Set-06.png')
    this.load.image('roundIcon07', './assets/images/48/RoundIcons-Free-Set-07.png')
    this.load.image('roundIcon08', './assets/images/48/RoundIcons-Free-Set-08.png')
    this.load.image('roundIcon09', './assets/images/48/RoundIcons-Free-Set-09.png')
    this.load.image('roundIcon10', './assets/images/48/RoundIcons-Free-Set-10.png')
    this.load.image('roundIcon11', './assets/images/48/RoundIcons-Free-Set-11.png')
    this.load.image('roundIcon12', './assets/images/48/RoundIcons-Free-Set-12.png')
    this.load.image('roundIcon13', './assets/images/48/RoundIcons-Free-Set-13.png')
    this.load.image('roundIcon14', './assets/images/48/RoundIcons-Free-Set-14.png')
    this.load.image('roundIcon15', './assets/images/48/RoundIcons-Free-Set-15.png')
    this.load.image('roundIcon16', './assets/images/48/RoundIcons-Free-Set-16.png')
    this.load.image('roundIcon17', './assets/images/48/RoundIcons-Free-Set-17.png')
    this.load.image('roundIcon18', './assets/images/48/RoundIcons-Free-Set-18.png')
    this.load.image('roundIcon19', './assets/images/48/RoundIcons-Free-Set-19.png')
    this.load.image('roundIcon20', './assets/images/48/RoundIcons-Free-Set-20.png')
    this.load.image('roundIcon21', './assets/images/48/RoundIcons-Free-Set-21.png')
    this.load.image('roundIcon22', './assets/images/48/RoundIcons-Free-Set-22.png')
    this.load.image('roundIcon23', './assets/images/48/RoundIcons-Free-Set-23.png')
    this.load.image('roundIcon24', './assets/images/48/RoundIcons-Free-Set-24.png')
    this.load.image('roundIcon25', './assets/images/48/RoundIcons-Free-Set-25.png')
    this.load.image('roundIcon26', './assets/images/48/RoundIcons-Free-Set-26.png')
    this.load.image('roundIcon27', './assets/images/48/RoundIcons-Free-Set-27.png')
    this.load.image('roundIcon28', './assets/images/48/RoundIcons-Free-Set-28.png')
    this.load.image('roundIcon29', './assets/images/48/RoundIcons-Free-Set-29.png')
    this.load.image('roundIcon30', './assets/images/48/RoundIcons-Free-Set-30.png')
    this.load.image('roundIcon31', './assets/images/48/RoundIcons-Free-Set-31.png')
    this.load.image('roundIcon32', './assets/images/48/RoundIcons-Free-Set-32.png')
    this.load.image('roundIcon33', './assets/images/48/RoundIcons-Free-Set-33.png')
    this.load.image('roundIcon34', './assets/images/48/RoundIcons-Free-Set-34.png')
    this.load.image('roundIcon35', './assets/images/48/RoundIcons-Free-Set-35.png')
    this.load.image('roundIcon36', './assets/images/48/RoundIcons-Free-Set-36.png')
    this.load.image('roundIcon37', './assets/images/48/RoundIcons-Free-Set-37.png')
    this.load.image('roundIcon38', './assets/images/48/RoundIcons-Free-Set-38.png')
    this.load.image('roundIcon39', './assets/images/48/RoundIcons-Free-Set-39.png')
    this.load.image('roundIcon40', './assets/images/48/RoundIcons-Free-Set-40.png')
    this.load.image('roundIcon41', './assets/images/48/RoundIcons-Free-Set-41.png')
    this.load.image('roundIcon42', './assets/images/48/RoundIcons-Free-Set-42.png')
    this.load.image('roundIcon43', './assets/images/48/RoundIcons-Free-Set-43.png')
    this.load.image('roundIcon44', './assets/images/48/RoundIcons-Free-Set-44.png')
    this.load.image('roundIcon45', './assets/images/48/RoundIcons-Free-Set-45.png')
    this.load.image('roundIcon46', './assets/images/48/RoundIcons-Free-Set-46.png')
    this.load.image('roundIcon47', './assets/images/48/RoundIcons-Free-Set-47.png')
    this.load.image('roundIcon48', './assets/images/48/RoundIcons-Free-Set-48.png')
    this.load.image('roundIcon49', './assets/images/48/RoundIcons-Free-Set-49.png')
    this.load.image('roundIcon50', './assets/images/48/RoundIcons-Free-Set-50.png')
    this.load.image('roundIcon51', './assets/images/48/RoundIcons-Free-Set-51.png')
    this.load.image('roundIcon52', './assets/images/48/RoundIcons-Free-Set-52.png')
    this.load.image('roundIcon53', './assets/images/48/RoundIcons-Free-Set-53.png')
    this.load.image('roundIcon54', './assets/images/48/RoundIcons-Free-Set-54.png')
    this.load.image('roundIcon55', './assets/images/48/RoundIcons-Free-Set-55.png')
    this.load.image('roundIcon56', './assets/images/48/RoundIcons-Free-Set-56.png')
    this.load.image('roundIcon57', './assets/images/48/RoundIcons-Free-Set-57.png')
    this.load.image('roundIcon58', './assets/images/48/RoundIcons-Free-Set-58.png')
    this.load.image('roundIcon59', './assets/images/48/RoundIcons-Free-Set-59.png')
    this.load.image('roundIcon60', './assets/images/48/RoundIcons-Free-Set-60.png')
  }

  create () {
    this.state.start('Game')
  }

}
