var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async');
var _ = require('lodash')
var bcrypt = require('bcrypt')

router.get('/', function(req, res) {
  async.series([
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'site' }, function(err, response) {
        res.locals.config = response.object.metadata
        res.locals.route_login = true
        return res.render('login.handlebars')
      })
    }
  ])
});

router.post('/', function(req, res) {
  cosmic.getObjectType(req.app.locals.config, { type_slug: 'users' }, function (err, response) {
    if (err) res.status(500).json({ status: 'error', data: response })
    else {
      async.eachSeries(response.objects.all, function (user, eachCb) {
        if (!_.find(user.metafields, { key: 'email', value: req.body.email.trim().toLowerCase() }))
          return eachCb()
        const stored_password = _.find(user.metafields, { key: 'password' }).value
        bcrypt.compare(req.body.password, stored_password, function (err, correct) {
          if (correct) res.locals.user_found = user
          eachCb()
        })
      }, function () {
        if (res.locals.user_found) {
          req.session.user = {
            first_name: res.locals.user_found.metafield.first_name.value,
            last_name: res.locals.user_found.metafield.last_name.value,
            email: res.locals.user_found.metafield.email.value
          }
          req.session.save()
          return res.redirect('/posts')
        }
        return res.status(404).json({ status: 'error', message: 'User not found' })
      })
    }
  })
})



module.exports = router;
