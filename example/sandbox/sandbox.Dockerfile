FROM node:16-buster-slim
ARG DEBUG=0
ENV DEBUG ${DEBUG}
ARG HOST_NETWORK=0.0.0.0
ENV HOST_NETWORK ${HOST_NETWORK}
ARG VERBOSE_LOG=0
ENV VERBOSE_LOG ${VERBOSE_LOG}
ARG REMOTE_LOG=0
ENV REMOTE_LOG ${REMOTE_LOG}
RUN apt update && apt install -yq dnsutils
ADD /example/sandbox/src/ /src
ADD /example/sandbox/tsconfig.build.json /
ADD /example/sandbox/package.json /
ADD /example/sandbox/package-lock.json /
RUN npm install
ADD /packages/contract-core /node_modules/@wavesenterprise/contract-core
RUN npm run build
ADD /example/sandbox/run.sh /
RUN chmod +x run.sh
ENTRYPOINT ["/run.sh"]
