#!/bin/bash

# Boolean variable to track if -s flag was used
seedBool=false

# Loop through the arguments passed to the script
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    -s) # If -s flag is detected, set seedBool to true
      seedBool=true
      ;;
    *) # Other flags or arguments can be handled here if needed
      ;;
  esac
  shift # Move to the next argument
done

sudo service postgresql start

/HomeCosina/DatabaseInitialization/CreateAuthDatabase.sh
/HomeCosina/DatabaseInitialization/CreateMvpDatabase.sh

userId=$(/HomeCosina/DatabaseInitialization/userDatabaseMigration.sh)
userDatabaseMigration_exitStatus=$?


if [ $userDatabaseMigration_exitStatus -eq 0 ]; then
    /HomeCosina/DatabaseInitialization/recIngDatabaseSeed.sh "$userId" "$seedBool"
    exit_status=$? 
    
    if [ $exit_status -eq 0 ]; then
        echo "recIngDatabaseSeed executed successfully"
    else
        echo "recIngDatabaseSeed failed or wasn't executed"
    fi

else

    case $userDatabaseMigration_exitStatus in
      11)
        echo "Error: Curl command failed"
      ;;

      12)
       echo "ERROR: the user created is already present in the firebase database. Please delete the user from firebase and rerun the seedScript."
      ;;

      13) 
	echo "ERROR: couldn't auth with the seed user"
      ;;

      *)
        echo "unknown error"
      ;;

    esac



    echo "userDatabaseMigration failed or wasn't executed"
fi



cd /HomeCosina/AuthIdt
nodemon /HomeCosina/AuthIdt/src/index.js --exec babel-node --harmony  &

cd /HomeCosina/Mvp
nodemon /HomeCosina/Mvp/src/index.js --exec babel-node --harmony

