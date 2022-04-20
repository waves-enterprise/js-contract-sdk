FROM node:14-alpine

ARG HOST_NETWORK
ENV HOST_NETWORK ${HOST_NETWORK}

ADD src/ /src
ADD tsconfig.json /
ADD package.json /
ADD package-lock.json /

RUN npm ci
RUN npm run build

ADD entrypoint.sh /
RUN chmod +x entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
