For many Security Engineers, receiving alerts in real time is critical for them to act quickly to mitigate security issue as soon as possible. Your team may collaborates by using one of multiple communication services (Slack, Amazon Chime,...). In this lab, we will show you how to configure SNS to send a message to Amazon Chime chatroom. If you are interested in using Slack with SNS, then take a look at [this Lambda blueprints](https://aws.amazon.com/about-aws/whats-new/2015/12/aws-lambda-launches-slack-integration-blueprints/)

## 1. Configure Chime Webhook

Chime provide a feature call Webhook that you can create for any chatroom. If you don't have a chat room, you can create a new one. From Chime App, click **Rooms, Create a chat room, Done**

Click on the gear icon top right of the chat room. Then click **Manage webhooks and bots**. 

Click **Add webhook** and give it a name. Your webhook will have a unique URL. You need to protect this URL just as you protect any secret materials (API keys, username-password,..) because anyone has this URL can post a message to your chat room. Copy this URL and save it in a touchpad for later use

## 2. Configure Lambda function

Since SNS doesn't intergrate with Chime directly, we will use a Lambda function to post the SNS message to the Chime chatroom. From Lambda management console, create a new Lambda function. Give this new function a name and choose Python3.* as runtime with default permissions. 

Now we already write the code for this lambda function for you and install all dependencies in this IoTWebhookFunction.zip. Let's upload this Python zip code to your new Lambda function. Under **Function code**, click the drop down **Code entry type**, and choose **Upload a .zip file**. Here is the code snippet of this Lambda function

```python
import json
import os
import boto3
import requests
from base64 import b64decode

def get_message(event):
  try:
    message = json.loads(event['Records'][0]['Sns']['Message']) 
    thing = 'Thing name: ' + message['thingName']
    securityprofile = 'Security profile: ' + message['securityProfileName']
    behaviorname = 'Behavior name: ' + message['behavior']['name']
    return " | ".join([thing,securityprofile,behaviorname])
  except KeyError:
    return 'test message'

def handler(event, context):
  print('Getting ready to send message to Amazon Chime room')
  content = 'IoT Device Defender alert! {0}'.format(get_message(event))
  webhook_uri = os.environ['CHIME_WEBHOOK']
  requests.post(url=webhook_uri, json={ 'Content': content })
  print('Finished sending notification to Amazon Chime room')

```
Basically this function parse the SNS message to retrieve Thing name, Security Profile, and Behavior name, then it use *requests* method to post these information to the webhook URL. In this lab, we have stored the webhook URL as an environment variable **CHIME_WEBHOOK**. In production use cases, we would recommend to store it securely using AWS Secrets Manager or any existing tools/vault that your team is using.

When you have succcesfully created this Lambda function, let's add SNS as a trigger. Under **Designer**, click **Add trigger** and select **SNS**. Choose the SNS topic that you configured to receive IoT Device Defender alerts in [Lab 3](https://github.com/hongpham/IoT-Security-Workshop/tree/master/Lab%203%20-%20Detect%20and%20react%20to%20compromised%20devices#0-create-sns-topic-for-notification). Remember to check box **Enable trigger**. Then click **Add*

If you want to test if this new configuration works, you can publish this test SNS message below and see if it will send a message to your Chime chat room

```json
{
  "violationEventTime": 1582745400000,
  "thingName": "myIoTDevice",
  "behavior": {
    "criteria": {
      "consecutiveDatapointsToClear": 1,
      "value": {
        "count": 5000
      },
      "consecutiveDatapointsToAlarm": 1,
      "comparisonOperator": "greater-than"
    },
    "name": "messageSize",
    "metric": "aws:message-byte-size"
  },
  "violationEventType": "in-alarm",
  "metricValue": {
    "count": 26
  },
  "violationId": "123456789",
  "securityProfileName": "LargeMessageSize"
}
```
