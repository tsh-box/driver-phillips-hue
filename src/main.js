/*jshint esversion: 6 */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var hue = require('./hue/hue.js');
var timer = require('timers');

var databox = require('node-databox');

var DATABOX_STORE_BLOB_ENDPOINT = process.env.DATABOX_DRIVER_PHILIPSHUE_DATABOX_STORE_BLOB_ENDPOINT;

var api = require('./routes/api');
var config = require('./routes/config');
var status = require('./routes/status');

var app = express();

var debug = require('debug')('driver_phillipshue:server');
var http = require('http');

// get port from env or 3000
const PORT = 8080;
app.set('port', PORT);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// app setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', api);
app.use('/', config);
app.use('/status', status);
app.use('/ui', express.static('./static'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers for app 

// development error handler
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = http.createServer(app);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  //var bind = typeof port === 'string'
  //  ? 'Pipe ' + port
  ///  : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('port is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on('error', onError);
server.on('listening', onListening);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
module.exports = app;


var HueApi = require("node-hue-api").HueApi;
var userConfigFile = './hue/user.json';
var registeredLights = {} //keep track of which lights have been registered as datasources
var vendor = "Philips Hue";

databox.waitForStoreStatus(DATABOX_STORE_BLOB_ENDPOINT,'active',10)
  .then(()=>{

    var waitForConfig = function() {
      jsonfile.readFile(userConfigFile, function(err, obj) {
        if(err) {
          console.log("[waitForConfig] waiting for user configuration");
          setTimeout(waitForConfig,1000);
        } else {
          resolve(new HueApi(obj.hostname, obj.hash));
        }
      });
    };

    waitForConfig();

  })
  .then((hueApi)=>{
    
    var infinitePoll = function() {

        hueApi.lights()
        .then((lights)=>{
           //Update available datasources  
           for(var light of lights) {
              
              if( !(light.name in registeredLights)) {
                //new light found 
                console.log("[NEW BULB FOUND] " + light.id + " " + light.name);
                registeredLights[light.id] = light.id;

                //register datasources
                databox.catalog.registerDatasource({
                  description: light.name + ' on off state.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'bulb-on',
                  datasourceid: 'bulb-on-' + light.id,
                  storeType: 'databox-store-blob'
                });
                databox.catalog.registerDatasource({
                  description: light.name + ' hue value.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'bulb-hue',
                  datasourceid: 'bulb-hue-' + light.id,
                  storeType: 'databox-store-blob'
                });
                databox.catalog.registerDatasource({
                  description: light.name + ' brightness value.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'bulb-bri',
                  datasourceid: 'bulb-bri-' + light.id,
                  storeType: 'databox-store-blob'
                });
                databox.catalog.registerDatasource({
                  description: light.name + ' saturation value.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'bulb-sat',
                  datasourceid: 'bulb-sat-' + light.id,
                  storeType: 'databox-store-blob'
                });
                databox.catalog.registerDatasource({
                  description: light.name + ' color temperature value.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'bulb-ct',
                  datasourceid: 'bulb-ct' + light.id,
                  storeType: 'databox-store-blob'
                });

                //register actuators 
                databox.catalog.registerDatasource({
                  description: 'Set ' + light.name + ' bulbs on off state.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'set-bulb-on',
                  datasourceid: 'set-bulb-on-' + light.id,
                  storeType: 'databox-store-blob',
                  isActuator:true
                });
                databox.catalog.registerDatasource({
                  description: 'Set ' + light.name + ' hue value.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'set-bulb-hue',
                  datasourceid: 'set-bulb-hue-' + light.id,
                  storeType: 'databox-store-blob',
                  isActuator:true
                });
                databox.catalog.registerDatasource({
                  description:'Set ' + light.name + ' brightness value.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'set-bulb-bri',
                  datasourceid: 'set-bulb-bri-' + light.id,
                  storeType: 'databox-store-blob',
                  isActuator:true
                });
                databox.catalog.registerDatasource({
                  description: 'Set ' + light.name + ' saturation value.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'set-bulb-sat',
                  datasourceid: 'set-bulb-sat-' + light.id,
                  storeType: 'databox-store-blob',
                  isActuator:true
                });
                databox.catalog.registerDatasource({
                  description: 'Set ' + light.name + ' color temperature value.',
                  contentType: 'text/json',
                  vendor: vendor,
                  type: 'set-bulb-ct',
                  datasourceid: 'set-bulb-ct' + light.id,
                  storeType: 'databox-store-blob',
                  isActuator:true
                });

              } else {

                //Update bulb state bulb-on-
                databox.timeseries.write(DATABOX_STORE_BLOB_ENDPOINT, 'bulb-on-'  + light.id, light.state.on);
                databox.timeseries.write(DATABOX_STORE_BLOB_ENDPOINT, 'bulb-hue-' + light.id, light.state.hue);
                databox.timeseries.write(DATABOX_STORE_BLOB_ENDPOINT, 'bulb-bri-' + light.id, light.state.bri);
                databox.timeseries.write(DATABOX_STORE_BLOB_ENDPOINT, 'bulb-sat-' + light.id, light.state.sat);
                databox.timeseries.write(DATABOX_STORE_BLOB_ENDPOINT, 'bulb-ct-'  + light.id, light.state.ct);

              }
           }
        })
        .catch((error)=>{
          console.log("[ERROR]", error);
        });

        
        setTimeout(infinitePoll,5000);
    };

    infinitePoll();

  })
  .catch((error)=>{
    console.log("[ERROR]",error);
  });
