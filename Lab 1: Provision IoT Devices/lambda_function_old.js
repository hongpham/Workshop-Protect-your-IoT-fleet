console.log('Loading function');
var fs = require('fs');
var AWS = require('aws-sdk');
var iot = new AWS.Iot();
var s3 = new AWS.S3();

exports.handler = function(event, context) {
	console.log('Received event:', JSON.stringify(event, null, 2));

	var bucketName = 'billing-phamh'; //need to get output from s3 name

	//create Thing Type
	var paramsThingType = {
		thingTypeName: 'EC2-Things', /* required */
  		tags: [
    	{
      	Key: 'Purpose',
      	Value: 'Demo'
    	},
  		]
  	}

  	iot.createThingType(paramsThingType, function(err, data) {
  		if (err) 
  			console.log(err, err.stack); // an error occurred
  		else     
  		console.log(data);           // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html#createThingType-property
	});
	
	//create policy 
	var policy = {
 	 "Version": "2012-10-17",
	  "Statement": [
	    {
 	     "Effect": "Allow",
	      "Action": "iot:*",
	      "Resource": "*"
	    }
	  ]
	};

	var policyjson = JSON.stringify(policy);
	console.log(policyjson);

	fs.writeFile('/tmp/policy.json', policyjson, (err) => { 
	      
	    if (err) throw err; 
	});

	var paramsPolicy = {
	  policyDocument: 'file://tmp/policy.josn', /* required */
	  policyName: 'TemperatureSensorPolicy' /* required */
	};

	iot.createPolicy(paramsPolicy, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     
	  	
	  	console.log(data);           // successful response
	});

  	//create Thing Group
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

  	var getPolicyName = '';
  	iot.createThingGroup(paramsThingGroup, function(err, data) {
  	  if (err) console.log(err, err.stack); // an error occurred
  	  else     

  	  	var paramsgetPolicy = {
 			 policyName: 'TemperatureSensorPolicy' /* required */
		};

  	  	iot.getPolicy(paramsgetPolicy, function(err, data){
  	  		if (err) console.log(err, err.stack); // an error occurred
  			else 
  				getPolicyName = data.policyName;
  	  	})

  	  	//attach policy 
  	  	var paramsAttachPolicy = {
  	  	  policyName: getPolicyName, /* required */
  	  	  target: data.thingGroupArn /* required */
  	  	};
  	  	iot.attachPolicy(paramsAttachPolicy, function(err, data) {
  	  	  if (err) console.log(err, err.stack); // an error occurred
  	  	  else     console.log(data);           // successful response
  	  	});


  	  	console.log(data);           // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html#createThingGroup-property
  	});

	//create Thing then add to Group

	var paramsThing = {
	  thingName: 'IoT-Device', /* required */
	  attributePayload: {
	    attributes: {
	      /* '<AttributeName>': ... */
	    },
	  },
	  thingTypeName: 'EC2-Things'
	};



	iot.createThing(paramsThing, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log(data);           // successful response
	});

	var params = {
	  thingGroupName: 'TemparatureSensors',
	  thingName: 'IoT-Device'
	};

	iot.addThingToThingGroup(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log(data);           // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html#addThingToThingGroup-property
	});

	//retrieve ATS endpoint
	var paramsGetEndPoint = {
	  endpointType: 'iot:Data-ATS'
	};

	iot.describeEndpoint(paramsGetEndPoint, function(err, data) {
	  if (err) 
	  	console.log(err, err.stack); // an error occurred
	  else
	  	var paramsEndpoint = {Bucket: bucketName, Key: 'Endpoint', Body: data.endpointAddress};

	  	s3.putObject(paramsEndpoint, function (err, data){
  			if (err)
  				console.log(err)
  			else
  				console.log("Successfully saved Endpoint to bucket " + bucketName);

			});
		console.log(data);           // successful response
	});


	// create Cert
	var paramsCert = {
  		setAsActive: true
	};

	iot.createKeysAndCertificate(paramsCert, function(err, data) {
 		if (err) 
 			console.log(err, err.stack); // an error occurred
  		else   
  			//prepare params for S3 put
  			var paramsCertARN = {Bucket: bucketName, Key: 'CertificateArn',Body: data.certificateArn};
  			var paramsCertID = {Bucket: bucketName, Key: 'CertificateID',Body: data.certificateId};
  			var paramsCertPem = {Bucket: bucketName, Key: 'CertificatePem',Body: data.CertificatePem};
  			var paramsPublicKey = {Bucket: bucketName, Key: 'PublicKey',Body: data.keyPair.PublicKey};
  			var paramsPrivateKey = {Bucket: bucketName, Key: 'PrivateKey',Body: data.keyPair.PrivateKey};

  			//put cert and keys to S3 
  			s3.putObject(paramsCertARN, function (err, data){
  				if (err)
  					console.log(err)
  				else
  					console.log("Successfully saved Cert ARN to bucket " + bucketName);

  				});

  			s3.putObject(paramsCertID, function (err, data){
  				if (err)
  					console.log(err)
  				else
  					console.log("Successfully saved Cert ID to bucket " + bucketName);

  			});

  			s3.putObject(paramsCertPem, function (err, data){
  				if (err)
  					console.log(err)
  				else
  					console.log("Successfully saved Cert Pem to bucket " + bucketName);

  			});

  			s3.putObject(paramsPublicKey, function (err, data){
  				if (err)
  					console.log(err)
  				else
  					console.log("Successfully saved Public Key to bucket " + bucketName);

  			});

  			s3.putObject(paramsPrivateKey, function (err, data){
  				if (err)
  					console.log(err)
  				else
  					console.log("Successfully saved Private Key to bucket " + bucketName);

  			});


  			//attach principal-cert to thing
  			var paramsPrincipalAttachement = {
  			  principal: data.CertificateArn, /* required */
  			  thingName: 'IoT-Device' /* required */
  			};

  			iot.attachThingPrincipal(paramsPrincipalAttachement, function(err, data) {
  			  if (err) console.log(err, err.stack); // an error occurred
  			  else     console.log(data);           // successful response
  			});

  			console.log(data);           // successful response
});


}