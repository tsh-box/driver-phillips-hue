var express = require('express');
var router = express.Router();

var hue = require('./../hue/hue.js');

router.get('/', function(req, res, next) {
	console.log("res.render('config', {})");
  res.render('config', {});
});

router.post('/', function (req, res) {
    var ip_address = (req.body.title);

    console.log(req.body.title);

    hue.findHub(ip_address)
    .then((data)=>{
       res.send(data);
    })
    .catch((err)=>{
       res.status(401).send("Failed to find hue bridge at " + ip_address + "<b>" + err + "</b>");
    });

});

module.exports = router;


