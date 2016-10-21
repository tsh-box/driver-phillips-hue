
var hue = require("node-hue-api");
var HueApi = require("node-hue-api").HueApi;
var jsonfile = require('jsonfile')
var databox_directory = require('./../utils/databox_directory.js');
 
var userfile = './hue/user.json'



var clamp = function (x, lower, upper) {
  return Math.min(upper, Math.max(lower, x));
}
/*bri(value)	Sets the brightness, where value from 0 to 255
hue(value)	Sets the hue, where value from 0 to 65535
sat(value)	Sets the saturation value from 0 to 255
xy(x, y)	Sets the xy value where x and y is from 0 to 1 in the Philips Color co-ordinate system
ct(colorTemperature)	Set the color temperature to a value between 153 and 500*/

exports.lights_on = function(light_no, val, done) {

  jsonfile.readFile(userfile, function(err, obj) {
    if(err) {
      done(err)
    } else {
      api = new HueApi(obj.hostname, obj.hash);
      lightState = hue.lightState;
      state = lightState.create();
      if(val == 'on' || val == true || val == 1) {
        api.setLightState(light_no, state.on())
        .then(() => {done("SUCCESS")})
        .catch((err) => {done("FAIL" + err)});
      } else {
        api.setLightState(light_no, state.off())
        .then(() => {done("SUCCESS")})
        .catch((err) => {done("FAIL" + err)});
      }
    }
  }); 

};

exports.lights_bri = function(light_no, val, done) {
  jsonfile.readFile(userfile, function(err, obj) {
    if(err) {
      done(err)
    } else {
      api = new HueApi(obj.hostname, obj.hash);
      lightState = hue.lightState;
      state = lightState.create();
      api.setLightState(light_no, state.bri(clamp(val,0,255)))
      .then(() => {done("SUCCESS")})
      .catch((err) => {done("FAIL" + err)});
    }
  }); 
};

exports.lights_hue = function(light_no, val, done) {
  jsonfile.readFile(userfile, function(err, obj) {
    if(err) {
      done(err)
    } else {
      api = new HueApi(obj.hostname, obj.hash);
      lightState = hue.lightState;
      state = lightState.create();
      api.setLightState(light_no, state.hue(clamp(val,0,65535)))
      .then(() => {done("SUCCESS")})
      .catch((err) => {done("FAIL" + err)});
    }
  }); 
};

exports.lights_sat = function(light_no, val, done) {
  jsonfile.readFile(userfile, function(err, obj) {
    if(err) {
      done(err)
    } else {
      api = new HueApi(obj.hostname, obj.hash);
      lightState = hue.lightState;
      state = lightState.create();
      api.setLightState(light_no, state.sat(clamp(val,0,255)))
      .then(() => {done("SUCCESS")})
      .catch((err) => {done("FAIL" + err)});
    }
  }); 
};

exports.lights_ct = function(light_no, val, done) {
  jsonfile.readFile(userfile, function(err, obj) {
    if(err) {
      done(err)
    } else {
      api = new HueApi(obj.hostname, obj.hash);
      lightState = hue.lightState;
      state = lightState.create();
      api.setLightState(light_no, state.bri(clamp(val,153,500)))
      .then(() => {done("SUCCESS")})
      .catch((err) => {done("FAIL" + err)});
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

exports.list_lights = function (vendor_id, driver_id, datastore_id, done) {

  console.log("list_lights:: ", vendor_id, driver_id, datastore_id);

  jsonfile.readFile(userfile, function(err, obj) {
    
    if(err) {
      done(err,{});
      return;  
    }

    api = new HueApi(obj.hostname, obj.hash);
    api.lights()
    .then((result) => {
      //TODO this is better and works but still v ugly
      var sensor_type_id;
      var lights = result.lights; 
      console.log(lights);
      console.log("REGISTERING SENSORS TYPE");
      databox_directory.register_sensor_type("bulb-on", function(result) {
        var on_id = result.id;
        console.log("FIRST SENSOR TYPE ", on_id);
        for (var i in lights) {
          console.log("REGISTERING SENSORS", i);
          databox_directory.register_sensor(driver_id, on_id, datastore_id, vendor_id, lights[i].id, "is switched on", "on", "bulb is on or not", lights[i].name, function (err,data) { if(err) console.log("[ERROR]" + lights[i].id, data);});
        }
      });
      databox_directory.register_sensor_type("bulb-hue", function(result) {
        var hue_id = result.id;
        for (var i in lights) {
          databox_directory.register_sensor(driver_id, hue_id, datastore_id, vendor_id, lights[i].id, "hue", "hue", "current bulb hue", lights[i].name, function (err,data) { if(err) console.log("[ERROR]" + lights[i].id, data);});
        }
      });
      databox_directory.register_sensor_type("bulb-bri", function(result) {
        var hue_id = result.id;
        for (var i in lights) {
          databox_directory.register_sensor(driver_id, hue_id, datastore_id, vendor_id, lights[i].id, "brightness", "bri", "current bulb brightness", lights[i].name, function (err,data) { if(err) console.log("[ERROR]" + lights[i].id, data);});
        }
      });
      databox_directory.register_sensor_type("bulb-sat", function(result) {
        var sat_id = result.id;
        for (var i in lights) {
          databox_directory.register_sensor(driver_id, sat_id, datastore_id, vendor_id, lights[i].id, "current bulb saturation", "sat", "saturation", lights[i].name, function (err,data) { if(err) console.log("[ERROR]" + lights[i].id, data);});
        }
      });
      databox_directory.register_sensor_type("bulb-ct", function(result) {
        var ct_id = result.id;
        for (var i in lights) {
          databox_directory.register_sensor(driver_id, ct_id, datastore_id, vendor_id, lights[i].id, "ct???", "ct", "current ct value", lights[i].name, function (err,data) { if(err) console.log("[ERROR]" + lights[i].id, data);});
        }
      });

      console.log("REGISTERING actuator TYPE");
      databox_directory.register_actuator_type("set-bulb-on", function(result) {
        var id = result.id;
        console.log("FIRST actuator TYPE ", id);
        for (var i in lights) {
          console.log("REGISTERING actuator", i);
          databox_directory.register_actuator(driver_id, id, vendor_id, 1, lights[i].id, "Switch bulb on or off", lights[i].name, function (err,data) { if(err) console.log("[ERROR]" + lights[i].id, data);});
        }
      });

      databox_directory.register_actuator_type("set-bulb-hue", function(result) {
        on_id = result.id;
        for (var i in lights) {
          databox_directory.register_actuator(driver_id, on_id, vendor_id, 1, lights[i].id, "Change bulbs hue", lights[i].name, function (err,data) { if(err) console.log("[ERROR]" + lights[i].id, data);});
        }
      });

      databox_directory.register_actuator_type("set-bulb-sat", function(result) {
        on_id = result.id;
        for (var i in lights) {
          databox_directory.register_actuator(driver_id, on_id, vendor_id, 1, lights[i].id, "Change bulbs saturation", lights[i].name, function (err,data) { if(err) console.log("[ERROR]" + lights[i].id, data);});
        }
      });

      databox_directory.register_actuator_type("set-bulb-ct", function(result) {
        on_id = result.id;
        for (var i in lights) {
          databox_directory.register_actuator(driver_id, on_id, vendor_id, 1, lights[i].id, "Change bulbs ct.", lights[i].name, function (err,data) { if(err) console.log("[ERROR]" + lights[i].id, data);});
        }
      });
      done(null,{});    
    })
    .fail((err) => {
      console.log("failed");
      console.log(result);
      done(err,{});
    })

  });

}


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
