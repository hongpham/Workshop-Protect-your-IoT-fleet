import boto3
import json

iot = boto3.client('iot')

def lambda_handler(event, context):

	message = json.loads(event['Records'][0]['Sns']['Object']) 
	print("JSON: " + json.dumps(message)) 

	thing = message['thingName']

	addThing = iot.add_thing_to_thing_group(
    	thingGroupName='IsolatedDevices',
	    thingName=thing,
	)