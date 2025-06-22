// backend/src/controllers/perfilController.js
const PerfilModel = require('../models/perfilModel');

class PerfilController {
  /**
   * Cria um novo perfil para o usuário autenticado.
   * Requer que o usuário esteja autenticado (req.user.id deve estar disponível).
   */
  static async createProfile(req, res) {
    try {
      const usuario_id = req.user.id; // Obtém o ID do usuário do token JWT
      const { data_nascimento, celular, genero, cpf, peso, altura } = req.body;

      // Validação básica: usuario_id é essencial
      if (!usuario_id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado. Impossível criar perfil.'
        });
      }

      // Validação dos dados do perfil (adicionar mais conforme necessário)
      if (cpf && cpf.length !== 11 && cpf.length !== 14) { // Aceita CPF com ou sem pontos/traços
        return res.status(400).json({
          success: false,
          message: 'Formato de CPF inválido. Use 11 dígitos ou 14 (com máscara).'
        });
      }
      if (genero && !['M', 'F', 'O'].includes(genero.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "Gênero inválido. Use 'M' para Masculino, 'F' para Feminino ou 'O' para Outro."
        });
      }

      // Verificar se o perfil já existe para este usuário
      const existingProfile = await PerfilModel.findByUsuarioId(usuario_id);
      if (existingProfile) {
        return res.status(409).json({ // 409 Conflict
          success: false,
          message: 'Perfil para este usuário já existe. Use a rota de atualização.'
        });
      }

      // Verificar se o CPF já está em uso por outro perfil
      if (cpf) {
        const existingProfileByCpf = await PerfilModel.findByCpf(cpf);
        if (existingProfileByCpf && existingProfileByCpf.usuario_id !== usuario_id) {
          return res.status(409).json({
            success: false,
            message: 'CPF já cadastrado para outro usuário.'
          });
        }
      }

      const newProfileData = {
        usuario_id,
        data_nascimento: data_nascimento || null, // Permite null se não fornecido
        celular: celular || null,
        genero: genero ? genero.toUpperCase() : null, // Armazena em maiúsculo
        cpf: cpf || null,
        peso: peso || null,
        altura: altura || null,
      };

      const newProfile = await PerfilModel.create(newProfileData);

      res.status(201).json({
        success: true,
        message: 'Perfil criado com sucesso!',
        data: newProfile
      });

    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao criar perfil.',
        error: error.message
      });
    }
  }

  /**
   * Obtém o perfil do usuário autenticado.
   * Requer que o usuário esteja autenticado.
   */
  static async getProfile(req, res) {
    try {
      const usuario_id = req.user.id;

      if (!usuario_id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.'
        });
      }

      const profile = await PerfilModel.findByUsuarioId(usuario_id);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado para este usuário.'
        });
      }

      res.json({
        success: true,
        data: profile
      });

    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao obter perfil.',
        error: error.message
      });
    }
  }

  /**
   * Atualiza o perfil do usuário autenticado.
   * Requer que o usuário esteja autenticado.
   */
  static async updateProfile(req, res) {
    try {
      const usuario_id = req.user.id;
      const updateData = req.body;

      if (!usuario_id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.'
        });
      }

      // Validações adicionais para updateData (similar ao createProfile)
      if (updateData.cpf) {
        if (updateData.cpf.length !== 11 && updateData.cpf.length !== 14) {
          return res.status(400).json({
            success: false,
            message: 'Formato de CPF inválido. Use 11 dígitos ou 14 (com máscara).'
          });
        }
        // Verificar se o CPF já está em uso por outro perfil (excluindo o próprio usuário)
        const existingProfileByCpf = await PerfilModel.findByCpf(updateData.cpf);
        if (existingProfileByCpf && existingProfileByCpf.usuario_id !== usuario_id) {
          return res.status(409).json({
            success: false,
            message: 'CPF já cadastrado para outro usuário.'
          });
        }
      }
      if (updateData.genero) {
        updateData.genero = updateData.genero.toUpperCase(); // Garante que seja maiúsculo
        if (!['M', 'F', 'O'].includes(updateData.genero)) {
          return res.status(400).json({
            success: false,
            message: "Gênero inválido. Use 'M' para Masculino, 'F' para Feminino ou 'O' para Outro."
          });
        }
      }


      const updated = await PerfilModel.update(usuario_id, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado ou nenhum dado para atualizar.'
        });
      }

      // Opcional: buscar o perfil atualizado para retornar
      const updatedProfile = await PerfilModel.findByUsuarioId(usuario_id);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: updatedProfile
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao atualizar perfil.',
        error: error.message
      });
    }
  }

  /**
   * Deleta o perfil do usuário autenticado.
   * Requer que o usuário esteja autenticado.
   */
  static async deleteProfile(req, res) {
    try {
      const usuario_id = req.user.id;

      if (!usuario_id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.'
        });
      }

      const deleted = await PerfilModel.delete(usuario_id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado para exclusão.'
        });
      }

      res.json({
        success: true,
        message: 'Perfil deletado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao deletar perfil.',
        error: error.message
      });
    }
  }
}

module.exports = PerfilController;
