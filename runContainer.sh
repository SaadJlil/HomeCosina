#!/bin/bash

# Extract port from AuthIdt/.env
AUTH_PORT=$(grep '^PORT=' ./AuthIdt/.env | cut -d '=' -f 2)

# Extract port from Mvp/.env
MVP_PORT=$(grep '^PORT=' ./Mvp/.env | cut -d '=' -f 2)




#Responds to all connection (Not restricted to localhost)
sudo docker system prune -a &&
sudo docker build \
  --build-arg AUTH_PORT_ARG=$AUTH_PORT \
  --build-arg MVP_PORT_ARG=$MVP_PORT \
  -t homecosina . &&
sudo docker run -itP homecosina #-s

exit


#Only responds to localhost connections (Cons: specification of host ports)
sudo docker system prune -a &&
sudo docker build \
  -t homecosina . &&
sudo docker run \
  -p 127.0.0.1:3000:$AUTH_PORT \
  -p 127.0.0.1:5000:$MVP_PORT \
  -it homecosina #-s


