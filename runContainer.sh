
#!/bin/bash 
# Extract port from AuthIdt/.env
AUTH_PORT=$(grep '^PORT=' ./AuthIdt/.env | cut -d '=' -f 2)

# Extract port from Mvp/.env
MVP_PORT=$(grep '^PORT=' ./Mvp/.env | cut -d '=' -f 2)


sudo apt install nginx -y
sudo apt install certbot python3-certbot-nginx -y
sudo apt install ufw -y

sudo ufw disable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow "Nginx HTTPS"
sudo ufw enable


nginxScript="
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/html;

        index index.html index.htm index.nginx-debian.html;

        server_name homecosina.com www.homecosina.com;

        location / {
                try_files \$uri \$uri/ =404;
        }

        location /api/signin {
                proxy_pass http://localhost:$AUTH_PORT/api/signin;
        }
        location /api/signup {
                proxy_pass http://localhost:$AUTH_PORT/api/signup;
        }
        location /api/logout {
                proxy_pass http://localhost:$AUTH_PORT/api/logout;
        }
        location /api/refresh-token {
                proxy_pass http://localhost:$AUTH_PORT/api/refresh-token;
        }
        location ~ ^/api/email-confirmation=(.*) {
                proxy_pass http://localhost:$AUTH_PORT/api/email-confirmation=\$1;
        }
        location /api/autorize{
                proxy_pass http://localhost:$AUTH_PORT/api/refresh-token;
        }

        location /api/editUserInfo {
                proxy_pass http://localhost:$AUTH_PORT/api/editUserInfo;
        }
        location /api/getUserInfo{
                proxy_pass http://localhost:$AUTH_PORT/api/getUserInfo;
        }

        location /graphql {
		proxy_pass http://localhost:$MVP_PORT/graphql;
        }

}
"


sudo chmod 777 /etc/nginx/sites-available/default;
sudo echo "$nginxScript" > /etc/nginx/sites-available/default;
sudo systemctl restart nginx;

sudo certbot --nginx -d homecosina.com -d www.homecosina.com

#Only responds to localhost connections (Cons: specification of host ports)
sudo docker system prune -a &&
sudo docker build \
  -t homecosina . &&
sudo docker run \
  -p 127.0.0.1:3000:$AUTH_PORT \
  -p 127.0.0.1:5000:$MVP_PORT \
  -it homecosina #-s



exit



#Responds to all connection (Not restricted to localhost)
sudo docker system prune -a &&
sudo docker build \
  --build-arg AUTH_PORT_ARG=$AUTH_PORT \
  --build-arg MVP_PORT_ARG=$MVP_PORT \
  -t homecosina . &&
sudo docker run -itP homecosina #-s

