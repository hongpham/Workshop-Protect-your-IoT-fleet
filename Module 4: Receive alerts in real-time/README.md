# Module 4: Receive alerts in real-time

For many Security Engineers, receiving alerts in real time is critical. They need to act quickly to reduce impact of security issues. Using SMS message, or collaboration tools such as Slack or Chime, are common solutions to notify engineers when thing goes wrong.

In this extra-credit module, we will show you how to configure SNS to send Device Defender alerts to your phone, or to Amazon Chime chatroom. If you are interested in using Slack with SNS, then take a look at [this Lambda blueprints](https://aws.amazon.com/about-aws/whats-new/2015/12/aws-lambda-launches-slack-integration-blueprints/)

1. [Send SMS message to your phone](#1-send-sms-message-to-your-phone-only-available-in-region-that-supports-sms-messaging)
2. [Receive alerts on Chime chatroom](#2-receive-alerts-on-chime-chatroom)

## 1. Send SMS message to your phone (only available in [region that supports SMS messaging](https://docs.aws.amazon.com/sns/latest/dg/sns-supported-regions-countries.html)):

You can subcribe your phone number to SNS topic receive alerts from IoT Device Defender. When a new alert occur, SNS will send you a SMS message (please note that SMS cost may be applied to your phone number)

1. Sign in to your AWS account. From AWS console home, click **SNS**

2. On the left hand side, click on menu bar to show the list of SNS features. Click **Subscriptions**

3. Choose SNS topic that you use to receive alerts from IoT Device Defender. Choose **SMS** as protocal. Type in your phone number in **EndPoint**. Click **Create subscription**

<img src="../images/snssub.png"/>

You will need to confirm your subscription in order to start receiving SMS message.

## 2. Receive alerts on Chime chatroom

Amazon Chime is a collaboration tools. Chime provide a feature call Incoming Webhook to allow applications post message to Chime chatroom. You can configure SNS to send a message to your Chime chatroom when Device Defender generates an alert.

### 1. Configure Chime Webhook

If you don't have a chat room, you can create a new one. From Chime App, click **Rooms, Create a chat room, Done**
Click on the gear icon top right of the chat room. Then click **Manage webhooks and bots**. 

Click **Add webhook** and give it a name. Your webhook will have a unique URL. You need to protect this URL just as you protect any secret materials (API keys, username-password,..) because anyone has this URL can post a message to your chat room. Copy this URL and save it in a touchpad for later use

### 2. Configure Lambda function

Since SNS doesn't intergrate with Chime directly, we will use a Lambda function to post the SNS message to the Chime chatroom. From Lambda management console, create a new Lambda function. Give this new function a name and choose Python3.* as runtime with default permissions. 

Now we already write the code for this lambda function for you and install all dependencies in this [IoTWebhookFunction.zip](/Module%204:%20Receive%20alerts%20in%20real-time/lambdafunction/IoTWebhookFunction.zip). Let's upload this Python zip code to your new Lambda function. Under **Function code**, click the drop down **Code entry type**, and choose **Upload a .zip file**. Here is the code snippet of this Lambda function

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
Basically, this function parse the SNS message to retrieve Thing name, Security Profile, and Behavior name, then it use *requests* method to post these information to the webhook URL. In this lab, we have stored the webhook URL as an environment variable **CHIME_WEBHOOK**. In production use cases, we would recommend to store it securely using AWS Secrets Manager or any existing tools/vault that your team is using.

When you have succcesfully created this Lambda function, let's add SNS as a trigger. Under **Designer**, click **Add trigger** and select **SNS**. Choose the SNS topic that you configured to receive IoT Device Defender alerts in. Remember to check box **Enable trigger**. Then click **Add*

### 2. Test

To test if this configuration works, you can publish this test SNS message below using SNS console and see if it will send a message to your Chime chat room

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
