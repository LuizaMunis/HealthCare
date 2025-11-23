import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib
import os

def create_and_save_mock_model():
    """
    Cria um modelo de classificação simples com dados de exemplo e o salva em um arquivo .pkl.
    """
    print("Iniciando a criação do modelo de simulação...")

    # 1. Criar dados de treinamento falsos (simulando o que o modelo aprenderia)
    # As 'features' (características) devem ser as mesmas que vamos extrair dos dados JSON
    data = {
        'age': [25, 65, 45, 70, 35, 80],
        'avg_systolic': [120, 145, 130, 185, 125, 160],
        'symptom_count': [0, 2, 1, 3, 0, 2]
    }
    features_df = pd.DataFrame(data)

    # Os 'labels' (rótulos) são os resultados que queremos prever
    labels = ['Normal', 'Atencao', 'Normal', 'Critico', 'Normal', 'Critico']

    # 2. "Treinar" um modelo simples
    # Usaremos uma Árvore de Decisão, que é fácil de entender
    model = DecisionTreeClassifier()
    model.fit(features_df, labels)
    print("Modelo 'treinado' com dados de simulação.")

    # 3. Salvar o modelo treinado no local correto
    model_dir = 'models'
    model_path = os.path.join(model_dir, 'risk_model_v1.pkl')

    # Garante que o diretório 'models' exista
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    joblib.dump(model, model_path)
    print(f"Modelo salvo com sucesso em: {model_path}")


if __name__ == "__main__":
    create_and_save_mock_model()