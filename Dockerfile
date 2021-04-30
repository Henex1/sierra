FROM node:15.14.0 AS builder
ENV DATABASE_URL=postgresql://postgres:example@postgres:5432/postgres?schema=public \
    NEXTAUTH_URL=http://localhost:3000/api/auth \
    ALLOW_REGISTRATION_FROM=bigdataboutique.com \
    QUERY_EXPANDER_URL=http://localhost:8080 \
    GOOGLE_ID=unset_google_id \
    GOOGLE_SECRET=unset_google_secret


# Install dependencies
WORKDIR /app
# COPY ./ ./
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# Build
COPY . ./
RUN yarn --frozen-lockfile
RUN yarn build


from node:15.14.0-alpine
# Release
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/pages ./pages

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000
ENTRYPOINT ["yarn"]
CMD ["start"]