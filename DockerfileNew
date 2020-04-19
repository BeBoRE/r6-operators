FROM node:12
WORKDIR /home/node/app
COPY . .
ENV NODE_ENV=production
RUN npm ci --only=production
RUN npm install pm2 -g
EXPOSE 4444
CMD ["pm2-runtime", "process.config.js"]
