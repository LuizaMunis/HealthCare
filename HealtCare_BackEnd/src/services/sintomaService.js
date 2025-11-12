// backend/src/services/sintomaService.js
const SintomaModel = require('../models/sintomaModel');
const DoencaModel = require('../models/doencaModel');

class SintomaService {
  static async createSintoma(usuarioId, profileId, doencaId, sintomaData) {
    try {
      // Verificar se a doença pertence ao perfil do usuário
      const doenca = await DoencaModel.findById(doencaId);
      if (!doenca || doenca.perfil_id !== parseInt(profileId)) {
        throw new Error('Doença não encontrada ou não pertence ao perfil');
      }

      // Validar dados obrigatórios
      const { descricao_sintoma, intensidade, data_hora_inicio } = sintomaData;
      
      if (!descricao_sintoma || descricao_sintoma.trim().length === 0) {
        throw new Error('Descrição do sintoma é obrigatória');
      }

      if (descricao_sintoma.trim().length > 45) {
        throw new Error('Descrição do sintoma deve ter no máximo 45 caracteres');
      }

      if (!intensidade || !['Leve', 'Moderada', 'Intensa'].includes(intensidade)) {
        throw new Error('Intensidade deve ser Leve, Moderada ou Intensa');
      }

      if (!data_hora_inicio) {
        throw new Error('Data e hora de início são obrigatórias');
      }

      // Criar dados para inserção
      const dadosSintoma = {
        doenca_id: parseInt(doencaId),
        descricao_sintoma: descricao_sintoma.trim(),
        intensidade,
        data_hora_inicio: new Date(data_hora_inicio)
      };

      const novoSintoma = await SintomaModel.create(dadosSintoma);
      return novoSintoma;
    } catch (error) {
      console.error('Erro no SintomaService.createSintoma:', error);
      throw error;
    }
  }

  static async getAllSintomasByProfile(usuarioId, profileId) {
    try {
      // Buscar todas as doenças do perfil
      const doencas = await DoencaModel.findByProfileId(profileId);
      const doencaIds = doencas.map(doenca => doenca.id);

      if (doencaIds.length === 0) {
        return [];
      }

      // Buscar todos os sintomas das doenças do perfil
      const sintomas = await SintomaModel.findByDoencaIds(doencaIds);
      
      // Adicionar informações da doença a cada sintoma
      const sintomasComDoenca = sintomas.map(sintoma => {
        const doenca = doencas.find(d => d.id === sintoma.doenca_id);
        return {
          ...sintoma,
          doenca_nome: doenca ? doenca.nome_doenca : 'Doença não encontrada'
        };
      });

      // Ordenar por data mais recente
      sintomasComDoenca.sort((a, b) => 
        new Date(b.data_hora_inicio) - new Date(a.data_hora_inicio)
      );

      return sintomasComDoenca;
    } catch (error) {
      console.error('Erro no SintomaService.getAllSintomasByProfile:', error);
      throw error;
    }
  }

  static async getSintomaById(usuarioId, profileId, sintomaId) {
    try {
      const sintoma = await SintomaModel.findById(sintomaId);
      if (!sintoma) {
        return null;
      }

      // Verificar se a doença do sintoma pertence ao perfil
      const doenca = await DoencaModel.findById(sintoma.doenca_id);
      if (!doenca || doenca.perfil_id !== parseInt(profileId)) {
        return null;
      }

      return {
        ...sintoma,
        doenca_nome: doenca.nome_doenca
      };
    } catch (error) {
      console.error('Erro no SintomaService.getSintomaById:', error);
      throw error;
    }
  }

  static async updateSintoma(usuarioId, profileId, sintomaId, updateData) {
    try {
      // Verificar se o sintoma existe e pertence ao perfil
      const sintomaExistente = await this.getSintomaById(usuarioId, profileId, sintomaId);
      if (!sintomaExistente) {
        return null;
      }

      // Validar dados se fornecidos
      if (updateData.descricao_sintoma !== undefined) {
        if (!updateData.descricao_sintoma || updateData.descricao_sintoma.trim().length === 0) {
          throw new Error('Descrição do sintoma é obrigatória');
        }
        if (updateData.descricao_sintoma.trim().length > 45) {
          throw new Error('Descrição do sintoma deve ter no máximo 45 caracteres');
        }
        updateData.descricao_sintoma = updateData.descricao_sintoma.trim();
      }

      if (updateData.intensidade !== undefined) {
        if (!['Leve', 'Moderada', 'Intensa'].includes(updateData.intensidade)) {
          throw new Error('Intensidade deve ser Leve, Moderada ou Intensa');
        }
      }

      if (updateData.data_hora_inicio !== undefined) {
        updateData.data_hora_inicio = new Date(updateData.data_hora_inicio);
      }

      const atualizado = await SintomaModel.update(sintomaId, updateData);
      if (!atualizado) {
        return null;
      }

      // Retornar sintoma atualizado com informações da doença
      return await this.getSintomaById(usuarioId, profileId, sintomaId);
    } catch (error) {
      console.error('Erro no SintomaService.updateSintoma:', error);
      throw error;
    }
  }

  static async deleteSintoma(usuarioId, profileId, sintomaId) {
    try {
      // Verificar se o sintoma existe e pertence ao perfil
      const sintomaExistente = await this.getSintomaById(usuarioId, profileId, sintomaId);
      if (!sintomaExistente) {
        return false;
      }

      const deletado = await SintomaModel.delete(sintomaId);
      return deletado;
    } catch (error) {
      console.error('Erro no SintomaService.deleteSintoma:', error);
      throw error;
    }
  }

  static async getAllSintomasByDoenca(usuarioId, profileId, doencaId) {
    try {
      // Verificar se a doença pertence ao perfil
      const doenca = await DoencaModel.findById(doencaId);
      if (!doenca || doenca.perfil_id !== parseInt(profileId)) {
        throw new Error('Doença não encontrada ou não pertence ao perfil');
      }

      const sintomas = await SintomaModel.findByDoencaId(doencaId);
      
      // Ordenar por data mais recente
      sintomas.sort((a, b) => 
        new Date(b.data_hora_inicio) - new Date(a.data_hora_inicio)
      );

      return sintomas.map(sintoma => ({
        ...sintoma,
        doenca_nome: doenca.nome_doenca
      }));
    } catch (error) {
      console.error('Erro no SintomaService.getAllSintomasByDoenca:', error);
      throw error;
    }
  }
}

module.exports = SintomaService;
