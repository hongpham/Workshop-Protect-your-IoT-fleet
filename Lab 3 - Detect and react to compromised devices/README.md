After you have identify potential external threats to your IoT devices, it's crucial to implement a solution to quickly detec if the devices are compromised, and take action to stop the attack. In this lab, your task is to detect if the device participate in a DDoS attack and becomes the source of the actack.

To do so, you will need to define when the devices' behaviors will be considered abnormal and need a human attention to check if it's actually compromised. So let's use AWS IoT Device Defender Detect for that.

## 1. Define unusual behaviors of your devices

You realizes that you can use 2 device metrics to detect if the devices are acting strangely: how much data the device is sending, and the freqency of sending. Now you can tell Device Defender to monitor these two metrics, and alert you if it's out of the threadhold that you define. A combination of anomalous behaviors and actions to take when abnomoly behavior is detected is called **Security Profile**

From the IoT management console, click **Defend**,**Detect**, **Security Profiles**, **Create your first security profile**. Name this security profile as **UnusualMessageVolume** and define 2 behaviors.

<img src="../images/behaviors.png"/>

The first behavior is **messageSize**. We ask Device Defender to observe **Bytes out** metric and alert us if the size of the message going out of the device is greater than 5000 bytes - which is very much larger than the regular message size that Device01 and Device02 usually send to AWS IoT. We ask Device Defender to aggregate metric every 5 minutes as one datapoint. And if a device is in violation of this behavior for two datapoints, then the alarm will be trigger.

The second behavior is **numConnection**. We want Device Defender to observe number of **Connection attempts**. If our devices try to connect to AWS IoT endpoint for more than 35 times in 5 minutes, then Device Defender should create a datapoint. And alarm will be trigger after two or more datapoints.

We also need to keep relevant metrics for investigation. Under **Addionional Metrics to retain**, click on **Select** on the right corner to see drop down list of metrics that we can retain. In this lab, we'll choose **Established TCP connections count**, **Message size**, and **Message received**. Then click **Next**

<img src="../images/retainmetrics.png"/>

Optional: you can specify a SNS topic for alerts when Device Defender alarm a violation

<img src="../images/snsdetect.png"/>

Now you need to attach this security profile to a target. A target can be a thing, or a thing group. For simplicity, we will attach this security profile with **All things** for now.

<img src="../images/target.png"/>

Click **Next** to view summary of this Security Profile. When you confirm everything is correct, then click **Save**




## 2. Respond to the violations
