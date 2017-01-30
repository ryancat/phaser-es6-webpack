'use strict'

var express = require('express');
var webpack = require('webpack');
var bodyParse = require('body-parser');
var mongoose = require('mongoose');
var _ = require('lodash');

// Config from source code
var dbConfig = require('./config/db');

var app = express();
////////////////////////
// Import all schemas //
////////////////////////
require('./src/models/GameLog');


// Connect to mongodb
mongoose.connect(dbConfig.url);
var db = mongoose.connection;

db.on('error', function (err) {
  console.error('Connection error: ', err);
});

db.once('open', function () {

  console.log('Connected to mongodb!');

  //////////////////////////////////////
  // Middlewares used by all requests //
  //////////////////////////////////////

  app.use(express.static(__dirname));
  // Using qs for better support on x-www-form-urlencoded data
  // @See http://stackoverflow.com/questions/29175465/body-parser-extended-option-qs-vs-querystring
  app.use(bodyParse.urlencoded({ extended: true }));
  app.use(bodyParse.json());
  // app.use(require('method-override')());


  require('./config/routes')(app);

});

app.listen(80, function (err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3333');
});