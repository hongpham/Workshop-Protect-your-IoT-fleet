console.log('Loading function');
var fs = require('fs');
var AWS = require('aws-sdk');
var iot = new AWS.Iot();
var s3 = new AWS.S3();

exports.handler = function(event, context) {

	console.log('Received event:', JSON.stringify(event, null, 2));

	var bucketName = 'billing-phamh'; //need to get output from s3 name

  	function sleep(milliseconds) {
    	var start = new Date().getTime();
    	for (var i = 0; i < 1e7; i++) {
      		if ((new Date().getTime() - start) > milliseconds){
        		break;
      		}
    	}
  	};

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
  	  	  			  	  else     console.log(data);           // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html#addThingToThingGroup-property
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
  	  	  			        	console.log(data.CertificateArn);

  	  	  			        	iot.attachThingPrincipal(paramsPrincipalAttachement, function(err, data) {
  	  	  			         	if (err) console.log(err, err.stack); // an error occurred
  	  	  			          	else     
  	  	  			          		console.log(data);           // successful response
  	  	  			        	});

  	  	  			  			//put cert and keys to S3 
  	  	  			  			var stringdata = JSON.stringify(data);
  	  	  			 			var paramsUploadS3 = {Bucket: bucketName, Key: 'KeyAndCerts',Body: stringdata};
  	  	  			 			
  	  	  			  			s3.putObject(paramsUploadS3, function (err, data){
  	  	  			  				if (err) console.log(err)
  	  	  			  				else console.log("Successfully saved key and certs to bucket " + bucketName);

  	  	  			  				});
  	  	  			  			
  	  	  			  			console.log(data);           // successful response
  	  	  				});

  	  	  			  	console.log(data);           // successful response
  	  	  			});
  	  	  			console.log(data);           // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html#createThingType-property
  	  		});
  	  	console.log(data);           // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html#createThingGroup-property
  	});


	iot.describeEndpoint(paramsGetEndPoint, function(err, data) {
	  	if (err) console.log(err, err.stack); // an error occurred
	  	else
	  		var paramsEndpoint = {Bucket: bucketName, Key: 'Endpoint', Body: data.endpointAddress};

	  		s3.putObject(paramsEndpoint, function (err, data){
  				if (err) console.log(err)
  				else console.log("Successfully saved Endpoint to bucket " + bucketName);

			});
		console.log(data);           // successful response
	});

//*********

}