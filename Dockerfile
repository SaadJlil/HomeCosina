# Use Ubuntu as the base image
FROM ubuntu:22.04


EXPOSE 443

# Set working directory
WORKDIR /HomeCosina

# Ensure proper permissions
USER root

ENV DEBIAN_FRONTEND=noninteractive


# Update package lists and install essential packages
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    curl \
    postgresql \
    sudo \
    lsof \
    expect


#RUN service postgresql start

# Symlink python3 to python (optional)
RUN ln -s /usr/bin/python3 /usr/bin/python

RUN pip3 install openpyxl \
                 uuid \
                 psycopg2-binary \
                 progress \
                 requests \
                 python-dotenv \

#install node
ENV NODE_VERSION=20.5.1
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# Install npx globally (if needed)
RUN npm install -g npx --force
RUN npm i -g nodemon

# Copy your application files into the container
COPY . /HomeCosina


# Placeholders for extracted ports
ARG AUTH_PORT_ARG
ARG MVP_PORT_ARG

# Expose ports using arguments
EXPOSE $AUTH_PORT_ARG
EXPOSE $MVP_PORT_ARG


WORKDIR /HomeCosina/AuthIdt
RUN npm install -g pm2
RUN npm install -force

WORKDIR /HomeCosina/Mvp
RUN npm install -g pm2
RUN npm install -force


ENV DEBIAN_FRONTEND=dialog

WORKDIR /HomeCosina/DatabaseInitialization

RUN chmod +x ./*.sh
ENTRYPOINT ["./DatabaseInitialization/databaseInitialization.sh"]

WORKDIR /HomeCosina

#CMD pm2-runtime start ./Mvp/src/index.js && \
#    pm2-runtime start ./AuthIdt/src/index.js

