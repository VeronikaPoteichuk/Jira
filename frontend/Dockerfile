FROM node:19

WORKDIR /app

COPY package.json package-lock.json* ./
ENV npm_config_legacy_peer_deps=true
RUN npm install

COPY . .

RUN npm install --save-dev style-loader@4.0.0 css-loader@7.1.2

CMD ["npm", "run", "start"]
