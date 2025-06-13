import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type MeasurementScreenProps = {
  title: string;
  time: string;
  measurementUnit?: string;
  children: React.ReactNode;
};

const MeasurementScreen: React.FC<MeasurementScreenProps> = ({ title, time, measurementUnit, children }) => {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toLocaleDateString('pt-BR'));

  const handleSave = () => {
    Alert.alert('Salvo!', `${title} registrado com sucesso.`);
    // Lógica para salvar os dados viria aqui.
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{time}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* O 'children' é onde os inputs específicos de cada tela serão renderizados */}
          {children}

          <Text style={styles.label}>Data do registro</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} />
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F7' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16425B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#707070',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    color: '#707070',
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  saveButton: {
    backgroundColor: '#16425B',
    margin: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MeasurementScreen;
