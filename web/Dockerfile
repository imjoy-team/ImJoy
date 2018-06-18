FROM node:8

RUN apt-get update && apt-get -y install bzip2 git
RUN npm install --quiet --global \
      vue-cli

RUN mkdir /code
# COPY . /code
# Add ./ /code/

WORKDIR /code
