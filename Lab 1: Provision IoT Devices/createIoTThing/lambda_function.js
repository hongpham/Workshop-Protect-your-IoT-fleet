console.log('Loading function');
var AWS = require('aws-sdk');
var iot = new AWS.Iot();
var secretsmanager = new AWS.SecretsManager();


exports.handler = function(event, context) {
//TODO: parameter device name and thing name

	console.log('Received event:', JSON.stringify(event, null, 2));

//Declare All params

	var paramsThingType = {
		thingTypeName: 'EC2-Things', /* required */
  		tags: [
    	{
      	Key: 'Purpose',
      	Value: 'Demo'
    	},
  		]
  	};

  var paramsThingGroup = {
  	  thingGroupName: 'TemparatureSensors', /* required */
  	  thingGroupProperties: {
  	    attributePayload: {
  	      attributes: {
  	        'Core': 'EC2',
		},
  	    },
  	  }
  	};

  var paramsThing = {
	  thingName: 'IoT-Temparature-Device', /* required */
	  attributePayload: {
	    attributes: {
	      /* '<AttributeName>': ... */
	    },
	  },
	  thingTypeName: 'EC2-Things'
	};

	var paramsAddThing = {
	  thingGroupName: 'TemparatureSensors',
	  thingName: 'IoT-Temparature-Device'
	};

		//retrieve ATS endpoint
	var paramsGetEndPoint = {
	  endpointType: 'iot:Data-ATS'
	};

	var paramsCert = {
  		setAsActive: true
	};
//*******

// Create IoT resources	
  	iot.createThingGroup(paramsThingGroup, function(err, data) {

  	  if (err) console.log(err, err.stack); // an error occurred
  	  else     
  	  		//if success, create a Thing Type
  	  	  	iot.createThingType(paramsThingType, function(err, data) {
  	  	  		if (err) console.log(err, err.stack); // an error occurred
  	  	  		else     
  	  	  			//if success, create a Thing of this ThingType
  	  	  			iot.createThing(paramsThing, function(err, data) {
  	  	  			  if (err) console.log(err, err.stack); // an error occurred
  	  	  			  else     
  	  	  			  	// if success, attach Thing to Thing group
  	  	  			  	iot.addThingToThingGroup(paramsAddThing, function(err, data) {
  	  	  			  	  if (err) console.log(err, err.stack); // an error occurred
  	  	  			  	  else     console.log("Added thing to thinggroup");           // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html#addThingToThingGroup-property
  	  	  			  	});

  	  	  			  	//then create cert and attach to thing
  	  	  				iot.createKeysAndCertificate(paramsCert, function(err, data) {
  	  	  			 		if (err) console.log(err, err.stack); // an error occurred
  	  	  			  		else   
  	  	  			  		   	//attach principal-cert to thing
  	  	  			        	var paramsPrincipalAttachement = {
  	  	  			          		principal: data.certificateArn, /* required */
  	  	  			          		thingName: 'IoT-Temparature-Device' /* required */
  	  	  			        	};

  	  	  			        	iot.attachThingPrincipal(paramsPrincipalAttachement, function(err, data) {
  	  	  			         	if (err) console.log(err, err.stack); // an error occurred
  	  	  			          	else     
  	  	  			          		console.log("Successfully attach thing");           // successful response
  	  	  			        	});

   	  	  			  			var stringdata = JSON.stringify(data);

                        //put cert and keys in Secret manager

                        var paramsStoreCert = {
                          Name: 'Cert_and_Keys', /* required */
                          Description: 'Certificate and keys for IoT Device',
                          SecretString: stringdata
                        };

                        secretsmanager.createSecret(paramsStoreCert, function(err, data) {
                          if (err) console.log(err, err.stack); // an error occurred
                          else     console.log("Successfully store certs and keys in secretsmanager");           // successful response
                        });

  	  	  				});

  	  	  			});
  	  		});
  	});


	iot.describeEndpoint(paramsGetEndPoint, function(err, data) {
	  	if (err) console.log(err, err.stack); // an error occurred
	  	else
        
        var paramsStoreEndpoint = {
          Name: 'IoTEndPoint', /* required */
          Description: 'Endpoint of IoT Device',
          SecretString: data.endpointAddress,
          Tags: [
            {
              Key: 'Project',
              Value: 'IoT'
            },
            /* more items */
          ]
        };
        secretsmanager.createSecret(paramsStoreEndpoint, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log("Successfully store certs and keys in secretsmanager");           // successful response
        });
	});
//*********

}