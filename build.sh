#!/bin/bash

source config.sh

echo "Removing old release"
rm -rf release

echo "Copying src"
cp -r src release
cd release

echo "Removing redundant files"
find . -name ".DS_Store" | xargs rm -Rf
find . -name ".idea" | xargs rm -Rf
find . -name "*.ai" | xargs rm -Rf

cd ..
