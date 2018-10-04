Installation
=====================
It is recommended that GOSINT be installed on a GNU/Linux system with the latest version of the Go language available.

Quick Installation
------------------

.. _bash-install:

- **Option 1: Bash script install**

  This process will allow GOSINT to be installed via pre-configured install scripts. Note that these scripts were tested on a 64-bit version of 16.04 Ubuntu, and a 32-bit version of 14.04 Ubuntu.

  1. Navigate to ``bash-install`` directory in the repository
  2. Execute ``sudo bash 1-install.sh`` and enter ``Y`` to all confirmation prompts.
  3. At the conclusion, the GOSINT binary will be running. If all went well, open your web browser and navigate to http://localhost/ to view the GOSINT dashboard.

.. _docker:

- **Option 2: Docker**

  - A community member has developed a version of GOSINT that runs on Docker as viewable here: https://github.com/Jsitech/DockerFiles/tree/master/gosint
  - You can pull this from the Docker Hub as: ``docker pull jsitech/gosint``
  - **Note**: This repository may not have the latest updates of the official repository. To ensure you have the latest code, either use the pre-configured installation bash scripts (as above) or look below for the more manual process.

.. _manual-install:

Manual Installation
-------------------

The following was prepared specifically for Ubuntu Server 16.04.2 LTS.

Warnings
^^^^^^^^

- **Package managers may not provide up to date versions of the software and should be tested to ensure compatibility.**

  It is strongly recommended that Go be installed with the latest version from https://golang.org/dl/

- **Package managers may name packages differently depending on the specific package manager or OS release repository.**

  For example, `php-fpm` may not exist; `php7.0-fpm` may be the correct name of the package
  
- **You must set up a time synchronization source on the host for the Twitter API OAuth to work correctly.**

Pre-Requisites
^^^^^^^^^^^^^^

GOSINT requires

- A working and up to date Go environment
- Mongo DB (Community Edition is ok)
- A reverse proxy/web server (NGINX preferred)
- PHP

You can use your preferred package manager to install most of these environments and applications. For aptitude::

  sudo apt-get install mongodb php-fpm nginx git

1. Install MongoDB and ensure it is ONLY listening on your local loopback interface (127.0.0.1/localhost) if you are running it on the same host as GOSINT.

  - Allowing your database to listen on any externally facing ports is a security risk, and should not be done without proper precautions taken to prevent unauthorized access.
  - You can use aptitude to install an older version with the command ``sudo apt-get install mongodb``, or you can follow the instructions at https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/ to install a more up to date version from the MongoDB repositories.

3. Install PHP (v5 or higher) and verify the installation was successful.

4. Install NGINX (or your preferred web server).

  - You will need to configure NGINX to listen on a public interface at a port you specify.
  - It is recommended that you install a valid certificate for HTTPS and enable some form of authorization (local auth or LDAP) to prevent unauthorized access to GOSINT.
  - Please find the base nginx configuration file at :ref:`nginx-configuration`


Step by Step
^^^^^^^^^^^^

1. Create a user for GOSINT to run on with minimal privileges.

  This user will run the backend binary which is responsible for pulling indicators and exposing an API for the frontend to use::

    sudo useradd -m gosint
    sudo su gosint

2. Install and test the Go environment.

  - Download the GNU/Linux Go 1.8 package.

    - 64 Bit: ``cd ~ && wget https://storage.googleapis.com/golang/go1.8.linux-amd64.tar.gz``

    - 32 Bit: ``cd ~ && wget https://storage.googleapis.com/golang/go1.8.linux-386.tar.gz``

  - Decompress archive.

    - 64 Bit: ``tar zxvf go1.8.linux-amd64.tar.gz``

    - 32 Bit: ``tar zxvf go1.8.linux-386.tar.gz``

3. Create project workspace and setup the environment::

    mkdir ~/projects
    export GOROOT=$HOME/go
    export PATH=$PATH:$GOROOT/bin
    export GOPATH=$HOME/projects
    export GOBIN=$GOPATH/bin
    export PATH=$GOPATH:$GOBIN:$PATH

4. Test Go environment using the instructions at https://golang.org/doc//install/source#testing

5. Install godep vendor management::

    go get github.com/tools/godep
    go install github.com/tools/godep

6. Clone GOSINT repository into your ``src`` directory in your go environment and build it::

    cd ~/projects/src
    git clone https://github.com/ciscocsirt/GOSINT
    cd GOSINT
    godep go build -o gosint
    chmod +x gosint

7. Test GOSINT build::

    ./gosint

  - GOSINT will start and then error out trying to connect to the database if MongoDB has not yet been installed.
  - For ease of use, it is recommended you use a terminal multiplexer such as GNU screen to keep the terminal open that GOSINT is running in: screen -dm ./gosint
  - If an alternate IP is needed to be specified for the Mongo DB server, you can use the flag -mongo to change it from the default 127.0.0.1.
  - Type ./gosint -h for a list of available flags.
  - If GOSINT starts up without any errors, and you have NGINX setup properly, you should now be able to navigate to the address and port specified in your webserver configuration and access the GOSINT web interface.

.. _nginx-configuration:

NGINX Configuration
^^^^^^^^^^^^^^^^^^^

::

  server {
    listen 80;

    root /home/gosint/projects/src/GOSINT/website;
    index index.php index.html index.htm;
    try_files $uri $uri/ @apachesite;

    server_name someserver.yourcompany.com;

    gzip on;
    gzip_proxied any;
    gzip_types
        text/css
        text/javascript
        text/xml
        text/plain
        application/javascript
        application/x-javascript
        application/json;

    #location / {
    #    try_files $uri $uri/ =404;
    #}

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }

    location @apachesite {

        proxy_pass http://localhost:8000;
    }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;

        # PHP 7
        fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;

        # PHP 5
        # fastcgi_pass unix:/run/php5-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
  }


Updates
-------

Updating is simple and encouraged as bugs are reported and fixed or new features are added. To update your instance of GOSINT, pull the latest version of GOSINT from the repository and re-run the build command to compile the updated binary::

  godep go build -o gosint
