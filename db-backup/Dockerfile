FROM ubuntu:18.04

ENV DEBIAN_FRONTEND noninteractive
ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE false

RUN apt-get -yqq update
RUN apt-get -yqq install wget apt-utils curl gnupg2
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt bionic-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get -yqq update
RUN apt-get -yqq install python3 python3-pip cron postgresql

WORKDIR /usr/src/app

COPY . . 
RUN pip3 install --no-cache-dir -r requirements.txt

COPY crontab /etc/cron.d/crontab
RUN chmod 0644 /etc/cron.d/crontab
RUN crontab /etc/cron.d/crontab
RUN touch /var/log/cron.log

RUN chmod 0744 backupdb.sh


CMD printenv >> /etc/environment && cron && tail -f /var/log/cron.log
