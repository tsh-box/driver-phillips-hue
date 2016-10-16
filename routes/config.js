var express = require('express');
var router = express.Router();

var hue = require('./../hue/hue.js');

router.get('/', function(req, res, next) {

  hue.setup(function(data){
    res.send(data);
  });
});

module.exports = router;


