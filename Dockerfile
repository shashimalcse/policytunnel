###### [STAGE] Build ######
FROM node:18-alpine as builder
WORKDIR /etc/policytunnel

# No need for Docker build
ENV PUPPETEER_SKIP_DOWNLOAD=true

### Install toolchain ###
RUN npm add --location=global pnpm@^8.0.0

COPY . .

RUN pnpm i

RUN pnpm build:libs

###### [STAGE] Seal ######
FROM node:18-alpine as app
WORKDIR /etc/policytunnel
COPY --from=builder /etc/policytunnel .
EXPOSE 3001
ENTRYPOINT ["pnpm", "app"]
CMD ["dev"]
