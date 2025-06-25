// HealthCare_Frontend/src/models/UserModel.js

export class UserModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.createdAt = data.created_at || null;
  }

  // Validações
  static validateName(name) {
    if (!name || name.trim().length < 2) {
      return 'Nome deve ter pelo menos 2 caracteres';
    }
    return null;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return 'Email inválido';
    }
    return null;
  }

  static validatePassword(password) {
    if (!password || password.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    return null;
  }

  // Métodos de instância
  getDisplayName() {
    return this.name || 'Usuário';
  }

  getInitials() {
    return this.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
    };
  }

  static fromJSON(json) {
    return new UserModel(json);
  }
}

export default UserModel;