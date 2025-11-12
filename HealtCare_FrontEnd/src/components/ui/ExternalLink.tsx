/**
 * @file Componente para renderizar um link que abre URLs externas.
 * No celular (iOS/Android), ele abre o link em um navegador interno do app (in-app browser)
 * para uma melhor experiência do usuário, em vez de fechar o app.
 * Na web, funciona como um link padrão que abre uma nova aba.
 */

import { Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

// Define os tipos das props, omitindo 'href' do Link padrão e adicionando o nosso.
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank" // Garante que o link abra em uma nova aba na web.
      {...rest}
      href={href}
      onPress={async (event) => {
        // Verifica se o código está rodando em um dispositivo móvel (não na web).
        if (Platform.OS !== 'web') {
          // Previne o comportamento padrão do link, que seria abrir o navegador do sistema.
          event.preventDefault();
          // Usa a API do Expo para abrir a URL em um navegador dentro do app.
          await openBrowserAsync(href);
        }
      }}
    />
  );
}