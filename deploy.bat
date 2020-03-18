git pull
docker build -t r6-operators .
docker stop r6-operators 
docker rm r6-operators
docker run -p 8082:4444 -d --restart=unless-stopped --name r6-operators r6-operators
