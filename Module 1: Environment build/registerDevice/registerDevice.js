var AWS = require('aws-sdk');
var iot = new AWS.Iot();
var secretsmanager = new AWS.SecretsManager();


exports.handler = function(event, context) {

	console.log('REQUEST RECEIVED:', JSON.stringify(event));

  //retrieve CFN stackname
  var stackname = process.env.CFNstackname;

  //setting up cfn-response 
  // For Delete requests, immediately send a SUCCESS response and delete custom resource

  if (event.RequestType == "Delete") {

    sendResponse(event, context, "SUCCESS");
    return;
  }

  var responseStatus = "FAILED";
  var responseData = {};
  
  //create new IoT certificate
	var paramsCert = { setAsActive: true };

  iot.createKeysAndCertificate(paramsCert, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      //prepare responsedata
      responseStatus = "SUCCESS";
      responseData["certARN"] = data.certificateArn
      console.log(responseData);
      //store certs and private key in Secret manager
      var paramsCertArn = {
        Name: 'CertArn' + stackname,
        Description: 'Arn of Certificate attached to IoT Device',
        SecretString: data.certificateArn
      };
    
      secretsmanager.createSecret(paramsCertArn, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log("Successfully store Cert Arn in secretsmanager"); 
      });

      var paramsCertPem = {
        Name: 'CertPem' + stackname,
        Description: 'Certificate Pem attached to IoT Device',
        SecretString: data.certificatePem
      };
    
      secretsmanager.createSecret(paramsCertPem, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log("Successfully store Cert Pem in secretsmanager"); 
      });

      var paramsPrivateKey = {
        Name: 'PrivateKey' + stackname,
        Description: 'PrivateKey attached to IoT Device',
        SecretString: data.keyPair.PrivateKey
      };
    
      secretsmanager.createSecret(paramsPrivateKey, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log("Successfully store PrivateKey in secretsmanager"); 
      });     

    }
    console.log('*****print env var****');
    console.log(responseStatus);
    console.log(responseData);
    sendResponse(event, context, responseStatus, responseData);
  });
}

// Send response to the pre-signed S3 URL 
function sendResponse(event, context, responseStatus, responseData) {
 
    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });
 
    console.log("RESPONSE BODY:\n", responseBody);
 
    var https = require("https");
    var url = require("url");
 
    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };
 
    console.log("SENDING RESPONSE...\n");
 
    var request = https.request(options, function(response) {
        console.log("STATUS: " + response.statusCode);
        console.log("HEADERS: " + JSON.stringify(response.headers));
        // Tell AWS Lambda that the function execution is done  
        context.done();
    });
 
    request.on("error", function(error) {
        console.log("sendResponse Error:" + error);
        // Tell AWS Lambda that the function execution is done  
        context.done();
    });
  
    // write data to request body
    request.write(responseBody);
    request.end();
}
