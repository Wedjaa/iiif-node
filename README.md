# iiif-node

This is a NodeJS IIIF 2.0 Compliant Server, it requires some fiddling - as of this first release - to work correctly; namely it has a dependency on a modified version of the sharp library.

## Using the docker image

The Docker image can be created by launching the `docker\build.sh` script included. It will create an image named *iiif-node:latest*.

You can run the docker container as follows:

```
docker run -e "DOCKER_HOST=$(ip -4 addr show eth0| grep -Po 'inet \K[\d.]+')"
 -v /images/src:/opt/images/sources \
 -v /images/online:/opt/images/online \
 -v /images/cache:/opt/images/cache \
 -v /var/logs/iiif-node:/opt/application/logs \
 -P 3000:3000 --name="iiif-node" \
 iiif-node:latest
 ```

 
