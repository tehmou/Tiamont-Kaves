#!/bin/bash

source build.sh

echo Starting to transfer to $SERVER_ADDRESS
mv release $APP_NAME
scp -r $APP_NAME $SERVER_USER@$SERVER_ADDRESS
mv $APP_NAME release
