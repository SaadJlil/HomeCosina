source /HomeCosina/Mvp/.env

userId="$1"
seedBool="$2"

sudo rm -rf /HomeCosina/Mvp/prisma/migrations;
/HomeCosina/DatabaseInitialization/mvpExpect.sh;

cd /HomeCosina/Mvp/prisma/

#sudo npx prisma migrate dev --name recIngMigration;
npx prisma migrate deploy;


if "$seedBool"; then
	python3 /HomeCosina/DatabaseInitialization/seedScript.py "$userId";
fi

psql $SEEDING_DATABASE_URL -f /HomeCosina/DatabaseInitialization/recing_dataProcessing_indexing.sql;
