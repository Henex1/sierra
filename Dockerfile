FROM node:15.14.0 AS deps

#### Install dependencies
WORKDIR /app
COPY package.json yarn.lock eslint ./
RUN yarn --frozen-lockfile

#### Install dependencies again
COPY . ./
RUN yarn --frozen-lockfile && yarn prisma generate

FROM node:15.14.0 AS builder
#### Build
ENV DATABASE_URL=postgresql://postgres:example@postgres:5432/postgres?schema=public \
    NEXTAUTH_URL=http://localhost:3000/api/auth \
    SECRET=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
    ALLOW_REGISTRATION_FROM=bigdataboutique.com \
    QUERY_EXPANDER_URL=http://localhost:8080 \
    GOOGLE_ID=unset_google_id \
    GOOGLE_SECRET=unset_google_secret \
    CREDENTIALS_SECRET=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
    NODE_ENV=production

WORKDIR /app
COPY --from=deps /app ./

# This tsc command isn't strictly necessary for the build, but yarn build will
# only show one single error and tsc will show all of them, and is faster than
# yarn build.
RUN yarn tsc -b . && yarn build


FROM node:15.14.0-alpine
#### Release/minify
WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/pages ./pages
COPY --from=builder /app/server.js ./server.js

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000
ENTRYPOINT ["yarn"]
CMD ["start"]
