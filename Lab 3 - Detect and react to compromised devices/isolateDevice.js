var AWS = require('aws-sdk');
var iot = new AWS.Iot();

exports.handler = function(event, context) {

	violateThing = event.thingName

	var params = {
	  thingGroupName: 'IsolatedDevices',
	  thingName: violateThing
	};
	iot.addThingToThingGroup(params, function(err, data) {
	  if (err) console.log(err, err.stack); 
	  else     console.log(data);           
	});

}