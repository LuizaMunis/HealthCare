// Script para inserir dados de exemplo no banco
const { pool } = require('./src/config/database');

async function insertSampleData() {
  try {
    console.log('🔄 Inserindo dados de exemplo...');

    // 1. Buscar o primeiro perfil disponível
    const [profiles] = await pool.execute('SELECT id FROM perfil LIMIT 1');
    
    if (profiles.length === 0) {
      console.log('❌ Nenhum perfil encontrado. Crie um perfil primeiro.');
      return;
    }

    const profileId = profiles[0].id;
    console.log(`✅ Usando perfil ID: ${profileId}`);

    // 2. Inserir doenças de exemplo
    const doencas = [
      {
        nome_doenca: 'Gripe',
        tipo_doenca: 'Viral',
        data_diagnostico: '2024-01-15',
        observacoes: 'Doença viral comum'
      },
      {
        nome_doenca: 'Hipertensão',
        tipo_doenca: 'Crônica',
        data_diagnostico: '2024-02-01',
        observacoes: 'Pressão arterial elevada'
      },
      {
        nome_doenca: 'Diabetes Tipo 2',
        tipo_doenca: 'Crônica',
        data_diagnostico: '2024-03-10',
        observacoes: 'Diabetes mellitus tipo 2'
      },
      {
        nome_doenca: 'Resfriado',
        tipo_doenca: 'Viral',
        data_diagnostico: '2024-04-05',
        observacoes: 'Resfriado comum'
      },
      {
        nome_doenca: 'Dor de Cabeça',
        tipo_doenca: 'Sintomática',
        data_diagnostico: '2024-05-01',
        observacoes: 'Cefaleia tensional'
      }
    ];

    for (const doenca of doencas) {
      const query = `
        INSERT INTO doenca (perfil_id, nome_doenca, tipo_doenca, data_diagnostico, observacoes)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [profileId, doenca.nome_doenca, doenca.tipo_doenca, doenca.data_diagnostico, doenca.observacoes];
      
      await pool.execute(query, values);
      console.log(`✅ Doença inserida: ${doenca.nome_doenca}`);
    }

    console.log('🎉 Dados de exemplo inseridos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
  } finally {
    process.exit(0);
  }
}

insertSampleData();

