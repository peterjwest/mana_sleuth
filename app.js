// Standard modules
var request = require('request');
var url = require('url');
var http = require('http');
var cheerio = require("cheerio");
var mongoose = require('mongoose');

// Util modules
var async = require('./util/async.js');
var scheduler = require('./util/scheduler.js');
var util = require('./util/util.js');
var modelGenerator = require('./util/model_generator.js');
var memoryTracker = require('./util/memory_tracker.js');

// App modules
var app = {};
app.router = require('./router.js');
app.scraper = require('./scraper.js')(request, cheerio, util);
app.schemas = require('./schemas.js')(mongoose);
app.models = modelGenerator(mongoose, app.schemas);
app.corrections = require('./corrections.js');
app.categories = require('./categories.js')(app, async, util);
app.expansions = require('./expansions.js')(app, async, util);
app.cards = require('./cards.js')(app, async, util);

mongoose.connect('mongodb://localhost/mana_sleuth');
memoryTracker.update();

var express = require('express');
var less = require('connect-lesscss');
var server = express.createServer();

server.configure(function() {
  server.set('views', __dirname + '/views');
  server.set('view engine', 'jade');
  server.use(express.static(__dirname + '/public'));
  server.use(express.bodyParser());
  server.use("/css/styles.css", less("public/less/styles.less", {paths: ["public/less"]}));
});

server.configure('development', function() {
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.get('/', function(request, response) {
  response.render('index', {
    title: "Mana Sleuth",
    subtitle: "Streamlined MTG card search",
    cards: false,
    categories: false,
    router: router,
    util: util
  });
});

server.post('/', function(request, response) {
  app.searchCards(request.param("query")).then(function(cards) {
    response.render('index', {
      title: "Mana Sleuth",
      subtitle: "Streamlined MTG card search",
      cards: cards,
      categories: app.categories,
      router: router,
      util: util
    });
  });
});

// server.listen(3000);

app.categories.update()
  .then(app.expansions.populate)
  .then(app.cards.update);