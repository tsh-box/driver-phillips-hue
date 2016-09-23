
var hue = require("node-hue-api");
var HueApi = require("node-hue-api").HueApi;
var jsonfile = require('jsonfile')
 
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
  timeout = 2000;
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
      if(bridge)
      {
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
