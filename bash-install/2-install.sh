#!/bin/bash

# Script must be run as user gosint
if [ "$(whoami)" != "gosint" ]; then
        echo "Script must be run as user: gosint"
        exit -1
fi

# Change to home directory of gosint user
cd /home/gosint
echo "Changed directory to gosint user home directory."

echo "Step 3) Creating new directory, downloading GO package, and setting up the environment."
echo

# User confirmation
while true; do
    read -p "Enter Y to continue or N to exit. " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) echo "Exiting..."; echo; exit 1;;
        * ) echo "Please answer yes or no.";;
    esac
done

# Check if system is 32- or 64- bit and download corresponding Go version
MACHINE_TYPE=`uname -m`
if [ ${MACHINE_TYPE} == 'x86_64' ]; then
  echo
  echo "64-bit machine detected."
  cd ~
  wget https://storage.googleapis.com/golang/go1.8.linux-amd64.tar.gz
  echo
  echo "Extracting archive..."
  tar zxvf go1.8.linux-amd64.tar.gz
else
  echo
  echo "32-bit machine detected."
  cd ~
  wget https://storage.googleapis.com/golang/go1.8.linux-386.tar.gz
  echo
  echo "Extracting archive..."
  echo
  tar zxvf go1.8.linux-386.tar.gz
fi

echo "Go installed. Creating project workspace..."
mkdir ~/projects
echo

# Set up environment variables
echo "Setting up environment..."
export GOROOT=$HOME/go
export PATH=$PATH:$GOROOT/bin
export GOPATH=$HOME/projects
export GOBIN=$GOPATH/bin
export PATH=$GOPATH:$GOBIN:$PATH
echo

# Create, compile and run a Hello World program to ensure everything works
echo "I will now run a test Hello World program with Go to ensure things are OK..."
echo -e "package main\nimport \"fmt\"\nfunc main() {\n\nfmt.Printf(\"Hello world\")\n}" > helloworld.go

go run helloworld.go | grep 'Hello world' &> /dev/null
if [ $? == 0 ]; then
   echo "Hello world"
   echo "Go environment set up!"
   echo
else
  echo "Some error encountered..."
  exit 1
fi

echo "Step 4) Installing godep vendor management, cloning, GOSINT repository from Github, and testing gosint binary."

# User confirmation
while true; do
    read -p "Enter Y to continue or N to exit. " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) echo "Exiting..."; echo; exit 1;;
        * ) echo "Please answer yes or no.";;
    esac
done

echo
echo "Downloading godep vendor management..."
go get github.com/tools/godep

echo "Installing godep..."
go install github.com/tools/godep

# Clone Github repo
echo "Downloading Github repository..."
cd ~/projects/src
git clone https://github.com/ciscocsirt/GOSINT
cd GOSINT

# Compile GOSINT binary
echo "Compiling GOSINT..."
godep go build -o gosint
chmod +x gosint

echo
echo "GOSINT successfully compiled!"
echo
echo "We can now do a test run of GOSINT. If everything went well, upon running the GOSINT binary, navigate to http://localhost/ in your browser to load the GOSINT interface."

# User confirmation
while true; do
    read -p "Enter Y to continue or N to exit. " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) echo "Exiting..."; echo; exit 1;;
        * ) echo "Please answer yes or no.";;
    esac
done

# Execute gosint binary
./gosint

# Exit from the script with success (0)
exit 0
