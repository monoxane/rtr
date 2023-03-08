FROM golang:latest AS api

ENV GO111MODULE=on \
    CGO_ENABLED=1

WORKDIR /build

COPY go.mod .
COPY go.sum .
RUN go mod download

COPY . .

RUN go build -trimpath -o rtr .

WORKDIR /dist
RUN cp /build/rtr ./rtr

RUN ldd rtr | tr -s '[:blank:]' '\n' | grep '^/' | \
    xargs -I % sh -c 'mkdir -p $(dirname ./%); cp % ./%;'
RUN mkdir -p lib64 && cp /lib64/ld-linux-x86-64.so.2 lib64/

FROM node:latest as react
RUN apt-get update && apt-get install -y glib2.0-dev libvips-dev
WORKDIR /build
COPY ./ui .
RUN yarn 
RUN yarn run build

FROM alpine:latest
COPY --chown=0:0 --from=api /dist /
COPY --chown=0:0 --from=react /build/dist /dist
USER 0

ENTRYPOINT ["/rtr"]
EXPOSE 8080