'''
This file contains the AWS Lambda function that is invoked when a IoT Device Defender violation is triggered.
'''
import json
import os
import boto3
import requests
from base64 import b64decode

def get_message(event):
  '''
  This function retrieves the message that will be sent to the Amazon Chime webhook. If the Lambda
  function is triggered manually, it will return some static text. However, if the Lambda function
  is invoked by SNS from CloudWatch Alarms, it will emit the Alarm's subject line.
  '''
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
