FROM node:19-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

ENV npm_config_legacy_peer_deps=true
RUN npm ci --only=production

COPY . .

RUN npm install --save-dev style-loader@4.0.0 css-loader@7.1.2

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "run", "start"]
