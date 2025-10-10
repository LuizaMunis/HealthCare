// src/hooks/useFormValidation.ts
import { useState, useMemo, useCallback } from 'react';

// Define a estrutura de uma regra de validação
interface ValidationRule {
  validate: (value: string, allValues?: any) => boolean;
  message: string;
}

// Define o objeto de configuração de validação
interface ValidationConfig {
  [key: string]: ValidationRule;
}

export function useFormValidation(initialState: any, config: ValidationConfig) {
  const [values, setValues] = useState(initialState);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const handleChange = (field: string, formatter?: (text: string) => string) => (text: string) => {
    const formattedText = formatter ? formatter(text) : text;
    setValues((prev: any) => ({ ...prev, [field]: formattedText }));
  };

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const setAllTouched = useCallback(() => {
    // Cria um novo objeto onde todas as chaves (campos do formulário) são marcadas como 'true'
    const allFieldsTouched = Object.keys(initialState).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    setTouched(allFieldsTouched);
  }, [initialState]);

  const errors = useMemo(() => {
    return Object.keys(config).reduce((acc, field) => {
      const rule = config[field];
      if (!rule.validate(values[field], values)) {
        acc[field] = rule.message;
      }
      return acc;
    }, {} as {[key: string]: string});
  }, [values, config]);

  const isFormValid = Object.keys(errors).length === 0;

  return {
    values,
    touched,
    errors,
    isFormValid,
    handleChange,
    handleBlur,
    setValues,
    setAllTouched
  };
}