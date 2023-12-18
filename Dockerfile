# Use Ubuntu as the base image
FROM ubuntu:22.04


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
    postgresql


RUN service postgresql start

# Symlink python3 to python (optional)
RUN ln -s /usr/bin/python3 /usr/bin/python

RUN pip3 install openpyxl 
RUN pip3 install uuid 
RUN pip3 install psycopg2-binary
RUN pip3 install progress 
RUN pip3 install python-dotenv

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

# Copy your application files into the container
COPY . /HomeCosina


#env variable: Mvp microservice
RUN Auth_PORT=$(grep '^PORT=' ./AuthIdt/.env | cut -d '=' -f 2) && \
    echo "Exposing port $Auth_PORT"


#env variable: AuthIdt microservice
RUN Mvp_PORT=$(grep '^PORT=' ./Mvp/.env | cut -d '=' -f 2) && \
    echo "Exposing port $Mvp_PORT"

# Expose ports using the extracted variables
EXPOSE $Auth_PORT
EXPOSE $Mvp_PORT



WORKDIR /HomeCosina/AuthIdt
RUN npm install -force

WORKDIR /HomeCosina/Mvp
RUN npm install -force

WORKDIR /HomeCosina

ENV DEBIAN_FRONTEND=dialog

RUN ./DatabaseInitialization/databaseInitialization.sh

CMD pm2-runtime start ./Mvp/src/index.js && \
    pm2-runtime start ./AuthIdt/src/index.js
                                                                                   79,1          Bot


