source /HomeCosina/Mvp/.env



sudo -u postgres psql -c "CREATE USER $DATABASE_USERNAME WITH PASSWORD '$DATABASE_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $DATABASE_NAME WITH OWNER $DATABASE_USERNAME;"