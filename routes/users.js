var express = require('express');
var router = express.Router();

/* users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/api/v1/beta/login', function(req, res, next) {
  var {email , password} = req.body
});

router.get('/api/v1/beta/register', function(req, res, next) {
});

module.exports = router;
