# HealthCare AI Service 🧠

## Visão Geral

Este é um microserviço dedicado à análise de dados de saúde e predição de riscos para a aplicação **HealthCare**. Sua principal responsabilidade é receber dados de saúde **anônimos**, processá-los através de um modelo de Machine Learning (ou um sistema de regras) e retornar uma avaliação de risco.

Este serviço é construído com Python, usando o framework Flask para a API e Scikit-learn para o processamento de Machine Learning. Ele foi projetado para ser executado de forma independente e se comunicar com o backend principal da aplicação.

---

## Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados:
- [Python](https://www.python.org/downloads/) (versão 3.10 ou superior)
- [Pip](https://pip.pypa.io/en/stable/installation/) (gerenciador de pacotes do Python)
- [Docker](https://www.docker.com/products/docker-desktop/) (recomendado para implantação em produção)

---

## ⚙️ Configuração e Instalação Local

Siga estes passos para configurar e rodar o serviço em seu ambiente de desenvolvimento.

**1. Navegue até o diretório do serviço:**
```bash
cd HealtCare_AI_Service
````

**2. Crie e ative um ambiente virtual:**
É uma boa prática isolar as dependências do projeto.

```bash
# Criar o ambiente
python -m venv venv

# Ativar no Linux ou macOS
source venv/bin/activate

# Ativar no Windows
.\venv\Scripts\activate
```

**3. Instale as dependências:**

```bash
pip install -r requirements.txt
```

**4. Configure as Variáveis de Ambiente:**
Crie um arquivo chamado `.env` na raiz deste diretório (`HealtCare_AI_Service/`). Copie o conteúdo abaixo e cole no arquivo:

```ini
# Configurações do Flask
FLASK_APP=app.py
FLASK_ENV=development

# Caminho para o modelo de Machine Learning
MODEL_PATH=models/risk_model_v1.pkl
```

**5. Modelo de Machine Learning:**
Certifique-se de que um modelo treinado (por exemplo, `risk_model_v1.pkl`) esteja presente na pasta `/models`. Se o modelo não for encontrado, a API usará um sistema de regras de fallback.

-----

## ▶️ Executando o Serviço

Com o ambiente virtual ativado, você pode iniciar o servidor:

**Para Desenvolvimento:**
Use o servidor de desenvolvimento do Flask, que recarrega automaticamente após mudanças no código.

```bash
flask run
```

O serviço estará disponível em `http://localhost:5000`.

**Para Produção (Localmente):**
Use o Gunicorn, que é um servidor WSGI mais robusto e adequado para produção.

```bash
gunicorn --bind 0.0.0.0:5000 app:app
```

-----

## 🐳 Executando com Docker

Containerizar a aplicação é a forma recomendada para implantação.

**1. Construa a imagem Docker:**
Na raiz do diretório `HealtCare_AI_Service/`, execute:

```bash
docker build -t healthcare-ai-service .
```

**2. Execute o contêiner Docker:**
Este comando irá iniciar o contêiner em segundo plano (`-d`), mapear a porta `5000` e carregar as variáveis do seu arquivo `.env`.

```bash
docker run -d -p 5000:5000 --env-file .env --name ai-service healthcare-ai-service
```

  - Para ver os logs: `docker logs ai-service`
  - Para parar o contêiner: `docker stop ai-service`

-----

## 📄 API - Documentação do Endpoint

O serviço expõe um único endpoint para análise de dados.

### `POST /predict`

Este endpoint analisa um conjunto de dados de saúde e retorna uma avaliação de risco.

**Corpo da Requisição (`Request Body`):**
O corpo da requisição deve ser um JSON com a seguinte estrutura:

```json
{
  "demographics": {
    "age": 45,
    "gender": "M"
  },
  "time_series": {
    "blood_pressure": [
      { "systolic": 142, "diastolic": 91 },
      { "systolic": 138, "diastolic": 88 }
    ],
    "glucose": [ 110, 105, 112 ],
    "temperature": [ 36.8, 37.1 ]
  },
  "reported_symptoms": [
    "Dor de cabeça",
    "Tontura"
  ]
}
```

**Resposta de Sucesso (`200 OK`):**
A resposta será um JSON contendo o nível de risco e a justificativa.

```json
{
  "riskLevel": "Atencao",
  "reason": "Pressão alta combinada com sintomas como dor de cabeça ou tontura."
}
```

  * `riskLevel` pode ser: `Normal`, `Atencao`, `Elevado`, `Critico`.

**Resposta de Erro (`400` ou `500`):**
Se ocorrer um erro (ex: JSON malformado ou erro interno), a resposta será:

```json
{
  "error": "Descrição do erro."
}
```

```
```