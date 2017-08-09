var express = require('express')
var router = express.Router()
var cosmic = require('cosmicjs')
var axios = require('axios')

router.post('/', function(req, res) {
  var stripe = require('stripe')(req.app.locals.stripeKeySecret)
  var endpointSecret = 'whsec_NEcZRxKQlHOQYgbuvWBoiX4UNhHADMXL'
  var sig = req.headers['stripe-signature']
  var event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  switch (req.body.type) {
    case 'charge.succeeded':
      cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function (err, response) {
        var currentObject = response.object
        currentObject.metadata.revenue = currentObject.metadata.revenue + event.object.amount
        axios({
          method: 'put',
          url: `https://api.cosmicjs.com/v1/${req.app.locals.config.bucket.slug}/edit-object`,
          data: currentObject
        }).then(res.status(200).json({ data: 'success' }))
      })
    break;
    case 'customer.subscription.deleted':
      cosmic.deleteObject(req.app.locals.config, { slug: 'user', write_key: req.app.locals.config.bucket.slug }, function (err, response) {
        cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function (err, response) {
          var currentObject = response.object
          currentObject.metadata.cancellations = currentObject.metadata.cancellations + 1
          axios({
            method: 'put',
            url: `https://api.cosmicjs.com/v1/${req.app.locals.config.bucket.slug}/edit-object`,
            data: currentObject
          }).then(res.status(200).json({ data: 'success' }))
        })
      })
    default:
      res.status(500).json({ error: 'Bad Request' })
      break;
  }
});

module.exports = router
