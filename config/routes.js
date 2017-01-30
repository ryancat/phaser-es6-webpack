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
  app.get('/gameLog/playStatByLevel', gameLogController.getPlayStatByLevel);
  app.post('/gameLog/save', gameLogController.saveGameLog);

  /**
   * Error handling
   */
  app.use(function (err, req, res, next) {
    console.error(err.stack);
  });

};