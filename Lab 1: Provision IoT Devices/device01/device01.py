import boto3
import os
import requests
import random
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

def lambda_handler(event, context):
	
	stackname = os.environ['CFNstackname']
	iot = boto3.client('iot')
	secretmanager = boto3.client('secretsmanager')

	endpoint = iot.describe_endpoint(endpointType='iot:Data-ATS')
	endpointaddress = endpoint['endpointAddress']

	if os.path.isfile('/tmp/cert.pem'):
		print('/tmp/cert.pem is available')
	else:

		certpem = secretmanager.get_secret_value(SecretId='CertPem'+stackname)
		print(certpem)
		newcert = open('/tmp/cert.pem', 'w+')
		newcert.write(certpem['SecretString'])
		newcert.close()

	if os.path.isfile('/tmp/private.key'):
		print('/tmp/private.key is available')
	else:
		privatekey = secretmanager.get_secret_value(SecretId='PrivateKey'+stackname)
		print(privatekey)
		newprivatekey = open('/tmp/private.key', 'w+')
		newprivatekey.write(privatekey['SecretString'])
		newprivatekey.close()

	if os.path.isfile('/tmp/rootca.pem'):
		print('/tmp/rootca.pem is available')
	else:
		url = 'https://www.amazontrust.com/repository/AmazonRootCA1.pem'
		newrootcapem = requests.get(url)
		open('/tmp/rootca.pem', 'wb').write(newrootcapem.content)

	myMQTTClient = AWSIoTMQTTClient("SensorDevice01")
	myMQTTClient.configureEndpoint(endpointaddress, 8883)
	myMQTTClient.configureCredentials("/tmp/rootca.pem", "/tmp/private.key", "/tmp/cert.pem")
	# AWSIoTMQTTClient connection configuration
	myMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
	myMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
	myMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
	myMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
	myMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

	#generate random temperature
	deviceTemperature = round(random.uniform(15.1,29.9),2)

	# Connect to AWS IoT
	myMQTTClient.connect()
	myMQTTClient.publish('temperaturedevice', deviceTemperature, 0)
	myMQTTClient.disconnect()