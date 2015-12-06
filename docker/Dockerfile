FROM debian:jessie
MAINTAINER Fabio 'MrWHO' Torchetti <mrwho@wedjaa.net>
VOLUME [ "/opt/images/sources", "/opt/images/online", "/opt/images/cache", "/opt/application/logs" ]
ENV DOCKER_HOST=127.0.0.1,DOCKER_PORT=3000
ADD scripts /tmp
RUN /tmp/install

CMD ["/tmp/start"]
