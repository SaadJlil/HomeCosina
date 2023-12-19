#!/usr/bin/expect -f
 
cd ./../Mvp/prisma/

spawn sudo npx prisma migrate dev --name recIngMigration;

expect -re ".*" {
    send "y\r"
}

expect {

    "Do you want to continue? All data will be lost. › (y/N)"{
        send "y\r"
        exp_continue
    }
   "ERROR: Prisma Migrate has detected that the environment is non-interactive"    {
        # Handle error condition if needed
        exit 1
    }
    eof 
}

cd ./../../DatabaseInitialization/
