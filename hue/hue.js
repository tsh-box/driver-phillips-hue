
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

exports.list_lights = function (done) {
  
  var success_result = function(result) {
    var vendor_id;
    var sensor_type_id;
    var datastore_id;
    var driver_id;
    var lights = result.lights; 
    databox_directory.register_vendor("Phillips_Hue", function(result) {
      vendor_id = result.id;
      databox_directory.register_driver("driver_phillipshue", "amazing phillips hue actuating and sensing driver", vendor_id, function(result) {
        driver_id = result.id;
        databox_directory.register_sensor_type("hue_bulb", function(result) {
          sensor_type_id = result.id;
          databox_directory.get_datastore_id("datastore_timeseries", function(result) {
            datastore_id = result.id;
            for (var i in lights){
              console.log(lights[i]);
              databox_directory.register_sensor(driver_id, sensor_type_id, datastore_id, vendor_id, lights[i].id+"-on", "is switched on", "on", "bulb is on or not", lights[i].name, function (result) {
                console.log(result);
              });
              databox_directory.register_sensor(driver_id, sensor_type_id, datastore_id, vendor_id, lights[i].id+"-bri", "is switched on", "on", "bulb is on or not", lights[i].name, function (result) {
                console.log(result);
              });
              databox_directory.register_sensor(driver_id, sensor_type_id, datastore_id, vendor_id, lights[i].id+"-hue", "is switched on", "on", "bulb is on or not", lights[i].name, function (result) {
                console.log(result);
              });
              databox_directory.register_sensor(driver_id, sensor_type_id, datastore_id, vendor_id, lights[i].id+"-sat", "is switched on", "on", "bulb is on or not", lights[i].name, function (result) {
                console.log(result);
              });
              databox_directory.register_sensor(driver_id, sensor_type_id, datastore_id, vendor_id, lights[i].id+"-ct", "is switched on", "on", "bulb is on or not", lights[i].name, function (result) {
                console.log(result);
              });


            }
          });
        });
      });
    });
    done(result);
  };

  jsonfile.readFile(userfile, function(err, obj) {
    if(err)
      res.send(err)
    else{
      api = new HueApi(obj.hostname, obj.hash);
      api.lights()
      .then(success_result)
      .fail(success_result)
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
      if(bridge)
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
