FROM node:14-buster-slim
ARG HOST_NETWORK
ENV HOST_NETWORK ${HOST_NETWORK}
RUN apt update && apt install -yq dnsutils
ADD dist/ /dist
#ADD src/ /src
#ADD tsconfig.json /
ADD package.json /
ADD package-lock.json /
RUN npm ci
#RUN npm run build
ADD entrypoint.sh /
RUN chmod +x entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
