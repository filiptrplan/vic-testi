FROM ubuntu:18.04

ENV DEBIAN_FRONTEND noninteractive
ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE false

WORKDIR /usr/local/

# GET ALL PROGRAMS NEEDED
RUN apt-get -yqq update
RUN apt-get -yqq install apt-utils curl python3 python3-pip
RUN curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get -yqq install nodejs
RUN npm install yarn -g

WORKDIR /usr/src/app/victesti

COPY . .


RUN pip3 install -r requirements.txt

RUN yarn install && \
    yarn prod

RUN python3 manage.py collectstatic --noinput

CMD ["sh", "startup.sh"]