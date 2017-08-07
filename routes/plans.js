var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async')

router.get('/', function(req, res) {
  async.series([
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'site' }, function(err, response) {
        res.locals.config = response.object.metadata
        res.locals.route_signup = true
        cb()
      })
    },
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function(err, response) {
        res.locals.subscriptions = response.object.metadata
        res.render('plans.handlebars')
      })
    }
  ])
});

module.exports = router;
