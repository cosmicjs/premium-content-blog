var express = require('express')
var router = express.Router()
var cosmic = require('cosmicjs')
var axios = require('axios')

router.post('/', function(req, res) {
  var event = JSON.parse(req.body)
  switch (event.type) {
    case 'charge.succeeded':
      cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function (err, response) {
        var currentObject = response.object
        currentObject.metadata.revenue = currentObject.metadata.revenue + event.data.object.amount
        axios({
          method: 'put',
          url: `https://api.cosmicjs.com/v1/${req.app.locals.config.bucket.slug}/edit-object`,
          data: currentObject
        })
      })
      res.json({ received: true })
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
          })
        })
      })
      res.json({ received: true})
    default:
      res.json({ received: false })
      break;
  }
});

module.exports = router
