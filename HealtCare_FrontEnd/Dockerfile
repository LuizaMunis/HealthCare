# HealthCare_FrontEnd/Dockerfile
# Use a mesma imagem base do Node.js
FROM node:18-alpine

# Instala o Expo CLI globalmente dentro do contêiner
RUN npm install -g expo-cli

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o resto do código do frontend
COPY . .

# Expõe as portas que o Expo utiliza
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# O comando para iniciar o Expo
# O host 0.0.0.0 é crucial para que ele seja acessível de fora do contêiner
CMD ["npx", "expo", "start", "--lan"]