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
   */
  getPlayStatByLevel: function (req, res, next) {
    // return GameLog.find({
    //   type: 
    // }, function (err, playStatByLevel) {
    //   if (err) {
    //     return next(err);
    //   }

    //   res.send({
    //     playStatByLevel: playStatByLevel
    //   });
    // })

    // Do aggregation by level
    // Send something like:
    // {
    //    countByLevel: [10000, 1000, 100, 1]
    //    durationByLevel: [2000, 1500, 5000, 10000]
    // }
    // 
    // {
    //    1: {
    //      count: 10000,
    //      duration: 2000
    //    },
    //    
    //    2: {
    //      count: 1000,
    //      duration: 400
    //    }
    // } // Or array
    
    // Document
    // { 
    // "_id" : ObjectId("588cd993a6201334c85d6b55"), 
    // "updatedAt" : ISODate("2017-01-28T17:49:07.378Z"), 
    // "createdAt" : ISODate("2017-01-28T17:49:07.378Z"), 
    // "level" : 4, 
    // "playTimes" : [ 
    //   { "_id" : ObjectId("588cd993a6201334c85d6b59"), 
    //     "duration" : 5653, 
    //     "level" : 1 }, 
    //   { "_id" : ObjectId("588cd993a6201334c85d6b58"), 
    //     "duration" : 1527, 
    //     "level" : 2 }, 
    //   { "_id" : ObjectId("588cd993a6201334c85d6b57"), 
    //     "duration" : 2168, 
    //     "level" : 3 }, 
    //   { "_id" : ObjectId("588cd993a6201334c85d6b56"), 
    //   "duration" : 2443, 
    //   "level" : 4 } 
    // ], 
    // "sign" : "A Ninja has no name", 
    // "__v" : 0 }

    // mongoDB query db.gamelogs.aggregate({$unwind: "$playTimes"}, {$group: { "_id": "$playTimes.level", "playCount": {$sum: 1}, "duration": {$avg: "$playTimes.duration" } }})

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

  // /**
  //  * Update the game stat document
  //  */
  // updateGameStat: function (req, res, next) {

  //   // let gameLog = {
  //   //   // TODO: create player signature
  //   //   sign: this.playerSign,
  //   //   playTimes: this.measureStat.sessions.map((session) => {
  //   //     return {
  //   //       level: session.gameLevel,
  //   //       duration: session.end - session.start
  //   //     }
  //   //   }),
  //   //   level: this.gameLevel,
  //   //   
  //   // }

  //   var newGameLog = req.body

  //   // Find existing game stat
  //   gameLog.findOne({
  //     logType: 'gameStat'
  //   }, function (err, gameStat) {

  //     if (err) {
  //       return next(err);
  //     }



  //   });

  //   var gameStat = req.body.gameStat;

  //   return gameLog.findOneAndUpdate({
  //     'logType': 'gameStat'
  //   }, gameStat, {upsert: true}, function (err, updateResult) {
  //     if (err) {
  //       return next(err);
  //     }

  //     next(req, res, next);
  //   });

  // },

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

  // getAllIssues: function (req, res, next) {
  //   // Create issue model
  //   Issue.find(function (err, issues) {
  //     if (err) {
  //       return next(err);
  //     }

  //     res.send(issues);
  //   });
  // },

  // save: function (req, res) {

  //   var issue = new Issue(Object.assign(req.body, {
  //     // Additional information goes here
  //   }));

  //   // Create issue model
  //   issue.save(function (err, saveResult) {
  //     if (err) {
  //       return next(err);
  //     }

  //     res.send(saveResult);
  //   });

  // },

  // moveIssuePhase: function (req, res, next) {

  //   Issue.findById(req.body.issueId, function (err, issue) {
  //     if (err) {
  //       return next(err);
  //     }

  //     if (!issue) {
  //       return res
  //       .status(404)
  //       .json({
  //         message: 'Cannot find such issue to update'
  //       });
  //     }

  //     issue.update({
  //       step: req.body.step
  //     }, function (err, issue) {
  //       if (err) {
  //         return next(err);
  //       }

  //       res.send(issue);
  //     });

  //   });

  // },

  // updateIssueCue: function (req, res, next) {

  //   Issue.findById(req.body.issueId, function (err, issue) {
  //     if (err) {
  //       return next(err);
  //     }

  //     if (!issue) {
  //       return res
  //       .status(404)
  //       .json({
  //         message: 'Cannot find such issue to update'
  //       });
  //     }

  //     // Mutate issue with new cue
  //     // TODO: is there a better way to update?
  //     _.remove(issue.cues, { phase: req.body.phase })
  //     issue.cues.push({
  //       phase: req.body.phase,
  //       description: req.body.cue
  //     })

  //     Issue.update({
  //       _id: req.body.issueId
  //     }, 
  //     issue, {
  //       upsert: true,
  //       setDefaultsOnInsert: true
  //     }, function (err, issue) {
  //       if (err) {
  //         return next(err);
  //       }
  //       res.send(issue);
  //     });

  //   });

  // },

  // searchIssue: function (req, res, next) {

  //   const searchString = req.body.searchString;

  //   if (!searchString) {
  //     issuesController.getAllIssues(req, res, next);
  //   } else {
  //     Issue.find({

  //       // TODO: this will enable full-text search
  //       // In our case I want it to search using 'like'
  //       // How to using text index on searching text fragment?
  //       // $text: {
  //       //   $search: searchString
  //       // }
        
  //       $or: [
  //         { 'summary': new RegExp(searchString, 'i') },
  //         { 'description': new RegExp(searchString, 'i') },
  //         { 'tags': new RegExp(searchString, 'i') }
  //       ]

  //     }, function (err, issues) {

  //       if (err) {
  //         return next(err);
  //       }

  //       res.send(issues);

  //     });
  //   }
  // }

};

module.exports = gameLogController;