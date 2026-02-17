FROM node:22-alpine AS builder
WORKDIR /app

COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci

WORKDIR /app
RUN ln -s /app/client/node_modules /app/node_modules
COPY client ./client
COPY shared ./shared

WORKDIR /app/client
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/client

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/client/package*.json ./
COPY --from=builder /app/client/node_modules ./node_modules
RUN npm prune --omit=dev && npm cache clean --force

COPY --from=builder /app/client/.next ./.next
COPY --from=builder /app/client/public ./public
COPY --from=builder /app/client/next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
