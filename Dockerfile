FROM node:15.14.0-alpine


WORKDIR /usr/src/app

COPY ./public ./public
COPY ./.next ./.next
COPY ./node_modules ./node_modules
COPY ./package.json ./package.json

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs .next
USER nextjs

EXPOSE 3000
ENTRYPOINT ["yarn"]
CMD ["start"]