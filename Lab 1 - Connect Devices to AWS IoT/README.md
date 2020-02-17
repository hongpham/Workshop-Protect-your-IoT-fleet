# Lab 1 - Provision Infrastructure

## What will be provided:
In this lab, AWS resources are already created for you in advance:

- 2 IoT Devices registered with AWS IoT
- 1 X.509 Certificate and it's private key
- 1 Audit scheduled daily

## Architecture Diagram:

<img src="../images/IoTSecurityWorkshopInfra.jpg" width="350" height="431"/>

## AWS resources walk-through

### 1. IoT devices

In this workshop, we will use 2 Lambda functions acting as 2 seperate IoT Devices: Device01 and Device02, respectively. Each device will send temperature telemetry to AWS IoT every 10 seconds. Let's look at the code of Lambda functions (writen in Python) by going to Lambda management console, and click on function Device01 or Device02:


<img src="../images/Lambdadevice.png"/>


First, the function will retrieve AWS IoT Endpoint so that it know which endpoint to send telemetry data to. To connect with AWS IoT Endpoint, IoT device needs to have  device certificate, private key, and root CA certificate installed. The next step is to have Lambda function checks if these files are already available in /tmp. If not, it will retrieve these files from AWS Secrets Manager. Finally, it generates random temperature telemetry data and sends it to AWS IoT Endpoint



