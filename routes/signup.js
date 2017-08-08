var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async');
var bcrypt = require('bcrypt')

router.get('/', function(req, res) {
  if (req.session.user) res.redirect('/')
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
        res.locals.stripeKeyPublishable = req.app.locals.stripeKeyPublishable
        res.locals.planName = req.query.plan
        res.render('signup.handlebars')
      })
    }
  ])
});

router.post('/', function(req, res) {
  var stripe = require('stripe')(req.app.locals.stripeKeySecret)
  if (req.session.user) res.redirect('/')

  async.series({
    subscriptions: function(callback) {
      cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function(err, response) {
        callback(null, response.object.metadata)
      })
    },
    hash: function (callback) {
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        callback(null, hash)
      })
    }
  }, function (err, results) {

    stripe.customers.create({
      email: req.body.email,
      source: req.body.stripeToken
    }).then(function (customer) {
      return stripe.charges.create({
        amount: results.subscriptions[req.query.plan + "_price"].replace(/[$]/,'') + '00',
        currency: "usd",
        customer: customer.id
      })
    }).then(function (charge) {
      stripe.subscriptions.create({
        customer: charge.customer,
        items: [
          {
            plan: 'subscription-' + req.query.plan
          }
        ]
      })
      var object = {
        type_slug: 'users',
        title: req.body.first_name + ' ' + req.body.last_name,
        metafields: [
          {
            title: 'First name',
            key: 'first_name',
            type: 'text',
            value: req.body.first_name
          },
          {
            title: 'Last name',
            key: 'last_name',
            type: 'text',
            value: req.body.last_name
          },
          {
            title: 'Password',
            key: 'password',
            type: 'text',
            value: results.hash
          },
          {
            title: 'Email',
            key: 'email',
            type: 'text',
            value: req.body.email
          },
          {
            title: 'Stripe Id',
            key: 'stripe_id',
            type: 'text',
            value: charge.customer
          },
          {
            title: 'Subscription Type',
            key: 'subscription_type',
            type: 'text',
            value: req.query.plan
          }
        ]
      }
      if (req.app.locals.config.bucket.write_key) object.write_key = req.app.locals.config.bucket.write_key
      cosmic.addObject(req.app.locals.config, object, function (err, reponse) {
        if (err)
          res.status(500).json({ data: reponse })
        else {
          req.session.user = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
          }
          req.session.save()
          res.redirect('/posts')
        }
      })
    })
  })
})

module.exports = router
