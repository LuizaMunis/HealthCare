import os
import joblib # Usado para carregar o modelo .pkl do scikit-learn
import pandas as pd
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# --- INICIALIZAÇÃO DA APLICAÇÃO FLASK ---
app = Flask(__name__)

# --- CARREGAMENTO DO MODELO DE MACHINE LEARNING ---
# O modelo é carregado UMA VEZ quando o serviço inicia, não a cada requisição.
model_path = os.getenv("MODEL_PATH")
model = None

try:
    # Tenta carregar o modelo pré-treinado
    model = joblib.load(model_path)
    print(f"Modelo '{model_path}' carregado com sucesso.")
except FileNotFoundError:
    print(f"AVISO: Modelo em '{model_path}' não encontrado. A IA usará um sistema de regras simples.")
except Exception as e:
    print(f"ERRO ao carregar o modelo: {e}")


# --- FUNÇÃO DE LÓGICA / PREDIÇÃO ---
# Esta função contém a lógica para analisar os dados.
# No início, pode ser baseada em regras. Depois, pode usar o modelo de ML.
def analyze_health_data(data):
    """
    Analisa os dados de saúde recebidos.
    Se um modelo de ML estiver carregado, ele será usado.
    Caso contrário, fallback para um sistema de regras simples.
    """
    # Exemplo de sistema de regras simples (fallback se o modelo não carregar)
    if model is None:
        print("Usando sistema de regras de fallback.")
        symptoms = data.get('reported_symptoms', [])
        pressures = data.get('time_series', {}).get('blood_pressure', [])
        
        # Regra 1: Risco de crise hipertensiva
        for p in pressures:
            if p.get('systolic', 0) >= 180 or p.get('diastolic', 0) >= 120:
                return {"riskLevel": "Critico", "reason": "Pressão arterial perigosamente alta detectada."}

        # Regra 2: Combinação de pressão alta e sintomas
        is_high_pressure = any(p.get('systolic', 0) >= 140 for p in pressures)
        has_warning_symptoms = any(s in ['Dor de cabeça', 'Tontura'] for s in symptoms)

        if is_high_pressure and has_warning_symptoms:
            return {"riskLevel": "Atencao", "reason": "Pressão alta combinada com sintomas como dor de cabeça ou tontura."}
            
        return {"riskLevel": "Normal", "reason": "Nenhum risco imediato detectado pelas regras."

    # Se o modelo de ML estiver carregado, use-o (LÓGICA REAL)
    print("Usando modelo de Machine Learning para predição.")
    # 1. Pré-processar os dados de entrada para o formato que o modelo espera (ex: um DataFrame do Pandas)
    # Esta parte é altamente dependente de como seu modelo foi treinado.
    # Exemplo simplificado:
    features = pd.DataFrame([{
        'age': data.get('demographics', {}).get('age', 0),
        'avg_systolic': pd.Series([p.get('systolic', 0) for p in data.get('time_series', {}).get('blood_pressure', [])]).mean(),
        'symptom_count': len(data.get('reported_symptoms', []))
    }])
    
    # 2. Fazer a predição
    prediction = model.predict(features) # Ex: predict() pode retornar ['Normal'], ['Atencao']
    risk_level = prediction[0]
    
    return {"riskLevel": risk_level, "reason": f"Análise do modelo de IA indicou risco: {risk_level}."}


# --- ENDPOINT DA API ---
# O backend Node.js chamará este endpoint.
@app.route("/predict", methods=["POST"])
def predict():
    """
    Recebe dados de saúde em formato JSON, analisa e retorna um nível de risco.
    """
    # Valida se o request tem dados JSON
    if not request.json:
        return jsonify({"error": "Requisição inválida. Nenhum dado JSON encontrado."}), 400

    health_data = request.json
    print(f"Recebidos dados para análise: {health_data}")

    try:
        # Chama a função de análise
        analysis_result = analyze_health_data(health_data)
        return jsonify(analysis_result), 200
    except Exception as e:
        print(f"ERRO ao processar a requisição: {e}")
        return jsonify({"error": "Ocorreu um erro interno no servidor de IA."}), 500


# --- PONTO DE ENTRADA PARA RODAR O SERVIDOR ---
if __name__ == "__main__":
    # Roda o servidor de desenvolvimento do Flask.
    # Em produção, usaremos o Gunicorn.
    app.run(host="0.0.0.0", port=5000)