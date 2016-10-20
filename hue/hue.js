
var hue = require("node-hue-api");
var HueApi = require("node-hue-api").HueApi;
var jsonfile = require('jsonfile')
var databox_directory = require('./../utils/databox_directory.js');
 
var userfile = './hue/user.json'


 // 2 seconds

exports.lights_on = function(light_no, done) {

  var displayResult = function(result) {
    done(result);
  };

  var displayError = function(result) {
    done(result);
  };

  jsonfile.readFile(userfile, function(err, obj) {
    if(err)
      res.send(err)
    else{
      api = new HueApi(obj.hostname, obj.hash);
      lightState = hue.lightState;
      state = lightState.create();
      api.setLightState(light_no, state.on())
      .then(displayResult)
      .fail(displayError)
      .done();
    }
  }); 

};

exports.lights_off = function(light_no, done) {
  console.log(light_no);
  var displayResult = function(result) {
    done(result);
  };

  var displayError = function(result) {
    done(result);
  };

  jsonfile.readFile(userfile, function(err, obj) {
    if(err)
      res.send(err)
    else{
      api = new HueApi(obj.hostname, obj.hash);
      lightState = hue.lightState;
      state = lightState.create();
      api.setLightState(light_no, state.off())
      .then(displayResult)
      .fail(displayError)
      .done();
    }
  }); 

};

exports.get_lights = function(done) {

  var success_result = function(result) {
    done(result.lights);
  };


  var fail_result = function(result) {
  
    done(result);
  };

  jsonfile.readFile(userfile, function(err, obj) {
    if(err)
      console.log(err)
    else{
      api = new HueApi(obj.hostname, obj.hash);
      api.lights()
      .then(success_result)
      .fail(fail_result)
      .done();
    }
  }); 

}


exports.list_lights = function (done) {
  
  var fail_result = function(result) {
    console.log("failed");
    console.log(result);
  };

  var success_result = function(result) {
    var vendor_id;
    var sensor_type_id;
    var datastore_id;
    var driver_id;
    var lights = result.lights; 

    var on_id;
    var bri_id;
    var hue_id;
    var sat_id;
    var ct_id;

    databox_directory.register_vendor("Phillips_Hue", function(result) {
      vendor_id = result.id;
      databox_directory.register_driver("driver_phillipshue", "amazing phillips hue actuating and sensing driver", vendor_id, function(result) {
        driver_id = result.id;
        databox_directory.get_datastore_id("datastore-timeseries", function(result) {
          console.log(result);
          datastore_id = result.id;


          databox_directory.register_sensor_type("bulb-on", function(result) {
            on_id = result.id;
            for (var i in lights){
              console.log(lights[i]);
              databox_directory.register_sensor(driver_id, on_id, datastore_id, vendor_id, lights[i].id, "is switched on", "on", "bulb is on or not", lights[i].name, function (result) {
                console.log(result);
              });
            }
          });

          databox_directory.register_sensor_type("bulb-bri", function(result) {
            on_id = result.id;
            for (var i in lights){
              console.log(lights[i]);
              databox_directory.register_sensor(driver_id, bri_id, datastore_id, vendor_id, lights[i].id, "is switched on", "on", "bulb brightness", lights[i].name, function (result) {
                console.log(result);
              });
            }
          });

          databox_directory.register_sensor_type("bulb-hue", function(result) {
            on_id = result.id;
            for (var i in lights){
              console.log(lights[i]);
              databox_directory.register_sensor(driver_id, on_id, datastore_id, vendor_id, lights[i].id, "is switched on", "on", "bulb hue", lights[i].name, function (result) {
                console.log(result);
              });
            }
          });

          databox_directory.register_sensor_type("bulb-sat", function(result) {
            on_id = result.id;
            for (var i in lights){
              console.log(lights[i]);
              databox_directory.register_sensor(driver_id, on_id, datastore_id, vendor_id, lights[i].id, "is switched on", "on", "bulb saturation", lights[i].name, function (result) {
                console.log(result);
              });
            }
          });

          databox_directory.register_sensor_type("bulb-ct", function(result) {
            on_id = result.id;
            for (var i in lights){
              console.log(lights[i]);
              databox_directory.register_sensor(driver_id, on_id, datastore_id, vendor_id, lights[i].id, "is switched on", "on", "bulb CT", lights[i].name, function (result) {
                console.log(result);
              });
            }
          });

        }); // end get datastore id
      }); // end register driver
    }); // end register vendor
  }; // end success result

  jsonfile.readFile(userfile, function(err, obj) {
    if(err)
      res.send(err)
    else{
      api = new HueApi(obj.hostname, obj.hash);
      api.lights()
      .then(success_result)
      .fail(fail_result)
      .done();
    }
  }); 
};


exports.setup = function(done) {
  timeout = 2500;
  var hostname;
  var user;

  var success_result = function(result) {
    var user_object = {user: "databox", hash: result, "hostname": hostname};
    jsonfile.writeFile(userfile, user_object, function (err) {
      console.error(err)
    })
    done(user_object);
  };

  var fail_result = function(result) {
    done(result);
  };

  var hue2 = new HueApi();
  var displayBridges = function(bridge) {
      console.log(bridge);
      if(bridge.length > 0)
      { 
        console.log(bridge);
        hostname = bridge[0].ipaddress;
        hue2.registerUser(hostname, "databox")
        .then(success_result)
        .fail(fail_result)
        .done();
      }
      else
      {
        done({"error":"no bridges found"});
      }
  };

  hue.upnpSearch(timeout)
  .then(displayBridges)
  .done();
};


exports.fudge = function(hostname, done) {

  var user;
  var hue2 = new HueApi();

  var success_result = function(result) {
    var user_object = {user: "databox", hash: result, "hostname": hostname};
    jsonfile.writeFile(userfile, user_object, function (err) {
      console.error(err)
    })
    this.list_lights(function (complete) {
      done(user_object);
    });
    
  };

  var fail_result = function(result) {
    done(result);
  };

  hue2.registerUser(hostname, "databox")
  .then(success_result)
  .fail(fail_result)
  .done();
     
};
