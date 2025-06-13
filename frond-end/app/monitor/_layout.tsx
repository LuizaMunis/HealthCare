import { Stack } from 'expo-router';
import React from 'react';

// Este componente de layout define o comportamento de todas as telas
// dentro do diretório /monitor.
export default function MonitorLayout() {
  return (
    <Stack
      screenOptions={{
        // Aplica estas opções a todas as telas do grupo
        headerShown: false,
        // Define a animação padrão para todas as telas como um slide de baixo para cima
        animation: 'slide_from_bottom',
        // Controla a velocidade da animação em milissegundos (ex: 300ms)
        animationDuration: 300,
      }}>
      
      {/* As telas agora herdam as opções do screenOptions, então não precisam mais da opção individual.
          Isso deixa o código mais limpo. */}
      <Stack.Screen name="heart" />
      <Stack.Screen name="glucose" />
      <Stack.Screen name="temperature" />
      <Stack.Screen name="pressure" />
      
    </Stack>
  );
}
