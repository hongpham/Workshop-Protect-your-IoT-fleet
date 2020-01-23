WORKING NOTE


-----
Create javascript zip file to upload S3
zip -vr ../createKeyPair.zip .

validate template
aws cloudformation validate-template --template-body file://provision_devices.template
