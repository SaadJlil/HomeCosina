source ./../Mvp/.env

userId="$1"
seedBool="$2"

sudo rm -rf ./../Mvp/prisma/migrations;
sudo ./mvpExpect.sh;

cd ./../Mvp/prisma/

#sudo npx prisma migrate dev --name recIngMigration;
sudo npx prisma migrate deploy;

cd ./../../DatabaseInitialization/


if "$seedBool"; then
	python3 seedScript.py "$userId";
fi

psql $SEEDING_DATABASE_URL -f ./recing_dataProcessing_indexing.sql;
