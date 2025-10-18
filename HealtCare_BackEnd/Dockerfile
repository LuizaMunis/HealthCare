# Use uma imagem base do Node.js. 'alpine' é uma versão leve, ótima para desenvolvimento.
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o resto do código da aplicação
COPY . .

# Expõe a porta que sua API usa (geralmente 3000 ou 5000)
# Mude se o seu backend rodar em outra porta
EXPOSE 3000

# O comando para iniciar a aplicação
CMD ["npm", "start"]