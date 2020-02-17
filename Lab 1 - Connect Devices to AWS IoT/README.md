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

In this workshop, we will use 2 Lambda functions acting as 2 seperate IoT Devices: Device01 and Device02, respectively. Each device will send temperature telemetry to AWS IoT every 10 seconds. You can look at the code of Lambda function by going to Lambda management console, and click on function Device01 or Device02:

