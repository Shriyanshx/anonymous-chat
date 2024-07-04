# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY --from=build /app/dist ./dist
COPY --from=build /app/client ./client   # Copy client folder

RUN npm install --only=production
RUN rm package*.json

EXPOSE 3000

CMD [ "node", "dist/main.js" ]
