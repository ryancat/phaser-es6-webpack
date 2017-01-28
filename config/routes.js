'use strict';

/**
 * Module dependencies.
 */
const path = require('path');
const gameLogController = require('../src/models/gameLogController')

/**
 * Route middlewares
 */

/**
 * Expose routes
 */
module.exports = function (app) {

  // Page request
  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../index.html'));
  });

  // API
  // app.get('/api/issue/issueList', issuesController.getAllIssues);
  // app.post('/api/issue/save', issuesController.save);
  // app.post('/api/issue/moveIssuePhase', issuesController.moveIssuePhase);
  // app.post('/api/issue/updateIssueCue', issuesController.updateIssueCue);
  // app.post('/api/search/issue', issuesController.searchIssue);
  // app.get('/api/user/getCurrentUser', usersController.getCurrentUser);

  app.get('/gameLog/playCountStat', gameLogController.getPlayCountStat);
  app.post('/gameLog/save', gameLogController.saveGameLog);

  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    console.error(err.stack);
  });

};