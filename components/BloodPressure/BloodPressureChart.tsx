import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const BloodPressureChart = ({ records }) => {
  // O gráfico precisa de pelo menos 1 ponto para ser renderizado sem erros
  if (records.length < 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Adicione pelo menos 1 registro para ver o gráfico.</Text>
      </View>
    );
  }

  // Prepara os dados para o gráfico, revertendo a ordem para mostrar do mais antigo ao mais novo
  const chartData = {
    labels: records.map(r => new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })).reverse(),
    datasets: [
      {
        data: records.map(r => r.systolic || 0).reverse(),
        color: (opacity = 1) => `rgba(220, 53, 69, ${opacity})`, // Cor vermelha para sistólica
        strokeWidth: 2,
      },
      {
        data: records.map(r => r.diastolic || 0).reverse(),
        color: (opacity = 1) => `rgba(25, 135, 84, ${opacity})`, // Cor verde para diastólica
        strokeWidth: 2,
      },
    ],
    legend: ['Sistólica', 'Diastólica'],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolução da Pressão</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 40} // Largura da tela com uma pequena margem
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#ffa726'
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  }
});

export default BloodPressureChart;