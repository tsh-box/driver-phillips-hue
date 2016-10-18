var express = require('express');
var router = express.Router();

var hue = require('./../hue/hue.js');

router.get('/', function(req, res, next) {
/*
  hue.setup(function(data){
    res.send(data);
  });
*/
	res.render('config', {});
});

router.get('/foo', function(req, res, next) {

  hue.setup(function(data){
    res.send(data);
  });

});

router.post('/', function (req, res) {
    var ip_address = (req.body.title);
    console.log(req.body.title);
    hue.fudge(ip_address, function(data){
   		res.send(data);
  	});
});

module.exports = router;


