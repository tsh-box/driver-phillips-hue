var express = require('express');
var router = express.Router();

var hue = require('./../hue/hue.js');

 


timeout = 2000; // 2 seconds

/* GET methods for getting all data for each entity type listing. */
router.post('/actuate', function(req, res, next) {
  		
      var light_no = req.body.light_no;
      var method = req.body.method;

      switch(method) {
        case "on":
          hue.lights_on(light_no, function(data){
            res.send(data);
          });
          break;
        
        case "off": 
          hue.lights_off(light_no, function(data){
            res.send(data);
          });
          break;


      }
});

router.get('/list_lights', function(req, res, next) {
  hue.list_lights(function(data) {
    res.send(data);
  });
});


router.get('/setup', function(req, res, next) {

  hue.setup(function(data){
    res.send(data);
  });
});

module.exports = router;


