var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async');
var _ = require('lodash')

router.get('/', function(req, res) {
  async.series([
    function(cb) {
      cosmic.getObjectType(req.app.locals.config, { type_slug: 'posts' }, function(err, response) {
        res.locals.all_posts = response.objects.all
        cb()
      })
    },
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'site' }, function(err, response) {
        res.locals.config = response.object.metadata
        res.locals.user = req.session.user
        res.locals.route_posts = true
        if (req.session.user) res.locals.logged_in = true
        if (!req.session.user) {
          res.locals.error = "Create an account to view premium content"
          res.locals.posts = _.filter(res.locals.all_posts, function(post) {
            return !post.metadata.premium
          })
          return res.render('posts.handlebars')
        }
        res.locals.posts = _.filter(res.locals.all_posts, function(post) {
          return post.metadata.premium
        })
        return res.render('posts.handlebars')
      })
    }
  ])
});



module.exports = router;
