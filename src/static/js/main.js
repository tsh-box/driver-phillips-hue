
/*bri(value)	Sets the brightness, where value from 0 to 255
hue(value)	Sets the hue, where value from 0 to 65535
sat(value)	Sets the saturation value from 0 to 255
xy(x, y)	Sets the xy value where x and y is from 0 to 1 in the Philips Color co-ordinate system
ct(colorTemperature)	Set the color temperature to a value between 153 and 500*/
var philips_actuator_info = {
    'set-bulb-on':{
        min:0,
        max:1,
        step:1
    },
    'set-bulb-sat':{
        min:0,
        max:255,
        step:1
    },
    'set-bulb-hue':{
        min:0,
        max:65535,
        step:100
    },
    'set-bulb-bri':{
        min:0,
        max:255,
        step:1
    },
    'set-bulb-ct':{
        min:153,
        max:500,
        step:1
    },
}

$( document ).ready(function() {
    
    var actuators = null;
    var vendor_id = null;
    var actuator_types = null
    $.ajax({
            url: "http://127.0.0.1:8080/databox-directory/api/actuator",
        })
        .then(( data ) => {
            actuators = data;
            return $.ajax({
                        url: "http://127.0.0.1:8080/databox-directory/api/vendor",
                    })
        })
        .then(( vendors ) => {
            vendor = vendors.filter((item)=>{return item.description == "Phillips" });
            vendor_id = vendor[0].id; 

            return $.ajax({
                        url: "http://127.0.0.1:8080/databox-directory/api/actuator_type",
                    })
        })
        .then((actuatorTypes) => {
            
            actuator_types = actuatorTypes;

            actuators = actuators.filter((item)=>{return item.vendor_id == vendor_id});
            actuators.sort((a,b)=>{return a.vendor_actuator_id - b.vendor_actuator_id});
            console.log(actuators);
            var id = 0;
            for(var ac of actuators) {
                id = id + 1;
                var acc_id = "acc" + id
                var acc_type = actuator_types.find((item)=>{return item.id == ac.actuator_type_id}); 
                var ac_limits = philips_actuator_info[acc_type.description];
                $('body').append(   '<div>' + ac.description + ' of bulb ' + ac.vendor_actuator_id + ': ' + 
                                    '<input onchange="updateLights(\''+acc_id+'\','+ac.id+',\''+acc_type.description+'\')" id="'+acc_id+'" type="range" min="'+ac_limits.min+'" max="'+ac_limits.max+'" step="'+ac_limits.step+'" />' + 
                                    '</div>'
                                );
            }
        }) 
        

});

var updateLights = function (acc_id,id,method) {
    var data = { actuator_id: id, method: method, data:$('#'+acc_id).val() };
    console.log(data);
    
    $.post( "http://127.0.0.1:8080/databox-driver-phillipshue/api/actuate", data)
    .then((data)=>{
        console.log(data);
    });
};
