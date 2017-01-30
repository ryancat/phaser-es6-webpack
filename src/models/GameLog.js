// game log mongoose model

// Imports - 3rd party
const mongoose = require('mongoose');

const GameLogSchema = new mongoose.Schema({
  sign: { type: String, default: 'A Ninja has no name', trim: true },
  playTimes: [{
    level: { type: Number, default: 1 },
    duration: { type: Number, default: 0 }
  }],
  level: { type: Number, default: 1 }
}, {
  timestamps: true
});

// Validation
// GameLogSchema.path('summary').validate(function (summary) {
//   return summary.length;
// }, 'Summary cannot be blank');

// Methods
GameLogSchema.methods = {};

// Static methods
GameLogSchema.statics = {};

// Create issue model
mongoose.model('GameLog', GameLogSchema);