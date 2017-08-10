var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async');
var _ = require('lodash')

router.get('/:slug', function(req, res) {
  async.series([
    function(cb) {
      cosmic.getObjectType(req.app.locals.config, { type_slug: 'posts' }, function(err, response) {
        res.locals.post = _.filter(response.objects.all, function(post) {
          return post.slug === req.params.slug
        })
        if (!res.locals.post) res.locals.not_found = true
        cb()
      })
    },
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'site' }, function(err, response) {
        res.locals.config = response.object.metadata
        res.locals.user = req.session.user
        return res.render('post.handlebars')
      })
    }
  ])
});



module.exports = router;
