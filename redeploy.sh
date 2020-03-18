#!/bin/sh
# Script to deploy or redeploy using docker
git pull --progress 2>&1
docker build -t r6-operators .
if [ "$(docker ps -a | grep r6-operators)" ]; then
	echo detected existing r6-operators container
	if [ $(docker inspect -f '{{.State.Running}}' r6-operators) = "true" ]; then
		echo stopping r6-operators	
		docker stop r6-operators 
	fi
	echo removing r6-operators
	docker rm r6-operators
fi
docker run -p 8082:4444 -d --name r6-operators r6-operators
