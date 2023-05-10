#! /bin/bash

#Start Service

/etc/init.d/nginx start
/etc/init.d/mongodb start
/etc/init.d/php5-fpm start

#create user for UI Access

touch /etc/nginx/.htpasswd

echo -e "We will now create Credentials to access the Gosint UI"

echo -n "Type a username: "; read username
echo -n "Type a Password: "; read password

echo $username:$(openssl passwd -crypt $password) >> /etc/nginx/.htpasswd

#run Gosint

/go/src/GOSINT/gosint
