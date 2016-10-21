var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var databox_directory = require('./utils/databox_directory.js');
var hue = require('./hue/hue.js');
var timer = require('timers');
var request = require('request');

var DATASTORE_TIMESERIES_ENDPOINT = process.env.DATASTORE_TIMESERIES_ENDPOINT;

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

var vendor_id;
var driver_id;
var datastore_id;

databox_directory.register_driver('Phillips','databox-driver-phillipshue', 'An amazing phillips hue actuating and sensing driver')
.then((ids) => {
  console.log(ids);
  vendor_id = ids['vendor_id'];
  driver_id = ids['driver_id'];

  return databox_directory.get_datastore_id('databox-store-blob');;
})
.then((storeid) => {
  datastore_id = storeid;

  return new Promise((resolve, reject) => {
    hue.list_lights(vendor_id, driver_id, datastore_id, function (err,data){  
      if(err) {
        reject("Can't register sensors");
        return;
      }
      resolve();
    });
  });
})
.then(() => {
  //poll hue bridge for data
  var data_poster = function(foo) {
    hue.get_lights(function(lights) {
      databox_directory.get_my_registered_sensors(vendor_id, function (result) {
        
        var lights_by_vendor_sensor_id = [];
        for (var i in lights){
          lights_by_vendor_sensor_id[lights[i].id] = lights[i];
        }
        console.log("lights_by_vendor_sensor_id",lights_by_vendor_sensor_id);
        
        sensors = JSON.parse(result);
        for(sensor of sensors) {
          var light = lights_by_vendor_sensor_id[sensor.vendor_sensor_id];
          var val = light['state'][sensor.short_unit];
          console.log(sensor.short_unit + " = " + val);
          saveReading(sensor.id,vendor_id,val);
        }
      });
    });     
  
  };
  timer.setInterval(data_poster, 10000);
})
.catch((err) => {console.log("[Error]" + err)});

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});

module.exports = app;

function saveReading(s_id,v_id,reading) {
      var options = {
          uri: DATASTORE_TIMESERIES_ENDPOINT + '/reading',
          method: 'POST',
          json: 
          {
            sensor_id: s_id, 
            vendor_id: v_id, 
            value: reading   
          }
      };
      request.post(options, (error, response, body) => {console.log(error, body)});
    }