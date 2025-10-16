// HealthCare_Backend/src/services/perfilService.js

const PerfilModel = require('../models/perfilModel');

class PerfilService {

  static async createPerfil(usuario_id, profileData) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }
    if (!profileData || typeof profileData !== 'object' || !profileData.nome_perfil) {
      throw new Error('Dados do perfil, incluindo nome_perfil, são obrigatórios');
    }

    const dataToSave = {
      ...profileData,
      usuario_id: usuario_id,
      cpf: profileData.cpf ? String(profileData.cpf).replace(/\D/g, '') : null,
      celular: profileData.celular ? String(profileData.celular).replace(/\D/g, '') : null,
    };

    const newProfile = await PerfilModel.create(dataToSave);
    return newProfile;
  }

  static async updatePerfil(userId, profileId, updateData) {
    const perfil = await this._verifyProfileOwnership(userId, profileId);

    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Dados de atualização são obrigatórios');
    }
    
    const dataToUpdate = {
      ...updateData,
      cpf: updateData.cpf ? String(updateData.cpf).replace(/\D/g, '') : perfil.cpf,
      celular: updateData.celular ? String(updateData.celular).replace(/\D/g, '') : perfil.celular,
    };

    await PerfilModel.update(profileId, dataToUpdate);
    return await PerfilModel.findById(profileId);
  }

  static async getPerfilById(userId, profileId) {
    const perfil = await this._verifyProfileOwnership(userId, profileId);
    return perfil;
  }

  static async getAllPerfisByUserId(usuario_id) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }
    return await PerfilModel.findByUserId(usuario_id);
  }

  static async deletePerfil(userId, profileId) {
    await this._verifyProfileOwnership(userId, profileId);
    const deleted = await PerfilModel.delete(profileId);
    if (!deleted) {
      throw new Error('Erro ao deletar perfil');
    }
    return true;
  }

  static async verificarCompletudePerfil(userId, profileId) {
    const perfil = await this._verifyProfileOwnership(userId, profileId);

    const camposObrigatorios = ['cpf', 'celular', 'data_nascimento', 'genero', 'peso', 'altura'];
    const camposFaltantes = camposObrigatorios.filter(campo => !perfil[campo] || perfil[campo] === '');
    const percentualCompleto = Math.round(((camposObrigatorios.length - camposFaltantes.length) / camposObrigatorios.length) * 100);

    return {
      perfil_completo: camposFaltantes.length === 0,
      campos_faltantes: camposFaltantes,
      percentual_completo: percentualCompleto,
    };
  }

  static async getEstatisticasPerfil(userId, profileId) {
    const perfil = await this._verifyProfileOwnership(userId, profileId);

    let imc = null;
    let classificacaoIMC = null;

    if (perfil.peso && perfil.altura) {
      const alturaMetros = perfil.altura / 100;
      imc = perfil.peso / (alturaMetros * alturaMetros);
      
      if (imc < 18.5) {
        classificacaoIMC = 'Abaixo do peso';
      } else if (imc < 25) {
        classificacaoIMC = 'Peso normal';
      } else if (imc < 30) {
        classificacaoIMC = 'Sobrepeso';
      } else {
        classificacaoIMC = 'Obesidade';
      }
    }

    return {
      dados_basicos: {
        cpf: perfil.cpf || null,
        celular: perfil.celular || null,
        data_nascimento: perfil.data_nascimento || null,
        peso: perfil.peso || null,
        altura: perfil.altura || null,
        genero: perfil.genero || null
      },
      calculos_medicos: {
        imc: imc ? Math.round(imc * 10) / 10 : null,
        classificacao_imc: classificacaoIMC
      }
    };
  }
  
  static async _verifyProfileOwnership(userId, profileId) {
    if (!profileId || !userId) {
      throw new Error('ID do usuário e do perfil são obrigatórios');
    }
    
    const perfil = await PerfilModel.findById(profileId);
    
    if (!perfil) {
      throw new Error('Perfil não encontrado');
    }

    if (perfil.usuario_id !== userId) {
      throw new Error('Acesso não autorizado a este perfil');
    }

    return perfil;
  }
}

module.exports = PerfilService;