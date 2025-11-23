// backend/src/services/medicamentoService.js

const MedicamentoModel = require('../models/medicamentoModel');
const RegistroUsoMedicamentoModel = require('../models/registroUsoMedicamentoModel');
const FormatoMedicamentoModel = require('../models/formatoMedicamentoModel');
const ProfileModel = require('../models/profileModel');

// Verificar se ProfileModel foi importado corretamente
console.log('🔍 [DEBUG Service] ProfileModel importado:', ProfileModel ? 'Sim' : 'Não');
console.log('🔍 [DEBUG Service] ProfileModel.findById existe?', typeof ProfileModel?.findById === 'function' ? 'Sim' : 'Não');

class MedicamentoService {
  // --- MÉTODOS PARA O MEDICAMENTO (CRUD) ---

  static async createMedicamento(usuarioId, perfilId, dadosMedicamento) {
    console.log('🔍 [DEBUG Service] Criando medicamento:', { 
      usuarioId, 
      perfilId, 
      tipoUsuarioId: typeof usuarioId,
      tipoPerfilId: typeof perfilId,
      dadosMedicamento 
    });
    
    // Verificar se o perfil pertence ao usuário
    console.log('🔍 [DEBUG Service] Verificando propriedade do perfil...');
    await this._verifyProfileOwnership(usuarioId, perfilId);
    console.log('✅ [DEBUG Service] Perfil verificado com sucesso');

    const { nome_medicamento, frequencia_horas, data_inicio_tratamento } = dadosMedicamento;
    if (!nome_medicamento || !frequencia_horas || !data_inicio_tratamento) {
      throw new Error('Nome do medicamento, frequência (em horas) e data de início são obrigatórios.');
    }

    // Garantir que perfil_id está correto
    const dadosParaCriar = { 
      ...dadosMedicamento, 
      perfil_id: perfilId 
    };
    
    console.log('🔍 [DEBUG Service] Dados para criar no Model:', JSON.stringify(dadosParaCriar, null, 2));
    console.log('📤 [DEBUG Service] Chamando MedicamentoModel.create...');
    
    const resultado = await MedicamentoModel.create(dadosParaCriar);
    
    console.log('✅ [DEBUG Service] Medicamento criado com sucesso:', JSON.stringify(resultado, null, 2));
    
    // Criar formato do medicamento se fornecido
    if (dadosMedicamento.nome_formato && dadosMedicamento.unidade_padrao_dosagem) {
      try {
        const formatoData = {
          medicamento_id: resultado.id,
          nome_formato: dadosMedicamento.nome_formato,
          unidade_padrao_dosagem: dadosMedicamento.unidade_padrao_dosagem
        };
        await FormatoMedicamentoModel.create(formatoData);
        console.log('✅ [DEBUG Service] Formato do medicamento criado com sucesso');
      } catch (error) {
        console.error('❌ [DEBUG Service] Erro ao criar formato do medicamento:', error);
        // Não falhar a criação do medicamento se o formato falhar
      }
    }
    
    return resultado;
  }

