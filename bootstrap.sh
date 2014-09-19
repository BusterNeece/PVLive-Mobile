#!/usr/bin/env bash

ANDROID_SDK_FILENAME=android-sdk_r23.0.2-linux.tgz
ANDROID_SDK=http://dl.google.com/android/$ANDROID_SDK_FILENAME

# Install base software packages
sudo apt-get install -y python-software-properties
sudo add-apt-repository ppa:webupd8team/java

sudo apt-get update
sudo apt-get install -y nodejs nodejs-legacy npm git openjdk-7-jdk ant expect

# Android SDK dependencies
sudo dpkg --add-architecture i386
sudo apt-get -qqy update
sudo apt-get -qqy install libncurses5:i386 libstdc++6:i386 zlib1g:i386

# Install Android SDK itself
curl -O $ANDROID_SDK
tar -xzvf $ANDROID_SDK_FILENAME
sudo chown -R vagrant android-sdk-linux/

echo "ANDROID_HOME=~/android-sdk-linux" >> /home/vagrant/.bashrc
echo "PATH=\$PATH:~/android-sdk-linux/tools:~/android-sdk-linux/platform-tools" >> /home/vagrant/.bashrc

npm install -g cordova
npm install -g ionic

expect -c '
set timeout -1   ;
spawn /home/vagrant/android-sdk-linux/tools/android update sdk -u --all --filter platform-tool,android-19,build-tools-19.1.0
expect { 
    "Do you accept the license" { exp_send "y\r" ; exp_continue }
    eof
}
'

# Set permissions in directory.
sudo chown -R vagrant android-sdk-linux/
sudo chmod a+x android-sdk-linux/

# Run initial server start.
sudo /home/vagrant/android-sdk-linux/platform-tools/adb kill-server
sudo /home/vagrant/android-sdk-linux/platform-tools/adb start-server
sudo /home/vagrant/android-sdk-linux/platform-tools/adb devices
