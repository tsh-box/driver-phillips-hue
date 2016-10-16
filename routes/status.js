var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    res.send("all is OK");
  
});

module.exports = router;