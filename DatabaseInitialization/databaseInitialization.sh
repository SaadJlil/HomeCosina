#!/bin/bash

read -rp "Would you like to seed the database (This procedure takes up to an hour)? (yes/no): " seedBool;


userId=$(./userDatabaseMigration.sh)
userDatabaseMigration_exitStatus=$?


if [ $userDatabaseMigration_exitStatus -eq 0 ]; then
    ./recIngDatabaseSeed.sh "$userId" "$seedBool"
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




