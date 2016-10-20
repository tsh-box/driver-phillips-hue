var express = require('express');
var router = express.Router();

var hue = require('./../hue/hue.js');

 


timeout = 2000; // 2 seconds

/* GET methods for getting all data for each entity type listing. */
router.post('/actuate', function(req, res, next) {
  		
      /* 
        get local light ID from databox directory actuator ID
        get actuation method
        get action parameter ()
        Function  Details
        on(value) Sets the on state, where the value is true or false
        bri(value)  Sets the brightness, where value from 0 to 255
        hue(value)  Sets the hue, where value from 0 to 65535
        sat(value)  Sets the saturation value from 0 to 255
        ct(colorTemperature)  Set the color temperature to a value between 153 and 500
      
      */

      // TOSH NEED TO TAKE GLOBAL AND LOOKUP vendor_actuator_id 
      var light_no = req.body.vendor_actuator_id;
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


