var AWS = require('aws-sdk');
var iot = new AWS.Iot();

exports.handler = function(event, context) {
  //setting up cfn-response 
  // For Delete requests, immediately send a SUCCESS response.TODO: delete resources

  if (event.RequestType == "Delete") {
    
    sendResponse(event, context, "SUCCESS");
    return;
  }

  var responseStatus = "FAILED";
  var responseData = {};
  
  //start an on demand Audit
  var params = {
    targetCheckNames: [
        'AUTHENTICATED_COGNITO_ROLE_OVERLY_PERMISSIVE_CHECK',
        'CA_CERTIFICATE_KEY_QUALITY_CHECK',
        'IOT_POLICY_OVERLY_PERMISSIVE_CHECK',
        'DEVICE_CERTIFICATE_KEY_QUALITY_CHECK',
        'CONFLICTING_CLIENT_IDS_CHECK',
        'IOT_ROLE_ALIAS_OVERLY_PERMISSIVE_CHECK',
        'IOT_ROLE_ALIAS_ALLOWS_ACCESS_TO_UNUSED_SERVICES_CHECK',
        'DEVICE_CERTIFICATE_SHARED_CHECK',
        'REVOKED_DEVICE_CERTIFICATE_STILL_ACTIVE_CHECK',
        'DEVICE_CERTIFICATE_EXPIRING_CHECK',
        'REVOKED_CA_CERTIFICATE_STILL_ACTIVE_CHECK',
        'LOGGING_DISABLED_CHECK',
        'UNAUTHENTICATED_COGNITO_ROLE_OVERLY_PERMISSIVE_CHECK',
        'CA_CERTIFICATE_EXPIRING_CHECK'
    ]
  };

  iot.startOnDemandAuditTask(params, function(err, data) {
    if (err) console.log(err, err.stack); 
    else {
        responseStatus = "SUCCESS";
        responseData["TaskID"] = data.taskId
        console.log('Audit started successfully with taskId: ', data.tastId)
        sendResponse(event, context, responseStatus, responseData);
    }          
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