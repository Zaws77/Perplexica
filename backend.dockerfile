FROM node:18-slim

WORKDIR /home/perplexica

COPY src /home/perplexica/src
COPY tsconfig.json /home/perplexica/
COPY drizzle.config.ts /home/perplexica/
COPY package.json /home/perplexica/
COPY yarn.lock /home/perplexica/

RUN mkdir /home/perplexica/data
RUN mkdir /home/perplexica/uploads

RUN yarn install --frozen-lockfile --network-timeout 600000
RUN yarn build

# 🔧 Instalar ferramentas de debug essenciais
RUN apt-get update && apt-get install -y \
    procps \
    net-tools \
    lsof \
    curl \
    vim \
    nano \
    tcpdump \
    strace \
    netcat-openbsd \
    htop \
    && rm -rf /var/lib/apt/lists/*

CMD ["yarn", "start"]
