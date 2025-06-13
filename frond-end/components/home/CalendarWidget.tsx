import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Componente funcional que exibe a semana atual.
 * Permite que o usuário selecione um dia, que fica destacado.
 * @param {object} props - Propriedades do componente.
 * @param {object} props.themeColors - Objeto contendo as cores do tema atual (claro/escuro).
 */
export default function CalendarWidget({ themeColors }) {
  // Estado para controlar qual data está selecionada. Inicia com a data de hoje.
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  
  // Formata o nome do mês para exibição (ex: "Junho").
  const monthName = selectedDate.toLocaleString('pt-BR', { month: 'long' });

  // Lógica para gerar os 7 dias da semana atual, começando no Domingo.
  const generateWeek = () => {
    const today = new Date();
    // Clona a data de hoje para não modificar a original.
    const dateToCalculate = new Date(today);
    // Calcula o Domingo da semana atual.
    const startOfWeek = new Date(dateToCalculate.setDate(dateToCalculate.getDate() - today.getDay()));
    
    const weekDays = [];
    const weekdaysShort = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        day: day.getDate().toString(), // O número do dia
        weekday: weekdaysShort[i],     // A letra do dia da semana
        date: day,                     // O objeto Date completo
        active: day.toDateString() === selectedDate.toDateString(), // Verifica se este é o dia selecionado
      });
    }
    return weekDays;
  };
  
  const days = generateWeek();

  return (
    <View style={styles.calendarContainer}>
      <Text style={[styles.calendarMonth, { color: themeColors.textSecondary }]}>
        {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
      </Text>
      <View style={styles.calendarDays}>
        {days.map((item, index) => (
          <View key={index} style={styles.dayContainer}>
            <Text style={[styles.dayWeekday, { color: themeColors.textSecondary }]}>{item.weekday}</Text>
            <TouchableOpacity 
              style={[
                styles.dayNumberContainer,
                // Aplica a cor de destaque se o dia estiver ativo
                item.active ? { backgroundColor: themeColors.accent } : null
              ]}
              // Atualiza o dia selecionado ao tocar
              onPress={() => setSelectedDate(item.date)}
            >
              <Text style={[
                styles.dayNumber,
                // Aplica a cor primária ao texto se o dia estiver ativo
                item.active ? { color: themeColors.primary } : { color: themeColors.text }
              ]}>{item.day}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

// Estilos específicos do componente de calendário
const styles = StyleSheet.create({
  calendarContainer: {
    marginBottom: 20,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dayWeekday: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
