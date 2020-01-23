console.log('Loading function');
var AWS = require('aws-sdk');
var ec2 = new AWS.EC2();
var s3 = new AWS.S3();

exports.handler = function(event, context) {
	console.log('Start function');

	var bucketName = process.env.BUCKETNAME; //need to get output from s3 name
	var keyname = process.env.KEYNAME
	//create keypair
	var paramsKey = {
	  KeyName: keyname,
	 };

	 ec2.createKeyPair(paramsKey, function(err, data) {
	   	if (err) console.log(err, err.stack); // an error occurred
	   	else     
		  	var paramsUploadKey = {Bucket: bucketName, Key: data.KeyName, Body: data.KeyMaterial};

		  	s3.putObject(paramsUploadKey, function (err, data){
	  			if (err)
	  				console.log(err)
	  			else
	  				console.log("Successfully saved KeyPair to bucket " + bucketName);

				});
	 });



}