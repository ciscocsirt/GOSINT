### GOSINT - Open Source Threat Intelligence Gathering and Processing Framework
=====================================

If you want to sidestep the process of installing and configuring all requirements to run GOSINT, follow the instructions to run GOSINT on a Docker Container.


***Creating the Docker Image***
=========================
```
docker build -t gosint .
```

This will take a little, but at the end we will have and image with the tag gosint.

***Running the Container***
=========================
```
docker run -i -t -p 443:443 gosint
```

***Set Volume for Persistent Data***
=========================
```
docker run -i -t -p 443:443 -v /your/persistent/data/path:/var/lib/mongodb gosint
```



