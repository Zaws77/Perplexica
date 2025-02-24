FROM node:18-slim

WORKDIR /home/perplexica

# Copia os arquivos necessários
COPY src /home/perplexica/src
COPY tsconfig.json /home/perplexica/
COPY drizzle.config.ts /home/perplexica/
COPY package.json /home/perplexica/
COPY yarn.lock /home/perplexica/

# Copia as rotas compiladas de um diretório separado
COPY src/routes/temp_routes /home/perplexica/dist/routes

# Criação dos diretórios necessários
RUN mkdir -p /home/perplexica/data
RUN mkdir -p /home/perplexica/uploads

# Instala as dependências e compila o código
RUN yarn install --frozen-lockfile --network-timeout 600000
RUN yarn build

#sqlite
apt-get update && apt-get install -y sqlite3

# 🔧 Instalar ferramentas úteis para debug
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
