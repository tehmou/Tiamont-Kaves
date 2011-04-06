#!/bin/bash

source config.sh

echo "Removing old release"
rm -rf release

echo "Copying src"
cp -r src release
cp config-playbook.xml release/config.xml
cd release

echo "Removing redundant files"
find . -name ".DS_Store" | xargs rm -Rf
find . -name ".idea" | xargs rm -Rf
find . -name ".ai" | xargs rm -Rf

echo "Zipping"
zip -r ${APP_NAME}.zip *

if [ "$1" = "sign" ]
then
	echo "Compiling and signing the package..."
	bbwp ${APP_NAME}.zip -gcsk $SIGN_PASS1 -gp12 $SIGN_PASS2 -buildId $BUILD_ID -o .
else
	echo "Compile only..."
	bbwp ${APP_NAME}.zip -o .
fi  

echo "Deploying on $PLAYBOOK_IP"
blackberry-deploy -installApp -launchApp -package ${APP_NAME}.bar -password $PLAYBOOK_PASS -device $PLAYBOOK_IP

