import joblib
import pandas as pd
import numpy as np # Usado para cálculos de média

# --- CARREGAMENTO DO MODELO ---
def load_model(path):
    """
    Carrega o modelo de Machine Learning do caminho especificado.
    Retorna o modelo carregado ou None se não for encontrado.
    """
    try:
        model = joblib.load(path)
        print(f"Modelo '{path}' carregado com sucesso pela camada de serviço.")
        return model
    except FileNotFoundError:
        print(f"AVISO: Modelo em '{path}' não encontrado. A IA usará um sistema de regras simples.")
        return None
    except Exception as e:
        print(f"ERRO ao carregar o modelo: {e}")
        return None

# --- PRÉ-PROCESSAMENTO E LÓGICA DE PREDIÇÃO ---
def preprocess_data_for_model(data):
    """
    Transforma o JSON bruto em um DataFrame do Pandas que o modelo entende.
    """
    # Extrai os dados, com valores padrão para evitar erros se as chaves não existirem
    age = data.get('demographics', {}).get('age', 0)
    symptoms = data.get('reported_symptoms', [])
    blood_pressure_data = data.get('time_series', {}).get('blood_pressure', [])

    # Calcula a média da pressão sistólica. np.nanmean ignora valores nulos.
    systolic_values = [p.get('systolic') for p in blood_pressure_data if p.get('systolic') is not None]
    avg_systolic = np.mean(systolic_values) if systolic_values else 0

    # Cria o DataFrame com as mesmas colunas usadas no treinamento do modelo
    features = pd.DataFrame([{
        'age': age,
        'avg_systolic': avg_systolic,
        'symptom_count': len(symptoms)
    }])
    
    return features

def analyze_health_data(data, model):
    """
    Analisa os dados de saúde. Usa o modelo de ML se disponível,
    caso contrário, usa um sistema de regras.
    """
    # Se o modelo não foi carregado, usa regras simples como fallback
    if model is None:
        print("Usando sistema de regras de fallback no serviço.")
        pressures = data.get('time_series', {}).get('blood_pressure', [])
        for p in pressures:
            if p.get('systolic', 0) >= 180 or p.get('diastolic', 0) >= 120:
                return {"riskLevel": "Critico", "reason": "Pressão arterial perigosamente alta detectada."}
        return {"riskLevel": "Normal", "reason": "Nenhum risco imediato detectado (modelo indisponível)."}

    # Se o modelo existe, usa-o para predição
    print("Usando modelo de Machine Learning para predição no serviço.")
    
    # 1. Pré-processa os dados brutos
    processed_features = preprocess_data_for_model(data)
    
    # 2. Faz a predição
    prediction = model.predict(processed_features)
    risk_level = prediction[0] # O resultado é uma lista, pegamos o primeiro item
    
    # 3. Retorna o resultado formatado
    return {"riskLevel": risk_level, "reason": f"Análise do modelo de IA indicou risco: {risk_level}."}