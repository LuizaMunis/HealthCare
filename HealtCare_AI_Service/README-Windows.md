# Guia de Configuração do Projeto HealthCare no Windows

Este guia detalha o passo a passo para configurar e executar todo o ambiente de desenvolvimento do projeto HealthCare (Backend, Frontend, Banco de Dados e Serviço de IA) usando Docker Desktop no Windows.

## Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados na sua máquina.

### Verificando as Ferramentas Instaladas

Abra um terminal (**PowerShell** ou **CMD**) e execute os seguintes comandos para verificar se cada ferramenta está instalada e qual a sua versão:

-   **Git:** Para clonar o projeto (ex: [Git for Windows](https://git-scm.com/download/win)).
    ```powershell
    git --version
    ```

-   **Docker Desktop for Windows:** Ele já inclui o Docker e o Docker Compose. Certifique-se de que ele esteja em execução (ícone da baleia na bandeja do sistema).
    ```powershell
    docker --version
    docker-compose --version
    ```

-   **Node.js e NPM:** Para o desenvolvimento local, se necessário.
    ```powershell
    node -v
    npm -v
    ```

-   **Python 3 e Pip:** Para configurar o ambiente da IA.
    ```powershell
    python --version
    pip --version
    ```
Se algum comando resultar em erro, você precisará instalar a ferramenta correspondente.

---

## Passo 1: Configuração do Serviço de IA (`HealtCare_AI_Service`)

Esta é a única parte que requer uma configuração manual antes de ser automatizada pelo Docker Compose.

1.  **Navegue até a pasta do serviço de IA usando o seu terminal:**
    ```powershell
    cd HealthCare\HealtCare_AI_Service\
    ```

2.  **Crie e ative um ambiente virtual Python:**
    ```powershell
    # Cria a pasta 'venv'
    python -m venv venv

    # Ativa o ambiente
    .\venv\Scripts\activate
    ```
    Seu terminal deve agora mostrar `(venv)` no início do prompt.

3.  **Instale as dependências Python:**
    ```powershell
    pip install -r requirements.txt
    ```

4.  **Crie o modelo de simulação (`.pkl`):**
    Este script cria um modelo de Machine Learning falso para que a aplicação funcione.
    ```powershell
    python create_mock_model.py
    ```
    Após a execução, verifique se a pasta `models` e o arquivo `risk_model_v1.pkl` foram criados.

5.  **Crie o arquivo `.dockerignore`:**
    Para otimizar o build do Docker, crie um arquivo chamado `.dockerignore` dentro de `HealtCare_AI_Service/` com o seguinte conteúdo:
    ```
    venv/
    __pycache__/
    *.pyc
    .env
    ```

6.  **Desative o ambiente virtual:**
    ```powershell
    deactivate
    ```

---

## Passo 2: Orquestrar com Docker Compose

O arquivo `docker-compose.yml` na raiz do projeto (`HealthCare/`) irá gerenciar todos os serviços. Verifique se ele está configurado corretamente, especialmente as variáveis de ambiente para comunicação entre os contêineres:

-   `backend` -> `environment.DB_HOST`: `db`
-   `backend` -> `environment.AI_SERVICE_URL`: `http://ai_service:5000/predict`
-   `frontend` -> `environment.EXPO_PUBLIC_API_URL_DEV`: `http://backend:3000`

---

## Passo 3: Executar a Aplicação Completa

1.  **Navegue até a raiz do projeto:**
    ```powershell
    # Se você ainda estiver na pasta da IA, volte
    cd ..\..
    ```
    Você deve estar em `HealthCare/`.

2.  **Inicie todos os serviços:**
    Este comando irá construir as imagens do frontend, backend e IA, e iniciar todos os 5 contêineres (db, backend, frontend, ai_service, phpmyadmin).

    ```powershell
    docker-compose up --build
    ```
    A flag `--build` é importante na primeira vez e sempre que você alterar um `Dockerfile`.

3.  **Para parar todos os serviços:**
    Abra um **novo terminal** na mesma pasta raiz e execute:
    ```powershell
    docker-compose down
    ```

---

## Passo 4: Testar o Serviço de IA

Com tudo rodando, você pode testar o endpoint da IA para garantir que ele está funcionando.

1.  **Verifique se o contêiner está no ar:**
    Use o painel do **Docker Desktop** para ver o status dos contêineres ou execute no terminal:
    ```powershell
    docker ps
    ```
    Procure pela linha do `ai_service`.

2.  **Envie uma requisição de teste:**
    Você pode usar o `curl` (disponível no PowerShell moderno) ou uma ferramenta gráfica como o [Postman](https://www.postman.com/downloads/).

    **Usando `curl` no PowerShell:**
    ```powershell
    curl -X POST `
    -H "Content-Type: application/json" `
    -Body '{
      "demographics": { "age": 70, "gender": "M" },
      "time_series": {
        "blood_pressure": [{ "systolic": 185, "diastolic": 95 }]
      },
      "reported_symptoms": ["Tontura", "Dor de cabeça"]
    }' `
    http://localhost:5000/predict
    ```
    **Resposta Esperada:** `{"reason":"Análise do modelo de IA indicou risco: Critico.","riskLevel":"Critico"}`