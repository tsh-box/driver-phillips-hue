var express = require('express');
var router = express.Router();

var hue = require('./../hue/hue.js');
var databox_directory = require('./../utils/databox_directory.js');

 


timeout = 2000; // 2 seconds

/* GET methods for getting all data for each entity type listing. */
router.post('/actuate', function(req, res, next) {
  		
      var actuator_id = req.body.actuator_id;
      var method = req.body.method;
      var data = req.body.data;

      databox_directory.get_my_registered_actuators(databox_directory.get_vendor_id(), (err, actuators) => {
        if(err) {
          console.log(err);
          res.send(err);
          return;
        }
        actuators = JSON.parse(actuators);

        actuator = actuators.find((itm)=>{return itm.id == actuator_id});

        if(actuator == 'undefined') {
          console.log("Actuator not found!!!!");
          res.send("Actuator not found!!!!");
          return;
        }

        switch(actuator.actuator_type) {
          case 'set-bulb-on':
              hue.lights_on(actuator.vendor_actuator_id, data, function(data){
                res.send(data);
              });
            break;
          case 'set-bulb-hue':
            hue.lights_hue(actuator.vendor_actuator_id, data, function(data){
                res.send(data);
              });
            break;
          case 'set-bulb-sat':
            hue.lights_sat(actuator.vendor_actuator_id, data, function(data){
                res.send(data);
              });
            break;
          case 'set-bulb-bri':
            hue.lights_bri(actuator.vendor_actuator_id, data, function(data){
                res.send(data);
              });
            break;
          case 'set-bulb-ct':
            hue.lights_ct(actuator.vendor_actuator_id, data, function(data){
                res.send(data);
              });
            break;
          default:
            console.log("Not implemented");
            res.send("Not implemented");
        }
        
      });

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


