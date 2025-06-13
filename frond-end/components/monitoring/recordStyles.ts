import { StyleSheet } from 'react-native';

/**
 * Este arquivo centraliza os estilos compartilhados para todos os componentes
 * de input da funcionalidade de registros (Coração, Glicemia, etc.).
 */
export const recordInputStyles = StyleSheet.create({
  // Estilo para o rótulo acima de cada card (ex: "Pulsação")
  label: {
    fontSize: 16,
    color: '#707070',
    marginBottom: 8,
  },
  // Estilo base para os cards de input
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  // Estilo para cards com destaque (fundo azul claro)
  highlightCard: {
    backgroundColor: '#AFD7E2',
    borderColor: '#81C4D7',
  },
  // Container para o valor principal e sua unidade
  mainValueContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  // Estilo do valor principal, em destaque
  mainValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#16425B',
  },
  // Estilo para a unidade de medida (ex: bpm, mg/dL)
  unit: {
    fontSize: 18,
    color: '#3B7CA6',
    fontWeight: '600',
  },
  // Estilo para os valores secundários (números acima e abaixo no input de pulsação)
  secondaryValue: {
    fontSize: 24,
    color: '#A4A4A4',
  },
  // Estilo para os cards de input da tela de pressão arterial
  pressureInputCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 15,
  },
  pressureValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#16425B',
  },
  pressureUnit: {
    fontSize: 16,
    color: '#3B7CA6',
    fontWeight: '600',
  },
});
