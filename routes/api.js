var express = require('express')
var router = express.Router()
var cosmic = require('cosmicjs')

router.get('/', function(req, res) {
  if (req.query.read_key !== req.app.locals.config.bucket.read_key) res.redirect('/')
  var stripe = require('stripe')(req.app.locals.stripeKeySecret)
  
  switch (req.query.query) {
    case 'revenue':
      stripe.charges.list(function (err, charges) {
        console.log(charges.data)
        var revenue = charges.data.map(function (charge) {
          return charge.amount
        }).reduce(function (sum, val) {
          return sum + val
        })
        res.status(200).json({ data: revenue })
      })
      break;
    default:
      res.status(501).json({ error: 'Request not compatible'})
  }

});

module.exports = router
