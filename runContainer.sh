#!/bin/bash

# Extract port from AuthIdt/.env
AUTH_PORT=$(grep '^PORT=' ./AuthIdt/.env | cut -d '=' -f 2)

# Extract port from Mvp/.env
MVP_PORT=$(grep '^PORT=' ./Mvp/.env | cut -d '=' -f 2)


sudo docker system prune -a &&
sudo docker build \
  --build-arg AUTH_PORT_ARG=$AUTH_PORT \
  --build-arg MVP_PORT_ARG=$MVP_PORT \
  -t homecosina . &&
sudo docker run -itP homecosina -s &

