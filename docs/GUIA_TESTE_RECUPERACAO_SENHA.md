# 🧪 Guia de Teste - Recuperação de Senha

## ✅ Checklist de Verificação

### 1. Backend - Configuração de Email

**Arquivo:** `HealtCare_BackEnd/config.env`

Verifique se as credenciais de email estão configuradas:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-app-aqui
EMAIL_FROM=noreply@healthcare.com
```

**⚠️ IMPORTANTE:**
- Para Gmail, você precisa usar uma "Senha de App" (não a senha normal)
- Como obter: https://support.google.com/accounts/answer/185833
- Ative a autenticação de 2 fatores primeiro

### 2. Banco de Dados

Verifique se:
- ✅ MySQL está rodando
- ✅ Banco `healthcare` existe
- ✅ Tabela `usuario` tem a coluna `token_recuperacao_senha`

### 3. Dependências

**Backend:**
```bash
cd HealtCare_BackEnd
npm install
```

**Frontend:**
```bash
cd HealtCare_FrontEnd
npm install
```

---

## 🚀 Como Testar

### Passo 1: Iniciar o Backend

```bash
cd HealtCare_BackEnd
npm run dev
```

**Verificações:**
- ✅ Servidor iniciando em `http://localhost:3000`
- ✅ Conexão com banco de dados OK
- ✅ Serviço de email inicializado (verifique os logs)

### Passo 2: Iniciar o Frontend

```bash
cd HealtCare_FrontEnd
npm start
# ou
npx expo start
```

### Passo 3: Testar o Fluxo Completo

#### 3.1 Solicitar Código de Recuperação

1. No app, vá para a tela de Login
2. Clique em "Esqueceu a sua senha?"
3. Digite um email válido cadastrado no sistema
4. Clique em "Recuperar senha"

**Resultado esperado:**
- ✅ Botão mostra loading
- ✅ Mensagem de sucesso aparece
- ✅ Navega para tela de verificação de código
- ✅ Email com código é enviado (verifique a caixa de entrada)

#### 3.2 Verificar Código

1. Verifique seu email e copie o código de 4 dígitos
2. Na tela de verificação, digite o código
3. Clique em "Inserir código"

**Resultado esperado:**
- ✅ Botão mostra loading
- ✅ Se código correto: navega para tela de reset
- ✅ Se código incorreto: mostra erro

#### 3.3 Resetar Senha

1. Na tela de reset, digite a nova senha (mínimo 6 caracteres)
2. Confirme a senha
3. Clique em "Alterar senha"

**Resultado esperado:**
- ✅ Botão mostra loading
- ✅ Mensagem de sucesso aparece
- ✅ Redireciona para tela de login
- ✅ Você pode fazer login com a nova senha

---

## 🧪 Testes de Validação

### Teste 1: Email Inválido

**Ação:** Digite um email com formato inválido (ex: "teste@")

**Resultado esperado:**
- ❌ Erro: "Formato de email inválido"

### Teste 2: Email Não Cadastrado

**Ação:** Digite um email que não existe no banco

**Resultado esperado:**
- ✅ Mensagem de sucesso (por segurança, não revela se email existe)
- ⚠️ Mas nenhum email será enviado

### Teste 3: Código Inválido

**Ação:** Digite um código incorreto

**Resultado esperado:**
- ❌ Erro: "Código incorreto" ou "Código inválido ou expirado"

### Teste 4: Código Expirado

**Ação:** Aguarde mais de 15 minutos após receber o código

**Resultado esperado:**
- ❌ Erro: "Código expirado. Solicite um novo código."

### Teste 5: Senha Muito Curta

**Ação:** Digite uma senha com menos de 6 caracteres

**Resultado esperado:**
- ❌ Erro: "A senha deve ter pelo menos 6 caracteres"

### Teste 6: Senhas Não Coincidem

**Ação:** Digite senhas diferentes nos dois campos

**Resultado esperado:**
- ❌ Erro: "As senhas não coincidem"

---

## 🔍 Verificação de Logs

### Backend

Verifique os logs do backend para:

1. **Solicitação de código:**
   ```
   ✅ Email de recuperação enviado: [messageId]
   📧 Destinatário: [email]
   ```

2. **Verificação de código:**
   ```
   Verificando código [code] para o email [email]
   ```

3. **Reset de senha:**
   ```
   Resetando senha para [email] com o código [code]
   ```

### Frontend

Verifique o console do React Native/Expo para:
- ✅ Chamadas à API sendo feitas
- ✅ Respostas da API
- ⚠️ Erros de conexão (se houver)

---

## ⚠️ Problemas Comuns

### 1. Email não está sendo enviado

**Causas possíveis:**
- Credenciais de email incorretas no `config.env`
- Gmail bloqueando (use Senha de App)
- Firewall bloqueando porta 587

**Solução:**
- Verifique as credenciais no `config.env`
- Teste a conexão: `npm run test:email`

### 2. Código não chega

**Causas possíveis:**
- Email na pasta de spam
- Servidor de email não configurado
- Erro no envio (verifique logs do backend)

**Solução:**
- Verifique a pasta de spam
- Verifique os logs do backend
- Teste com outro provedor de email

### 3. Erro de conexão

**Causas possíveis:**
- Backend não está rodando
- URL da API incorreta
- CORS bloqueando

**Solução:**
- Verifique se backend está em `http://localhost:3000`
- Verifique `CORS_ORIGIN` no `config.env`

### 4. Código sempre inválido

**Causas possíveis:**
- Código expirado (15 minutos)
- Código já foi usado
- Problema na validação

**Solução:**
- Solicite um novo código
- Verifique se não está usando código antigo

---

## 📊 Endpoints da API

### POST `/api/users/forgot-password`
**Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

### POST `/api/users/verify-code`
**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "code": "1234"
}
```

### POST `/api/users/reset-password`
**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "code": "1234",
  "newPassword": "novaSenha123"
}
```

---

## ✅ Status Final

- ✅ Backend implementado e testado
- ✅ Frontend integrado
- ✅ Validações funcionando
- ✅ Tratamento de erros completo
- ✅ UX com loading e feedback

**Pronto para testar!** 🚀

---

## 📝 Notas

- O código expira em **15 minutos**
- Por segurança, não revelamos se o email existe ou não
- Use uma "Senha de App" do Gmail, não a senha normal
- Em produção, considere usar SendGrid ou serviço similar

