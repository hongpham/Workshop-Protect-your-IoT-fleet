#!/bin/bash

set -e
set -u
set -o pipefail

#retrieve arguments
while getopts 't:n:' OPTION; do
  case "$OPTION" in
    t)
      tvalue=${OPTARG};;

    n)
      nvalue=${OPTARG};;

    ?)
      echo "script usage: $(basename $0) [-t] [-n]" >&2
      echo "	-t:	Name of AWS IoT Topic that device will send data to" >&2
      echo "	-n:	Thing name" >&2

      exit 1
      ;;
  esac
done
shift "$(($OPTIND -1))"

if [ $# -eq 1 ]
then
    echo "script usage: $(basename $0) [-t] [-n]" >&2
    echo "      -t:     Name of AWS IoT Topic that device will send data to" >&2
    echo "      -n:     Thing Name">&2
    exit 0
else

	#install dependencies to run a script to send telemetry data to AWS 
    echo "Install dependencies..."
    pip install requests >/dev/null
    pip install boto3 > /dev/null
    pip install AWSIoTPythonSDK > /dev/null
    nohup python startdevice.py -t $tvalue -n $nvalue >/dev/null 2>&1 &
    echo "Sending telemetry data to AWS IoT topic " $tvalue
fi
