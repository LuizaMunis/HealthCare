# Guia de Configuração do Projeto HealthCare no Linux

Este guia detalha o passo a passo para configurar e executar todo o ambiente de desenvolvimento do projeto HealthCare (Backend, Frontend, Banco de Dados e Serviço de IA) usando Docker e Docker Compose em um ambiente Linux (como o Linux Mint).

## Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados na sua máquina.

### Verificando as Ferramentas Instaladas

Abra seu terminal e execute os seguintes comandos para verificar se cada ferramenta está instalada e qual a sua versão:

-   **Git:** Para clonar o projeto.
    ```bash
    git --version
    ```

-   **Docker:** Para criar e gerenciar os contêineres.
    ```bash
    docker --version
    ```

-   **Docker Compose:** Para orquestrar múltiplos contêineres.
    ```bash
    docker-compose --version
    ```

-   **Node.js e NPM:** Para o desenvolvimento local, se necessário.
    ```bash
    node -v
    npm -v
    ```

-   **Python 3 e Pip:** Para configurar o ambiente da IA.
    ```bash
    python3 --version
    pip3 --version
    ```
Se algum comando resultar em "comando não encontrado", você precisará instalar a ferramenta correspondente.

---

## Passo 1: Configurar Permissões do Docker (Recomendado)

Para evitar usar `sudo` em todos os comandos do Docker, adicione seu usuário ao grupo `docker`.

1.  **Adicionar usuário ao grupo:**
    ```bash
    sudo usermod -aG docker ${USER}
    ```

2.  **Aplicar as mudanças:** **Feche o terminal atual e abra um novo**, ou reinicie o computador.

---

## Passo 2: Configuração do Serviço de IA (`HealtCare_AI_Service`)

Esta é a única parte que requer uma configuração manual antes de ser automatizada pelo Docker Compose.

1.  **Navegue até a pasta do serviço de IA:**
    ```bash
    cd HealthCare/HealtCare_AI_Service/
    ```

2.  **Crie e ative um ambiente virtual Python:**
    ```bash
    # Cria a pasta 'venv'
    python3 -m venv venv

    # Ativa o ambiente
    source venv/bin/activate
    ```
    Seu terminal deve agora mostrar `(venv)` no início do prompt.

3.  **Instale as dependências Python:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Crie o modelo de simulação (`.pkl`):**
    Este script cria um modelo de Machine Learning falso para que a aplicação funcione.
    ```bash
    python3 create_mock_model.py
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
    ```bash
    deactivate
    ```

---

## Passo 3: Orquestrar com Docker Compose

O arquivo `docker-compose.yml` na raiz do projeto (`HealthCare/`) irá gerenciar todos os serviços. Certifique-se de que ele está configurado corretamente, especialmente as variáveis de ambiente para comunicação entre os contêineres:

-   `backend` -> `environment.DB_HOST`: `db`
-   `backend` -> `environment.AI_SERVICE_URL`: `http://ai_service:5000/predict`
-   `frontend` -> `environment.EXPO_PUBLIC_API_URL_DEV`: `http://backend:3000`

---

## Passo 4: Executar a Aplicação Completa

1.  **Navegue até a raiz do projeto:**
    ```bash
    # Se você ainda estiver na pasta da IA, volte
    cd ../..
    ```
    Você deve estar em `HealthCare/`.

2.  **Inicie todos os serviços:**
    Este comando irá construir as imagens do frontend, backend e IA, e iniciar todos os 5 contêineres (db, backend, frontend, ai_service, phpmyadmin).

    ```bash
    # Use 'sudo' se você não configurou as permissões no Passo 1
    docker-compose up --build
    ```
    A flag `--build` é importante na primeira vez e sempre que você alterar um `Dockerfile`.

3.  **Para parar todos os serviços:**
    Abra um **novo terminal** na mesma pasta raiz e execute:
    ```bash
    # Use 'sudo' se necessário
    docker-compose down
    ```

---

## Passo 5: Testar o Serviço de IA

Com tudo rodando, você pode testar o endpoint da IA para garantir que ele está funcionando.

1.  **Verifique se o contêiner está no ar:**
    ```bash
    docker ps
    ```
    Procure pela linha do `ai_service`.

2.  **Envie uma requisição de teste com `curl`:**
    ```bash
    curl -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "demographics": { "age": 70, "gender": "M" },
      "time_series": {
        "blood_pressure": [{ "systolic": 185, "diastolic": 95 }]
      },
      "reported_symptoms": ["Tontura", "Dor de cabeça"]
    }' \
    http://localhost:5000/predict
    ```
    **Resposta Esperada:** `{"reason":"Análise do modelo de IA indicou risco: Critico.","riskLevel":"Critico"}`
    