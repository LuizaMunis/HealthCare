import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DeleteConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({ visible, onCancel, onConfirm }: DeleteConfirmModalProps) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
          <Text style={styles.modalText}>
            Tem certeza que deseja excluir o registro?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButtonNo} onPress={onCancel}>
              <Text style={styles.modalButtonTextNo}>Não</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonYes} onPress={onConfirm}>
              <Text style={styles.modalButtonTextYes}>Sim</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButtonNo: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  modalButtonTextNo: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonYes: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  modalButtonTextYes: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DeleteConfirmModal;