  static async getAllMedicamentosByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await MedicamentoModel.findByPerfilId(perfilId);
  }

  static async getMedicamentoById(usuarioId, perfilId, medicamentoId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const medicamento = await this._verifyMedicamentoOwnership(perfilId, medicamentoId);
    
    // Buscar formato do medicamento se existir
    try {
      const formato = await FormatoMedicamentoModel.findByMedicamentoId(medicamentoId);
      if (formato) {
        medicamento.formato = formato;
      }
    } catch (error) {
      console.error('Erro ao buscar formato do medicamento:', error);
      // Não falhar se não encontrar formato
    }
    
    return medicamento;
  }
  
  static async updateMedicamento(usuarioId, perfilId, medicamentoId, updateData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyMedicamentoOwnership(perfilId, medicamentoId);

    console.log('🔍 [DEBUG Service] updateMedicamento - updateData recebido:', JSON.stringify(updateData, null, 2));

    // Extrair dados do formato separadamente ANTES de filtrar
    const nome_formato = updateData.nome_formato;
    const unidade_padrao_dosagem = updateData.unidade_padrao_dosagem;

    // Separar dados do medicamento dos dados do formato e perfil_id
    // Campos que pertencem à tabela medicamento
    const camposMedicamento = [
      'nome_medicamento',
      'dosagem',
      'frequencia_horas',
      'duracao_dias_tratamento',
      'data_inicio_tratamento',
      'lembretes_ativos',
      'uso_continuo'
    ];

    // Filtrar apenas os campos válidos da tabela medicamento
    // Criar um novo objeto apenas com os campos permitidos
    const dadosMedicamento = {};
    for (const campo of camposMedicamento) {
      if (campo in updateData && updateData[campo] !== undefined && updateData[campo] !== null) {
        dadosMedicamento[campo] = updateData[campo];
      }
    }

    // Garantir que perfil_id, nome_formato e unidade_padrao_dosagem NÃO estejam em dadosMedicamento
    // (mesmo que não devessem estar, garantimos a remoção)
    if ('perfil_id' in dadosMedicamento) delete dadosMedicamento.perfil_id;
    if ('nome_formato' in dadosMedicamento) delete dadosMedicamento.nome_formato;
    if ('unidade_padrao_dosagem' in dadosMedicamento) delete dadosMedicamento.unidade_padrao_dosagem;

    console.log('🔍 [DEBUG Service] updateMedicamento - dadosMedicamento filtrado:', JSON.stringify(dadosMedicamento, null, 2));
    console.log('🔍 [DEBUG Service] updateMedicamento - formato:', { nome_formato, unidade_padrao_dosagem });

    // Atualizar medicamento apenas com campos válidos
    await MedicamentoModel.update(medicamentoId, dadosMedicamento);

    // Atualizar ou criar formato se fornecido
    if (nome_formato && unidade_padrao_dosagem) {
      try {
        const formatoExistente = await FormatoMedicamentoModel.findByMedicamentoId(medicamentoId);
        
        if (formatoExistente) {
          // Atualizar formato existente
          await FormatoMedicamentoModel.update(medicamentoId, {
            nome_formato,
            unidade_padrao_dosagem
          });
        } else {
          // Criar novo formato
          await FormatoMedicamentoModel.create({
            medicamento_id: medicamentoId,
            nome_formato,
            unidade_padrao_dosagem
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar formato do medicamento:', error);
        // Não falhar a atualização do medicamento se o formato falhar
      }
    }

    return await MedicamentoModel.findById(medicamentoId);
  }

  static async deleteMedicamento(usuarioId, perfilId, medicamentoId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyMedicamentoOwnership(perfilId, medicamentoId);

    return await MedicamentoModel.delete(medicamentoId);
  }

  // --- MÉTODOS PARA REGISTRO DE USO ---

  static async registrarUso(usuarioId, perfilId, medicamentoId, dadosRegistro) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyMedicamentoOwnership(perfilId, medicamentoId);
    
    const { data_hora_registro, status_uso } = dadosRegistro;
    if (!data_hora_registro || !status_uso) {
      throw new Error('Data, hora e status do uso são obrigatórios.');
    }

    const validStatus = ['TOMADO', 'PULADO', 'ADIADO'];
    if (!validStatus.includes(status_uso.toUpperCase())) {
      throw new Error(`Status de uso inválido. Use um dos seguintes: ${validStatus.join(', ')}`);
    }

    // Normalizar data_hora_registro para formato DATETIME do MySQL (YYYY-MM-DD HH:mm:ss)
    let normalizedDateTime = String(data_hora_registro);
    // Se estiver em formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ), converter para MySQL
    if (normalizedDateTime.includes('T')) {
      normalizedDateTime = normalizedDateTime.replace('T', ' ').replace('Z', '').split('.')[0];
    }
    // Garantir que não tenha timezone offset
    if (normalizedDateTime.includes('+') || normalizedDateTime.match(/-/g)?.length > 2) {
      const parts = normalizedDateTime.split(' ');
      if (parts.length === 2) {
        normalizedDateTime = parts[0] + ' ' + parts[1].split('+')[0].split('-')[0];
      }
    }

    const dadosParaCriar = {
      medicamento_id: medicamentoId,
      data_hora_registro: normalizedDateTime,
      status_uso: status_uso.charAt(0).toUpperCase() + status_uso.slice(1).toLowerCase() // Capitaliza (Ex: Tomado)
    };
    return await RegistroUsoMedicamentoModel.create(dadosParaCriar);
  }

  static async getHistoricoDeUso(usuarioId, perfilId, medicamentoId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyMedicamentoOwnership(perfilId, medicamentoId);

    return await RegistroUsoMedicamentoModel.findByMedicamentoId(medicamentoId);
  }

  // --- MÉTODOS PRIVADOS DE VERIFICAÇÃO ---

  static async _verifyProfileOwnership(usuarioId, perfilId) {
    console.log('🔍 [DEBUG Service] _verifyProfileOwnership chamado:', { 
      usuarioId, 
      perfilId,
      tipoUsuarioId: typeof usuarioId,
      tipoPerfilId: typeof perfilId
    });
    
    console.log('🔍 [DEBUG Service] Buscando perfil no banco...');
    const perfil = await ProfileModel.findById(perfilId);
    console.log('🔍 [DEBUG Service] Perfil encontrado:', perfil ? 'Sim' : 'Não', perfil);
    
    if (!perfil) {
      console.error('❌ [DEBUG Service] Perfil não encontrado no banco para perfilId:', perfilId);
      throw new Error('Perfil não encontrado.');
    }
    
    console.log('🔍 [DEBUG Service] Comparando usuario_id:', {
      perfilUsuarioId: perfil.usuario_id,
      tipoPerfilUsuarioId: typeof perfil.usuario_id,
      usuarioIdRecebido: usuarioId,
      tipoUsuarioIdRecebido: typeof usuarioId,
      comparacao: perfil.usuario_id !== Number(usuarioId)
    });
    
    if (perfil.usuario_id !== Number(usuarioId)) {
      console.error('❌ [DEBUG Service] Perfil não pertence ao usuário:', {
        perfilUsuarioId: perfil.usuario_id,
        usuarioIdRecebido: usuarioId
      });
      throw new Error('Acesso não autorizado a este perfil.');
    }
    
    console.log('✅ [DEBUG Service] Perfil pertence ao usuário - verificação OK');
    return perfil;
  }

  static async _verifyMedicamentoOwnership(perfilId, medicamentoId) {
    const medicamento = await MedicamentoModel.findById(medicamentoId);
    if (!medicamento) {
      throw new Error('Medicamento não encontrado.');
    }
    if (medicamento.perfil_id !== Number(perfilId)) {
      throw new Error('Medicamento não pertence a este perfil.');
    }
    return medicamento;
  }
}

module.exports = MedicamentoService;