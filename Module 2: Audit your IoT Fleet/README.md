# Module 2: Audit your IoT Fleet

In Module 1, you validated environment setup for your IoT devices. Your next task is to regularly audit these devices to detect any drifts from security requiremetns for device configuraiton. As a busy Security Engineer, you looks for opportunity to automate audits and mitigations for thousands of IoT devices. This module will show you how to accomplish automation for audit and mitigation actions.

1. [Audit your IoT Fleet](#1-audit-your-iot-fleet)

    1.1 [Check Audit settings](#11-check-audit-settings)
    
    1.2 [Start an On-Demand Audit](#12-start-an-on-demand-audit)

2. [Take actions to mitigate audit findings](#2-take-actions-to-mitigate-audit-findings)

    2.1 [Define mitigation actions](#21-define-mitigation-actions)
    
    2.2 [Apply mitigation actions to audit findings](#22-apply-mitigation-actions-to-audit-findings)


## 1. Audit your IoT Fleet

AWS provides a service called AWS IoT Device Defender to help you looks at account- and device-related settings and policies to ensure security measures are in place. Device Defender provides a tool call Audit. An Audit can help you detect any drifts from security best practices or access policies.

Audit provides [14 type of checks](https://docs.aws.amazon.com/iot/latest/developerguide/device-defender-audit-checks.html). You can configure audit settings in your AWS account to choose which checks will be available when you set up audits. These Settings are effective at regional level. That means, settings in region A will not affect region B. 

An Audit Settings has 3 parts:

* Services permissions: you will need to allow Device Defender to run Audit against your IoT devices. You do so by using an IAM policies to manage permission.
* Enable Audits check: you select checks to make it available for audits. You can enable or disable anytime. Disable a check means that Device Defender will not include that type of check when it run an Audit.
* SNS alerts: This optional session let you choose a SNS topic to receive alerts from Device Defender. Alerts are always displayed in the AWS IoT console.

### 1.1 Check Audit Settings

In this module, you will run all of the checks for your IoT devices. You will need to validate if all checks are enabled in settings. Leave all the check enable. Depending on the scenerios below, expand one of the following dropdowns to start

<details><summary>Click here if you're at an AWS event where the Event Engine is being used or you run CloudFormation template in Module 1 on your AWS account</summary><br>
  
   1. If you are at an AWS Sponsored event, an on-demand Audit was created in advanced for you to make sure you can see how an Audit results look like if you can't create an Audit during the event. Thus Audit Settings is already created for you. You can follow steps below to validate Settings
   
   2. Sign in to AWS Account. From the AWS console home, click **IoT Device Defender** to go to IoT console. (You can search this service in the search box if you don't see it)
   
   3. On the left side, click **Defend, Settings** to view current settings 
   
   4. Under **Service permissions**, you will see an IAM role in a format [CloudFormation-stack-name]-IoTAuditRole-[random-value] that gives permission to Device Defender to run audits. This role was create in advance for you using CloudFormation. This IAM role has 1 AWS managed policy **AWSIoTDeviceDefenderAudit** attached to it. Here is how this role looks like in IAM console
   
   <img src="../images/auditrole.png"/>

   5. Under **Enable Audit checks**, you will see the list of enabled checks, severity of each checks, and what resources this checks will audit against. Click on the question mark next to the check name to learn more what it does. 
   
   6. To disable any checks, click on the box next to it and click **Disable**. For example, this is how it looks like when you disable 'Logging disabled' and 'CA certificate expiring' check. 
   
   <img src="../images/disablecheck.png"/>

   7. Disabled checks will be listed under **Disabled Audit checks session**. To enable the checks again, check the box next to check name and click **Enable**
   
   7. The final session of Settings is **SNS alerts**. You need to enable SNS alerts to receive audit related alerts from Device Defender. Click on **Edit, Enabled**
   
   8. Under **Topic**, select SNS topic **BadDevices** create previously in [Module 1](/Module%201:%20Environment%20build#available-resources). 
   
   9. Under **Role**, select IAM role with this naming convention [CloudFormation-stack-name]-SNSTopicRole-[random-value]. This role is create by CloudFormation. It has one AWS managed policy **AWSIoTDeviceDefenderPublishFindingsToSNSMitigationAction** 
  
   10. When you're ready, click **Update** to enable SNS alerts. 
   
   <img src="../images/snsrole.png"/>
   

You have completed checking setting for Device Defender Audit. Go to next session **1.2 Start an On-Demand Audit** to create and start an Audit.
   
</details>

<details><summary>Click here if you manually configure Audit Settings very first time</summary><br>

If you finished Module 1 before working on this module, an on-demand Device Defender Audit was created in advance. This option will not be suitable for you.

Device Defender will prompt you to configure Audit Settings if this is the first time you [run an Audit](https://docs.aws.amazon.com/iot/latest/developerguide/device-defender-HowToProceed.html). To use AWS IoT console to start an Audit, follow these steps:

1. Sign in to AWS Account. From AWS console home, click on IoT Device Defender to go to IoT console

2. On the left side of IoT console, click **Defend, Audit, Get started with an audit**

3. You will go through 3 steps to configure settings for Device Defender Audit. Click **Next** to start first steps **Review permissions**

   <img src="../images/firstaudit1.png"/>

4. In this step, you need to grant Device Defender Audits permisison to run audit against your IoT resources and policies by using IAM Role. This IAM role needs to have AWS managed policy **AWSIoTDeviceDefenderAudit**. You can create this IAM role in advance or click **Create Role** so that Device Defender can create the role for you. Click **Next** to go to **Select checks**

5. Select the checks you want to enable, and click **Next** to go to the next step, **Configure SNS**

6. This optional step let you choose which SNS topic will receive alerts from Device Defender. If you choose **Enabled**, you need to provide SNS topic name and IAM role that allow Device Defender to send alerts to that SNS topic. This IAM role needs to have AWS managed policy **AWSIoTDeviceDefenderPublishFindingsToSNSMitigationAction**.

7. Click **Enable Audit** to start your very first Audit. Note that this first Audit is a daily audit - meaning it will run every day at specific time decided by Device Defender. To create different type of Audit (on-demand, monthly,...), click **Defend, Audit, Schedules, Create**

</details>

### 1.2 Start an On-Demand Audit

When you create a new Audit, you can choose how often Audit should run:

* On-Demand: Audit starts immediately with no repeats. This option is helpful for ad-hoc audit.
* Daily: scheduled audit runs every day. The actual start time of each audit is determined by the system.
* Weekly: scheduled audit runs every week on the day of your choice. The actual start time of each audit is determined by the system.
* Bi-Weekly: scheduled audit runs every two week on the day of your choice. The actual start time of each audit is determined by the system.
* Monthly: scheduled audit runs every month on the day of your choice. The actual start time of each audit is determined by the system.

To start an Audit immediately, you create an On-Demand Audit by following these steps:

1. Sign in to AWS Account. From AWS console home, search for **IoT Device Defender** and click on it to go to IoT console

2. From the IoT console, click **Defend**, **Audit**, **Schedules**. Click **Create** button on the top right to create a new Audit. 

3. You will see the list of eligible checks can be included in this Audit. If you disable any checks in Audit Settings, you will not see that checks in this list. In this workshop, you select all of the checks (should be 14 checks in total)

<img src="../images/Auditlist.png" width="600" height="557"/>

4. Click the drop down list under **Set schedule**. Choose **Run audit now(once)**. Then click **Create** to start the Audit immediately. Note that there is no option to name an On-Demand Audit. 

<img src="../images/Auditschedule.png"/>

5. To view Audit's status, go to **Defend**, **Audit**, **Results**. All On-Demand Audit will have the name On-demand.

6. To view Audit's results, click on the name of the Audit **On-demand**

<img src="../images/checkresult.png"/>

7. Under **Non-compliant checks**, you should see 3 noncompliant findings under **Check name**:

- [Device certificate shared](https://docs.aws.amazon.com/iot/latest/developerguide/audit-chk-device-cert-shared.html): indicates multiple, concurrent connections use the same X.509 certificate to authenticate with AWS IoT. Each device should have a unique certificate to authenticate with AWS IoT. When multiple devices use the same certificate, this might indicate that a device has been compromised. Its identity might have been cloned to further compromise the system.

- [IoT policies overly permissive](https://docs.aws.amazon.com/iot/latest/developerguide/audit-chk-iot-policy-permissive.html): indicates an AWS IoT policy gives permissions that are too broad or unrestricted. In general, a policy for a device should grant access to resources associated with just that device and no or very few other devices.

- [Logging disabled](https://docs.aws.amazon.com/iot/latest/developerguide/audit-chk-logging-disabled.html): indicates AWS IoT logs are not enabled in Amazon CloudWatch. AWS IoT logs in CloudWatch provide visibility into behaviors in AWS IoT, including authentication failures and unexpected connects and disconnects that might indicate that a device has been compromised.

> Helpful tip: this Audit Checks document provide instructions to help you fix noncompliant findings for 14 checks.

8. To view which resources associate which each findings, click on the check name. In this module, let's work on fixing  **Device certificate shared**  findings. Click on this finding to find out which device certificate are being shared, and which IoT Things are involved.

9. You should will see the Certificate Id that is being shared.

<img src="../images/sharedcert.png"/>

10. To find out which IoT Things are sharing this cert, go to **Secure, Certificates**. Click the Certificate Id that you see in previous step to view details of this certificate.

11. Now click on **Things** to view the list of IoT Things are using this certificate

<img src="../images/thingswithcert.png"/>


Now you know exactly that 2 Things SensorDevice01 and SensorDevice02 are using the same X.509 to connect to AWS IoT. This is not a good configuration. Move to the next step to mitigate this noncompliant finding.

## 2. Take actions to mitigate audit findings

### 2.1 Define mitigation actions

From IoT management console, click **Defend**, **Mitigation Actions**. From the top right conner, click **Create** to create a new Mitigation Actions.

To see the list of supported actions, you can look at [this document](https://docs.aws.amazon.com/iot/latest/developerguide/device-defender-mitigation-actions.html). In this Lab, let's create a Mitigation Actions **Update device certificate** that will take action to deactivate the certificate.

<img src="../images/ma-updatedev.png"/>

Now, you'll need to give Device Defender permisison to perform this mitigation action. To do so, you create an IAM role or select an existing role that allow action **"iot:UpdateCertificate"** . Since we don't have a role with this permisison, let's ask AWS IoT to create a new one. Click **Create Role** and enter a role name. 

<img src="../images/ma-permission.png"/>

Leave everything else as it is and click **Save**. 

Now we can apply this mitigation actions to the audit findings.

### 2.2 Apply mitigation actions to audit findings

To apply mitigation actions to the audit findings, navigate to **Audit**, **Results**. Click on the **On-demand** audit to view the list of findings.

Under **Non-compliant checks**, click on **Device certificate shared**. Device Defender detects multiple devices are sharing one X.509 certificate. When you click on this check, you will see cerfiticate ID associated to both SensorDevice01 and SensorDevice02.

To apply mitigation actions, check the box next to finding ID, and click **Start Mitigation Action** on the top right corner.

<img src="../images/startma.png"/>

Give a name for this task, then click **Select options for IoT policies overly permissive** to see the drop down lists of actions, and choose the mitigation action you created in the previous step. Then click **Confirm**

<img src="../images/choosema.png"/>

To view the status of mitigation actions task, click on **Defend**, **Action results** It can take a few minutes for the task to complete. Since we use mitigation action **Update device certificate**, Device Defender will deactivate the Certificate. To double check, go to **Secure**, **Certificates**. You should see the certificate is **Inactivate**.

<img src="../images/inactivecert.png"/>

> Note: If you will work on next module [Module 3: Detect and response to a compromised device](../Module%203:%20Detect%20and%20response%20to%20a%20compromised%20device), then you will need to re-activate this certificate.

Congratulations! You have mitigated a non-compliant findings in your device configuration. Let's move to the next module [Module 3: Detect and response to a compromised device](../Module%203:%20Detect%20and%20response%20to%20a%20compromised%20device) where you will build automation to detect if a device is compromised.

