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
   * Get the play count statistic data
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  getPlayCountStat: function (req, res, next) {
    return GameLog.find(function (err, gameLogs) {

      if (err) {
        return next(err);
      }

      res.send(gameLogs);

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