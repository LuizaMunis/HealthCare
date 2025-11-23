// backend/src/services/sintomaService.js
const SintomaModel = require('../models/sintomaModel');
const DoencaModel = require('../models/doencaModel');
const DoencaService = require('./doencaService');
const ProfileModel = require('../models/profileModel');

class SintomaService {
  /**
   * Verifica se o perfil pertence ao usuário.
   */
  static async _verifyProfileOwnership(usuarioId, perfilId) {
    const perfil = await ProfileModel.findById(perfilId);
    if (!perfil) {
      throw new Error('Perfil não encontrado.');
    }
    if (perfil.usuario_id !== Number(usuarioId)) {
      throw new Error('Acesso não autorizado a este perfil.');
    }
    return perfil;
  }

  static async createSintoma(usuarioId, perfilId, doencaId, sintomaData) {
    try {
      // Verificar se o perfil pertence ao usuário
      await this._verifyProfileOwnership(usuarioId, perfilId);

      // Verificar se a doença pertence ao perfil do usuário
      const doenca = await DoencaModel.findById(doencaId);
      if (!doenca || doenca.perfil_id !== parseInt(perfilId)) {
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

      // Converter data para formato MySQL (YYYY-MM-DD HH:MM:SS)
      let dataHoraFormatada;
      if (typeof data_hora_inicio === 'string') {
        // Se já está em formato ISO (YYYY-MM-DDTHH:MM:SS), converter para MySQL
        dataHoraFormatada = data_hora_inicio.replace('T', ' ').substring(0, 19);
      } else {
        // Se for um objeto Date, converter para formato MySQL
        const date = new Date(data_hora_inicio);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        dataHoraFormatada = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      console.log('📅 [DEBUG] Data formatada para MySQL:', dataHoraFormatada);

      // Criar dados para inserção
      const dadosSintoma = {
        doenca_id: parseInt(doencaId),
        descricao_sintoma: descricao_sintoma.trim(),
        intensidade,
        data_hora_inicio: dataHoraFormatada
      };

      console.log('📝 [DEBUG] Dados do sintoma a serem inseridos:', dadosSintoma);

      const novoSintoma = await SintomaModel.create(dadosSintoma);
      return novoSintoma;
    } catch (error) {
      console.error('Erro no SintomaService.createSintoma:', error);
      throw error;
    }
  }

  static async getAllSintomasByProfile(usuarioId, profileId) {
    try {
      // Verificar se o perfil pertence ao usuário
      await this._verifyProfileOwnership(usuarioId, profileId);
      
      // Buscar todas as doenças do perfil
      const doencas = await DoencaModel.findByPerfilId(profileId);
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

      // Obter o doenca_id antes de excluir o sintoma
      const doencaId = sintomaExistente.doenca_id;

      // Excluir o sintoma
      const deletado = await SintomaModel.delete(sintomaId);
      if (!deletado) {
        return false;
      }

      // Verificar se ainda existem outros sintomas associados à doença
      const sintomasRestantes = await SintomaModel.findByDoencaId(doencaId);
      
      // Se não houver mais sintomas, excluir a doença também
      if (sintomasRestantes.length === 0) {
        try {
          await DoencaService.deleteDoenca(usuarioId, profileId, doencaId);
          console.log(`Doença ${doencaId} excluída automaticamente após exclusão do último sintoma`);
        } catch (error) {
          console.error('Erro ao excluir doença após exclusão do sintoma:', error);
          // Não lançar erro aqui, pois o sintoma já foi excluído com sucesso
        }
      }

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
