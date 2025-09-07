// HealthCare_Backend/src/services/perfilService.js

const PerfilModel = require('../models/perfilModel');
const UserModel = require('../models/userModel');

class PerfilService {
  /**
   * Cria ou atualiza o perfil de um usuário
   * @param {number} usuario_id - ID do usuário
   * @param {Object} dadosAdicionais - Dados adicionais do perfil
   * @returns {Object} Perfil criado/atualizado
   */
  static async savePerfil(usuario_id, dadosAdicionais) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Verificar se o usuário existe
    const user = await UserModel.findById(usuario_id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Validar dados adicionais
    if (!dadosAdicionais || typeof dadosAdicionais !== 'object') {
      throw new Error('Dados adicionais são obrigatórios e devem ser um objeto');
    }

    // Usar o método createOrUpdate que lida com criação e atualização
    const perfil = await PerfilModel.createOrUpdate(usuario_id, dadosAdicionais);

    return {
      id: perfil.id,
      usuario_id: perfil.usuario_id,
      cpf: perfil.cpf,
      celular: perfil.celular,
      data_nascimento: perfil.data_nascimento,
      genero: perfil.genero,
      peso: perfil.peso,
      altura: perfil.altura
    };
  }

  /**
   * Busca o perfil de um usuário
   * @param {number} usuario_id - ID do usuário
   * @returns {Object} Perfil do usuário
   */
  static async getPerfil(usuario_id) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Verificar se o usuário existe
    const user = await UserModel.findById(usuario_id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const perfil = await PerfilModel.findByUserId(usuario_id);
    
    if (!perfil) {
      return {
        usuario_id,
        cpf: null,
        celular: null,
        data_nascimento: null,
        genero: null,
        peso: null,
        altura: null,
        perfil_completo: false
      };
    }

    return {
      id: perfil.id,
      usuario_id: perfil.usuario_id,
      cpf: perfil.cpf,
      celular: perfil.celular,
      data_nascimento: perfil.data_nascimento,
      genero: perfil.genero,
      peso: perfil.peso,
      altura: perfil.altura,
      perfil_completo: true
    };
  }

  /**
   * Atualiza dados específicos do perfil
   * @param {number} usuario_id - ID do usuário
   * @param {Object} dadosAtualizacao - Dados para atualização
   * @returns {Object} Perfil atualizado
   */
  static async updatePerfil(usuario_id, dadosAtualizacao) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!dadosAtualizacao || typeof dadosAtualizacao !== 'object') {
      throw new Error('Dados de atualização são obrigatórios e devem ser um objeto');
    }

    // Atualizar perfil usando createOrUpdate (mescla automaticamente)
    const perfilAtualizado = await PerfilModel.createOrUpdate(usuario_id, dadosAtualizacao);

    return {
      id: perfilAtualizado.id,
      usuario_id: perfilAtualizado.usuario_id,
      cpf: perfilAtualizado.cpf,
      celular: perfilAtualizado.celular,
      data_nascimento: perfilAtualizado.data_nascimento,
      genero: perfilAtualizado.genero,
      peso: perfilAtualizado.peso,
      altura: perfilAtualizado.altura
    };
  }

  /**
   * Deleta o perfil de um usuário
   * @param {number} usuario_id - ID do usuário
   * @returns {boolean} True se deletado com sucesso
   */
  static async deletePerfil(usuario_id) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    const perfil = await PerfilModel.findByUserId(usuario_id);
    
    if (!perfil) {
      throw new Error('Perfil não encontrado');
    }

    const deleted = await PerfilModel.delete(perfil.id);
    
    if (!deleted) {
      throw new Error('Erro ao deletar perfil');
    }

    return true;
  }

  /**
   * Verifica se um perfil está completo
   * @param {number} usuario_id - ID do usuário
   * @returns {Object} Status do perfil
   */
  static async verificarCompletudePerfil(usuario_id) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    const perfil = await PerfilModel.findByUserId(usuario_id);
    
    if (!perfil) {
      return {
        perfil_completo: false,
        campos_faltantes: ['cpf', 'celular', 'data_nascimento', 'genero', 'peso', 'altura'],
        percentual_completo: 0
      };
    }

    // Usar os dados diretos do perfil
    const dadosAdicionais = {
      cpf: perfil.cpf,
      celular: perfil.celular,
      data_nascimento: perfil.data_nascimento,
      genero: perfil.genero,
      peso: perfil.peso,
      altura: perfil.altura
    };
    
    // Definir campos obrigatórios para perfil completo
    const camposObrigatorios = [
      'cpf',
      'celular',
      'data_nascimento',
      'genero',
      'peso',
      'altura'
    ];

    const camposFaltantes = camposObrigatorios.filter(campo => 
      !dadosAdicionais[campo] || dadosAdicionais[campo] === ''
    );

    const percentualCompleto = Math.round(
      ((camposObrigatorios.length - camposFaltantes.length) / camposObrigatorios.length) * 100
    );

    return {
      perfil_completo: camposFaltantes.length === 0,
      campos_faltantes: camposFaltantes,
      percentual_completo: percentualCompleto,
      dados_atual: dadosAdicionais
    };
  }

  /**
   * Busca estatísticas do perfil
   * @param {number} usuario_id - ID do usuário
   * @returns {Object} Estatísticas do perfil
   */
  static async getEstatisticasPerfil(usuario_id) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    const perfil = await PerfilModel.findByUserId(usuario_id);
    
    if (!perfil) {
      return {
        total_usuarios_com_perfil: 0,
        percentual_completude: 0,
        dados_estatisticos: {}
      };
    }

    // Usar os dados diretos do perfil
    const dadosAdicionais = {
      cpf: perfil.cpf,
      celular: perfil.celular,
      data_nascimento: perfil.data_nascimento,
      genero: perfil.genero,
      peso: perfil.peso,
      altura: perfil.altura
    };
    
    // Calcular IMC se peso e altura estiverem disponíveis
    let imc = null;
    if (dadosAdicionais.peso && dadosAdicionais.altura) {
      const alturaMetros = dadosAdicionais.altura / 100; // Converter cm para metros
      imc = dadosAdicionais.peso / (alturaMetros * alturaMetros);
    }

    // Classificação do IMC
    let classificacaoIMC = null;
    if (imc) {
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
        cpf: dadosAdicionais.cpf || null,
        celular: dadosAdicionais.celular || null,
        data_nascimento: dadosAdicionais.data_nascimento || null,
        peso: dadosAdicionais.peso || null,
        altura: dadosAdicionais.altura || null,
        genero: dadosAdicionais.genero || null
      },
      calculos_medicos: {
        imc: imc ? Math.round(imc * 10) / 10 : null,
        classificacao_imc: classificacaoIMC
      }
    };
  }
}

module.exports = PerfilService;
