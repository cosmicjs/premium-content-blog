var express = require('express')
var router = express.Router()
var cosmic = require('cosmicjs')
var axios = require('axios')

router.post('/', function(req, res) {
  event = req.body
  switch (event.type) {
    case 'customer.subscription.deleted':
      cosmic.deleteObject(req.app.locals.config, { slug: 'user', write_key: req.app.locals.config.bucket.slug }, function (err, response) {
        cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function (err, response) {
          var currentObject = response.object
          currentObject.metadata.cancellations = currentObject.metadata.cancellations + 1
          currentObject.metafield.cancellations.value = currentObject.metadata.cancellations + 1
          currentObject.write_key = req.app.locals.config.bucket.write_key
          axios({
            method: 'put',
            url: `https://api.cosmicjs.com/v1/${req.app.locals.config.bucket.slug}/edit-object`,
            data: currentObject
          }).then(function (axRes) {
            console.log('Success')
          }).catch(function (axError) {
            console.log('Error')
          })
        })
      })
      return res.json({ received: true})
      break;
    default:
      return res.json({ received: false })
  }
});

module.exports = router
