var express = require('express')
var router = express.Router()
var cosmic = require('cosmicjs')

router.get('/', function(req, res) {
  if (req.query.read_key !== req.app.locals.config.bucket.read_key) res.redirect('/')
  var stripe = require('stripe')(req.app.locals.stripeKeySecret)
  switch (req.query.query) {
    case 'revenue':
      stripe.charges.list(function (err, charges) {
        if (err) {
          return res.status(500).json({ error: 'Internal Server Error'})
        }
        if (!charges.data) {
          revenue = 0
        } else {
          var revenue = charges.data.map(function (charge) {
            return charge.amount
          }).reduce(function (sum, val) {
            return sum + val
          })
        }
        res.status(200).json({ data: revenue })
      })
      break;
    case 'cancellations':
      stripe.refunds.list(function (err, refunds) {
        if (err) {
          return res.status(500).json({ error: 'Internal Server Error'})
        }
        if (!refunds.data) {
          var cancellations = 0
        } else {
          var cancellations = refunds.data.length
        }
        res.status(200).json({ data: cancellations })
      })
      break;
    default:
      res.status(501).json({ error: 'Request not supported'})
  }

});

router.post('/', function(req, res) {
  if (req.query.write_key !== req.app.locals.config.bucket.write_key) res.redirect('/')
  var stripe = require('stripe')(req.app.locals.stripeKeySecret)
  switch (req.query.query) {
    case 'deleteUser':
      stripe.customers.del(
        req.query.customer,
        function(err, success) {
          res.status(200).json({ data: 'User deleted '})
        }
      )
      break;
    default:
      res.status(501).json({ error: 'Request not supported' })
  }
});

module.exports = router
