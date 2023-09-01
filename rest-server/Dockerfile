FROM node:18.17.1-slim

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install --omit=dev \
    --strict-peer-deps --loglevel verbose && \
    rm -rf /root/.cache && rm -rf /root/.npm
COPY . /app

CMD ["npx", "ts-node", "app.ts"]