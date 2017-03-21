
var databox = require('node-databox');

var endpoint = process.env.DATABOX_DRIVER_PHILLIPSHUE_DATABOX_STORE_BLOB_ENDPOINT;
var datasourceid = 'philipsHueSettings';

var settingsCache = null;

module.exports.getSettings = () => {
 return new Promise((resolve,reject)=>{

   if(settingsCache !== null) {
     resolve(settingsCache);
   }

   databox.keyValue.read(endpoint,datasourceid)
   .then((settings)=>{
     if(settings.status && settings.status == 404) {
      return Promise.reject('No setting found.');
     }
     console.log("[getSettings]",settings);
     settingsCache = settings;
     resolve(settings);
   })
   .catch((err)=>{
     reject(err);
   });

 });
}

module.exports.setSettings = (settings) => {
 
 //to do validate settings
 return new Promise((resolve,reject)=>{
   databox.keyValue.write(endpoint,datasourceid,settings)
   .then(()=>{
     settingsCache = settings;
     resolve(settings);
   })
   .catch((err)=>{
     reject(err);
   });

 });
};