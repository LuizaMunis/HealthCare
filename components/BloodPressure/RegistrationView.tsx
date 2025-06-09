import React from 'react';
import RegistrationForm from './RegistrationForm';

// Este componente também é para apresentação e recebe todos os estados e funções necessários para o formulário.
const RegistrationView = ({
  isEditing,
  formState,
  onFormChange,
  onSave,
  onCancelEdit,
}) => {
  return (
    <RegistrationForm
      isEditing={isEditing}
      formState={formState}
      onFormChange={onFormChange}
      onSave={onSave}
      onCancelEdit={onCancelEdit}
    />
  );
};

export default RegistrationView;