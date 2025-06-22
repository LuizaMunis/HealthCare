//HealthCare_FrontEnd/src/app/+not-found.tsx

import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/src/components/ui/ThemedText';
import { ThemedView } from '@/src/components/ui/ThemedView';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen does not exist.</ThemedText>
        <ThemedText
          type="link"
          style={styles.link}
          onPress={() => router.replace('/')}
        >
          Go to home screen!
        </ThemedText>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
