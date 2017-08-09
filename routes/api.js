var express = require('express')
var router = express.Router()
var cosmic = require('cosmicjs')

router.post('/', function(req, res) {
  if (req.query.write_key !== req.app.locals.config.bucket.write_key) res.redirect('/')
  var stripe = require('stripe')(req.app.locals.stripeKeySecret)
  switch (req.query.query) {
    case 'deleteUser':
      console.log(req.body)
      break;
    default:
      res.status(500).json({ error: 'Unsupported' })
  }
});

module.exports = router
