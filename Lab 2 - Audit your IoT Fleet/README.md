# Audit your IoT Fleet

Before deploying IoT Devices into Production, you need to make sure approriate device-related settings and policies are applied correctly. You also need to have on-going checks to detect any drifts from security best practices after your IoT Devices are deployed into Production. 

You have identify multiple bad device configurations. You would like to Audit device configurations for security vulnerabilities and get notified if any of the devices don't pass all the checks. In this Lab, we will walk through steps to identify device's bad configuration, as well as to create mitigation actions using AWS IoT Device Defender

In this Lab, your task is to set up Audit using AWS IoT Device Defender to identify 3 checks
TODO: need to write a use case here
- need to detect if devices sharing cert --> authentication + authorization
- need to give appropriate permission following least priviledge model
- need to know if IoT logging is disable (AWS IoT logs in CloudWatch provide visibility into behaviors in AWS IoT, including authentication failures and unexpected connects and disconnects that might indicate that a device has been compromised. )

## 1. Enable Audit

To get start, you need to identify what type of check you would like to run against your devices. Conveniently, AWS IoT Device Defender has built in audit checks that you can quickly enable. Let's create an audit with these checks.

From the IoT management console, click on **Defend**, **Audit**, **Schedules**. You will then see the current list of scheduled Audits. Click **Create** button on the top right to create a new Audit.

<img src="../images/Auditlist.png" width="600" height="557"/>


## 2. Take actions to mitigate issues found during Audit 
