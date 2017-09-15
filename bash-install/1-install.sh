#!/bin/bash

echo
echo "~~~ GOSINT Dependencies Installer ~~~"
echo

# Root privileges required for installation
echo "Checking for root..."
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root."
   echo "Exiting..."
   exit 1
else
  echo "Root confirmed!"
fi

echo
echo "Welcome to the GOSINT dependencies installer. I will do my best to get GOSINT depdencies installed on this machine."

echo
echo "Step 1) Installing MongoDB, PHP, NGINX and Git"
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

# Get $VERSION_ID
. /etc/os-release

versionCheck="16.04"

# check if Ubuntu version is above 16.04, if so then we can install php7
# if not then install php5
if awk "BEGIN { print (${VERSION_ID} >= ${versionCheck}) ? \"1\" : \"0\" }" | grep -q "1"; then
  # version is above 16.04, install php7
  sudo apt-get -y install mongodb php7.0-fpm nginx git
  sudo truncate -s 0 /etc/nginx/sites-available/default
  sudo cat nginx-php7.conf > /etc/nginx/sites-available/default
else
  # version is below 16.04, install php5
  sudo apt-get -y install mongodb php5-fpm nginx git
  sudo truncate -s 0 /etc/nginx/sites-available/default
  sudo cat nginx-php5.conf > /etc/nginx/sites-available/default
fi

# Restart nginx to load new configuration
echo "Restarting nginx..."
sudo service nginx restart

echo
echo "Necessary dependencies installed!"
echo

echo "Step 2) Creating a 'gosint' user with minimal privileges."
echo
echo "This user will run the backend binary which is responsible for pulling indicators and exposing an API for the frontend to use."
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

# Add new user gosint
sudo useradd -m gosint

echo
echo "gosint user added!"
echo
echo "Now switching to second half of installation."
echo

# Make 2-install script executable and copy to user gosint's home directory
# Then switch to gosint user and execute script
sudo chmod +x 2-install.sh
cp 2-install.sh /home/gosint/
sudo -i -u gosint bash 2-install.sh
