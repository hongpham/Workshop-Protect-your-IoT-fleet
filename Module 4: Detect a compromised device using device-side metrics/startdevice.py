#!/usr/bin/python

import boto3
import os
import requests
import random
import string
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from time import sleep
import sys
import getopt
import json

def startdevice(topicname, devicename):

    topicname = topicname
    devicename = devicename

    #retrieve region from metadata
    metadata_request = requests.get('http://169.254.169.254/latest/dynamic/instance-identity/document')
    json_metadata = json.loads(metadata_request.text)
    region = json_metadata['region']

    #retrieve CloudFormation Stackname from Tags
    ec2 = boto3.client('ec2', region_name=region)
    retrievetag = ec2.describe_tags(
            Filters=[
                {
                    'Name': 'key',
                    'Values': [
                        'aws:cloudformation:stack-name',
                    ],
                },
                {
                    'Name': 'resource-type',
                    'Values': [
                        'vpc',
                    ],
                }
            ],
        )

    stackname = retrievetag['Tags'][0]['Value']

    #retrieve IoT endpoint pull certificate from Secrets Manager
    iot = boto3.client('iot', region_name=region)
    secretmanager = boto3.client('secretsmanager', region_name=region)

    endpoint = iot.describe_endpoint(endpointType='iot:Data-ATS')
    endpointaddress = endpoint['endpointAddress']
    endpoint = open('/tmp/endpoint', 'w+')
    endpoint.write(endpointaddress)
    endpoint.close()

    if os.path.isfile('/tmp/cert.pem'):
        print('/tmp/cert.pem is available')
    else:

        certpem = secretmanager.get_secret_value(SecretId='CertPem'+stackname)
        newcert = open('/tmp/cert.pem', 'w+')
        newcert.write(certpem['SecretString'])
        newcert.close()

    if os.path.isfile('/tmp/private.key'):
        print('/tmp/private.key is available')
    else:
        privatekey = secretmanager.get_secret_value(SecretId='PrivateKey'+stackname)
        newprivatekey = open('/tmp/private.key', 'w+')
        newprivatekey.write(privatekey['SecretString'])
        newprivatekey.close()

    if os.path.isfile('/tmp/rootca.pem'):
        print('/tmp/rootca.pem is available')
    else:
        url = 'https://www.amazontrust.com/repository/AmazonRootCA1.pem'
        newrootcapem = requests.get(url)
        open('/tmp/rootca.pem', 'wb').write(newrootcapem.content)

    myMQTTClient = AWSIoTMQTTClient(devicename)
    myMQTTClient.configureEndpoint(endpointaddress, 8883)
    myMQTTClient.configureCredentials("/tmp/rootca.pem", "/tmp/private.key", "/tmp/cert.pem")
    
    # AWSIoTMQTTClient connection configuration
    myMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
    myMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
    myMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
    myMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
    myMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

    # Send data to AWS IoT every 10 second
    print("Sending telemetry data to AWS IoT topic " + topicname)
    x = 0
    while True:

        myMQTTClient.connect()

        #generate random temperature (comment out the line of code in Lab 4)
        telemetrydata = round(random.uniform(15.1,29.9),2)

        #uncomment the line of code below to generate random String in Lab 4
        #telemetrydata = ''.join(random.choices(string.ascii_uppercase + string.digits, k = 3000)) 

        myMQTTClient.publish(topicname, telemetrydata, 0)
        x += 10
        myMQTTClient.disconnect()

        sleep(float(10))


def main(argv):

    topicname = ''
    devicename = ''

    try:
        opts, args = getopt.getopt(argv,"ht:d:",["topicname=","devicename="])
    except getopt.GetoptError:
        print('startdevice.py -t <topicname> -d <devicename>')
        sys.exit(2)

    for opt, arg in opts:
        if opt == '-h':
            print('startdevice.py -t <topicname> -d <devicename>')
            sys.exit()
        elif opt in ("-t", "--topicname"):
            topicname = arg
        elif opt in ("-d", "--devicename"):
            devicename = arg

    startdevice(topicname, devicename)

if __name__ == "__main__":
   main(sys.argv[1:])
