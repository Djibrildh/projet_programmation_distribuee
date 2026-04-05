FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY index.js .
COPY proto/ ./proto/
EXPOSE 3001
EXPOSE 50051
CMD ["node", "index.js"]