import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset, options={} }) {
    super(game, x, y, asset)

    this.game = game
    this.anchor.setTo(0.5)
    this.cursor = game.input.keyboard.createCursorKeys();

    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;

    this.isRecording = !!options.isRecording

    // Ninja move map
    this.ninjaMoveMap = {
      left: () => {
        //  Move to the left
        this.body.velocity.x = -150;

        // Ninja flip
        if (this.position.x === this.width / 2) {
          this.position.x = this.game.world.width;
          //  Move to the left
          this.body.velocity.x = -150;
        }
      },

      right: () => {
        //  Move to the left
        this.body.velocity.x = 150;

        // Ninja flip
        if (this.position.x === game.world.width - this.width / 2) {
          this.position.x = 0;
          //  Move to the left
          this.body.velocity.x = 150;
        }
      },

      up: () => {
        //  Move to the left
        this.body.velocity.y = -150;

        // Ninja flip
        if (this.position.y === this.height / 2) {
          this.position.y = this.game.world.height;
          //  Move to the left
          this.body.velocity.y = -150;
        }
      },

      down: () => {
        //  Move to the left
        this.body.velocity.y = 150;

        // Ninja flip
        if (this.position.y === game.world.height - this.width / 2) {
          this.position.y = 0;
          //  Move to the left
          this.body.velocity.y = 150;
        }
      }
    }

    this.ninjaEvents = options.ninjaEvents || []
    this.currentEventIndex = 0

    console.log('ninja events', this.ninjaEvents);
  }

  update () {
    if (this.isRecording) {
      let currentEvent = this.ninjaEvents[this.currentEventIndex],
          nextEvent = this.ninjaEvents[this.currentEventIndex + 1],
          now = Date.now()

      if (currentEvent
        && now - this.game.gameStartTimestamp >= currentEvent.timestamp) {
        if (currentEvent.type === 'down') {
          this.ninjaMoveMap[currentEvent.key]()
        } else {
          if (currentEvent.key === 'left' || currentEvent.key === 'right') {
            this.body.velocity.x = 0;
          } else {
            this.body.velocity.y = 0;
          }
        }
      }

      if (nextEvent
        && now - this.game.gameStartTimestamp >= nextEvent.timestamp) {
        this.currentEventIndex++
      } 

    } else {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;

      // Basic move
      if (this.cursor.left.isDown) {
        this.ninjaMoveMap.left()
      }
      
      if (this.cursor.right.isDown) {
        this.ninjaMoveMap.right()
      }
      
      if (this.cursor.up.isDown) {
        this.ninjaMoveMap.up()
      }
      
      if (this.cursor.down.isDown) {
        this.ninjaMoveMap.down()
      } 
    }
    

  }

}
