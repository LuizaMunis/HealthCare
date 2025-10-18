# Estágio 1: Use uma imagem base oficial do Python.
# A tag 'slim' é menor e boa para produção.
FROM python:3.10-slim

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Define variáveis de ambiente para garantir que os logs do Python apareçam imediatamente.
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copia APENAS o arquivo de dependências primeiro.
# Isso aproveita o cache do Docker. Se o requirements.txt não mudar,
# o Docker não reinstalará as dependências toda vez que você mudar o código.
COPY requirements.txt .

# Instala as dependências do Python.
RUN pip install --no-cache-dir -r requirements.txt

# Agora copia o resto do código da sua aplicação para o diretório de trabalho.
COPY . .

# Expõe a porta que o Gunicorn usará para rodar a aplicação.
EXPOSE 5000

# O comando para iniciar a aplicação quando o contêiner for executado.
# Usa Gunicorn, o servidor de produção, para rodar a 'app' do arquivo 'app.py'.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]