'use strict';

/**
 * Module dependencies.
 */

/**
 * const GameLogSchema = new mongoose.Schema({
      sign: { type: String, default: 'A Ninja has no name', trim: true },
      playTimes: [{
        level: { type: Number, default: 1 },
        duration: { type: Number, default: 0 }
      }],
      level: { type: Number, default: 1 }
    }, {
      timestamps: true
    });
 */

const mongoose = require('mongoose');
const _ = require('lodash');

const GameLog = mongoose.model('GameLog');

const gameLogController = {

  /**
   * Get the play stat data by level
   * Do aggregation by level
   * Send something like:
   * {
   *    countByLevel: [10000, 1000, 100, 1]
   *    durationByLevel: [2000, 1500, 5000, 10000]
   * }
   * 
   * {
   *    1: {
   *      count: 10000,
   *      duration: 2000
   *    },
   *    
   *    2: {
   *      count: 1000,
   *      duration: 400
   *    }
   * }
   */
  getPlayStatByLevel: function (req, res, next) {
    
    GameLog.aggregate([
      {
        '$unwind': '$playTimes'
      }, {
      // Grouping pipeline
      '$group': {
        _id: '$playTimes.level',
        playCount: { '$sum': 1 },
        duration: { '$avg': '$playTimes.duration' }
      }
    }], function (err, aggregateResult) {
      if (err) {
        next(err);
      }

      res.send(aggregateResult);

    });

  },

  saveGameLog: function (req, res, next) {
    // Create GameLog model
    var gameLog = new GameLog(req.body);

    return gameLog.save(function (err, saveResult) {

      if (err) {
        return next(err);
      }

      res.send(saveResult);

    });
    
  }

};

module.exports = gameLogController;