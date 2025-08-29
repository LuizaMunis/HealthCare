import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements = [
    {
      label: 'Pelo menos 6 caracteres',
      met: password.length >= 6,
    },
    {
      label: 'Pelo menos uma letra maiúscula',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Pelo menos uma letra minúscula',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Pelo menos um número',
      met: /\d/.test(password),
    },
    {
      label: 'Pelo menos um caractere especial',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const metRequirements = requirements.filter(req => req.met).length;
  const strength = metRequirements < 3 ? 'fraca' : metRequirements < 5 ? 'média' : 'forte';

  const getStrengthColor = () => {
    switch (strength) {
      case 'fraca': return '#ff6b6b';
      case 'média': return '#ffa726';
      case 'forte': return '#66bb6a';
      default: return '#ccc';
    }
  };

  const getStrengthIcon = () => {
    switch (strength) {
      case 'fraca': return 'alert-circle';
      case 'média': return 'alert-triangle';
      case 'forte': return 'check-circle';
      default: return 'circle';
    }
  };

  if (!password) return null;

  return (
    <View style={styles.container}>
      <View style={styles.strengthBar}>
        <View style={[styles.strengthFill, { 
          width: `${(metRequirements / requirements.length) * 100}%`,
          backgroundColor: getStrengthColor()
        }]} />
      </View>
      
      <View style={styles.strengthInfo}>
        <Feather name={getStrengthIcon()} size={16} color={getStrengthColor()} />
        <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
          Senha {strength}
        </Text>
      </View>

      <View style={styles.requirements}>
        {requirements.map((req, index) => (
          <View key={index} style={styles.requirement}>
            <Feather 
              name={req.met ? 'check' : 'x'} 
              size={14} 
              color={req.met ? '#66bb6a' : '#ff6b6b'} 
            />
            <Text style={[styles.requirementText, { 
              color: req.met ? '#66bb6a' : '#ff6b6b' 
            }]}>
              {req.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requirements: {
    marginTop: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 6,
  },
  requirementText: {
    fontSize: 12,
  },
});
