var express = require('express')
var router = express.Router()

/* GET home page. */

router.get('/', function(req, res) {
  req.session.destroy()
  return res.redirect('/')
});

module.exports = router
