#!/bin/bash

source ./../AuthIdt/.env

sudo rm -rf ./../AuthIdt/prisma/migrations;
sudo ./userExpect.sh 

cd ./../AuthIdt/prisma/

#sudo npx prisma migrate dev --name userMigration
sudo npx prisma migrate deploy

npm start >/dev/null 2>&1 &
sleep 5



npm_pid=$!
node_pid=$(lsof -t -i :$PORT)


cd ./../../DatabaseInitialization/


authResponse=$(curl -s -X POST http://$HOST:$PORT/api/signup \
-H "Content-Type: application/json" \
-d '{
    "password":"'"$SEED_PASSWORD"'",
    "email": "'"$SEED_EMAIL"'",
    "username": "'"$SEED_USERNAME"'"
}')



kill $npm_pid
kill $node_pid


if [ $? -ne 0 ]; then
    #echo "Error: Curl command failed"
    exit 11
fi


success=$(echo "$authResponse" | grep -o '"success":[^,}]*' | awk -F ':' '{print $2}' | tr -d '"{}, ')

if [ "$success" == "true" ]; then
    userId=$(echo "$authResponse" | grep -o '"userId":"[^"]*' | awk -F ':' '{print $2}' | tr -d '"')
    echo "$userId"
else
    errorMessage=$(echo "$authResponse" | grep -o '"message":"[^"]*' | awk -F ':' '{print $2}' | tr -d '"')
    if [ "$errorMessage" == "" ]; then
    	#echo "ERROR: the user created is already present in the firebase database. Please delete the user from firebase and rerun the seedScript."
	exit 12
    else
    	#echo "ERROR: $errorMessage"
    	exit 13
    fi
fi



