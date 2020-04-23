# Module 4: Detect a compromised device using device-side metrics 

In previous module, you used cloud-side metrics capture by AWS IoT to monitor and detect if a device has an abnormal behavior. You also build a solution to automatically isolate the device for quarantine. Using the same solution, you will learn how monitor and stop suspicious device from any actions, by using metrics capture from the device itself. 

## 1. Configure SensorDevice03 to send telemetry data to AWS IoT

Device SensorDevice03 hasn't sent any temperature data to AWS IoT. In this step, you will need to start a bootstrap script on the device. This script will generate random temperature data and send it to AWS IoT endpoint.

1. Open your Cloud9 environment. From Cloud9 environment terminal, run these commands to download bootstrap script:
      
        cd /home/ec2-user/environment
        git clone https://github.com/hongpham/Workshop-Protect-your-IoT-fleet.git
        cd Workshop-Protect-your-IoT-fleet/
        cd 'Module 5: Send security alerts to your favourite messaging platform'
        
**Need to update git repo name after it's published. Also need to put a screen shot of these command.**

2. Retrieve nesseary parameters to run bootstrap script.

  a. Open your favourit text editor. Or create a new text file from Cloud9 environment by click on **File, New File**
  b. You need the stackname of CloudFormation stack that provision AWS resources for this workshop. To make sure X.509 certificate in this workshop is unique, we have append CloudFormation stackname to the name of this certificate. For this script to find the correct X.509 certifcate, you will need to provide CloudFormation stackname. Go to CloudFormation console, note the stackname, and save it in the text editor.
  c. You need IoT topic that this device **SensorDevice03** will send data to. To find the topic name of this device, go to the CloudFormation stack above, and click on **Parameters**. The topic name that you're looking for is the value of **IoTTopic03**. In this case, it is **temperature-device-03**. Note down this topic name in your text editor.
  d. Note down device name in your text editor. In this workshop, the device name is **SensorDevice03**
  
3. Now run this command to bootstrap this device to send data to AWS IoT (make sure you are at directory 'Module 5: Send security alerts to your favourite messaging platform'). See screenshot below for an example.

        ./bootstrap.sh -s [CloudFormation stackname] -t [topic name] -d [device name]
     
4. This bootstrap script will start a python program in the background to send data to AWS IoT topic **temperature-device-03**. To validate if this device is sendind telemetry data, you can check if the script is running by the command below.
        
         px aux |grep python   #this command search for the current running processes that has 'python' in it's name
         
 If you see a process **'python startdevice.py -s [CloudFormation stackname] -t [topic name] -d [device name]**, this device is sending telemetry data to AWS IoT.
 
<img src="../images/bootstrapscript.png"/>
  
## 2. Install AWS Device Defender Agent to collect metrics on the device

In this step, you will install [AWS Device Defender Agent (Python version)](https://github.com/aws-samples/aws-iot-device-defender-agent-sdk-python) on this device **SensorDevice03**

1. Run these commands to install Agent

         cd /home/ec2-user/environment/workshop
         sudo pip install -r requirements.txt 
         sudo pip install AWSIoTDeviceDefenderAgentSDK
         
2. Open a text editor, retrieve neccesary parameters below and save it in your text editor. You will need these parameters to start Device Defender Agent
    
    a. AWS IoT Endpoint: to find AWS IoT Endpoint, go to **AWS IoT Core console**. Make sure that you are in the correct region. Click **Manage** to view list of IoT things. Click on any thing, for example **Thing01**. Click **Interact**. Copy the Rest API endpoint under **HTTPS**
    
      <img src="../images/endpoint.png"/>
      
    b. Device name: in this workshop, we name this device **SensorDevice03**
    c. Thing name: in this workshop, thing name for device SensorDevice03 is **Thing03**

3. Start Device defender agent by running this command
        
        python agent.py --endpoint [your AWS IoT endpoint retrieved from step 2.a above]  \
        --rootCA /tmp/rootca.pem  --cert /tmp/cert.pem --key /tmp/private.key \
        --client_id [Device name] --thing_name [Thing name] --format json -i 300

<img src="../images/startagent.png"/>

* If you notice, you will see that X.509 certificate and it's private key is requried to start Device Defender Agent. These are credentials that Agent will use to send to AWS IoT. These credentials are already download for you under /tmp directory.
* The Agent will collect metrics and sends to AWS IoT as json format every 300 seconds (or 5 minutes - which is minimum reporting interval)
** Note: need to update connection timeout**
Let the Agent run for a few minutes. 

## 3. Define unusall behaviors

## 4. Respond to violations

## 5. Simulate a compromised device
