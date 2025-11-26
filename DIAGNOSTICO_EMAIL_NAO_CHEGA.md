# 🔍 Diagnóstico: Email Não Está Chegando

## ❌ Problema Identificado

O teste mostrou que as **credenciais de email estão com valores placeholder**:

```
EMAIL_USER=seu-email@gmail.com    ← Placeholder
EMAIL_PASS=sua-senha-app-aqui     ← Placeholder
```

**Erro:** `Invalid login: 535-5.7.8 Username and Password not accepted`

---

## ✅ Solução: Configurar Credenciais Reais

### Passo 1: Editar `config.env`

Abra o arquivo `HealtCare_BackEnd/config.env` e altere:

```env
EMAIL_USER=seu-email-real@gmail.com     # ⬅️ COLOQUE SEU EMAIL REAL
EMAIL_PASS=xxxx xxxx xxxx xxxx          # ⬅️ COLOQUE A SENHA DE APP
```

### Passo 2: Obter Senha de App do Gmail

**⚠️ IMPORTANTE:** Gmail não aceita senha normal, precisa de "Senha de App"

1. **Ative a autenticação de 2 fatores:**
   - Acesse: https://myaccount.google.com/security
   - Ative "Verificação em duas etapas"

2. **Gere uma Senha de App:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Email"
   - Selecione "Outro (nome personalizado)"
   - Digite: `Healthcare App`
   - Clique em "Gerar"
   - **Copie a senha de 16 caracteres** (formato: `xxxx xxxx xxxx xxxx`)

3. **Cole no `config.env`:**
   ```env
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```
   (Pode colar com ou sem espaços, ambos funcionam)

### Passo 3: Testar a Configuração

```bash
cd HealtCare_BackEnd
npm run test:email
```

**Resultado esperado:**
- ✅ Conexão com Servidor: PASSOU
- ✅ Envio de Email: PASSOU

---

## 🔍 Verificações Adicionais

### 1. Verificar se o código está sendo gerado

Mesmo sem email funcionando, o código é gerado e salvo no banco. Verifique:

```sql
SELECT email, token_recuperacao_senha 
FROM usuario 
WHERE email = 'seu-email@exemplo.com';
```

Se `token_recuperacao_senha` tem um valor (formato: `1234:timestamp`), o código está sendo gerado.

### 2. Verificar logs do backend

Quando você solicita recuperação de senha, verifique os logs do backend:

**Se email configurado corretamente:**
```
✅ Email de recuperação enviado: [messageId]
📧 Destinatário: usuario@exemplo.com
```

**Se email NÃO configurado:**
```
❌ Erro ao enviar email de recuperação: [mensagem de erro]
```

### 3. Verificar pasta de spam

- Gmail pode enviar para "Spam" na primeira vez
- Outlook pode enviar para "Lixo Eletrônico"
- Verifique também a aba "Promoções" no Gmail

---

## 🛠️ Alternativas se Gmail não funcionar

### Opção 1: Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=seu-email@outlook.com
EMAIL_PASS=sua-senha
EMAIL_FROM=seu-email@outlook.com
```

### Opção 2: Yahoo

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=seu-email@yahoo.com
EMAIL_PASS=sua-senha-app
EMAIL_FROM=seu-email@yahoo.com
```

### Opção 3: Testar sem envio real (desenvolvimento)

Se quiser testar apenas a estrutura sem configurar email:

1. O código será gerado e salvo no banco
2. Você pode consultar o código diretamente no banco:
   ```sql
   SELECT token_recuperacao_senha FROM usuario WHERE email = 'seu-email';
   ```
3. O código está no formato: `1234:timestamp`
4. Use os primeiros 4 dígitos para testar

---

## 📋 Checklist de Diagnóstico

- [ ] `EMAIL_USER` tem email real (não placeholder)
- [ ] `EMAIL_PASS` tem senha real (não placeholder)
- [ ] Para Gmail: está usando Senha de App (não senha normal)
- [ ] Autenticação de 2 fatores está ativada (Gmail)
- [ ] Teste de conexão passa: `npm run test:email`
- [ ] Verificou pasta de spam
- [ ] Backend está rodando e mostrando logs

---

## 🚨 Erros Comuns

### Erro: "Invalid login"
**Causa:** Credenciais incorretas ou senha normal do Gmail
**Solução:** Use Senha de App do Gmail

### Erro: "Connection timeout"
**Causa:** Firewall bloqueando porta 587
**Solução:** Verifique firewall ou use porta 465 (SSL)

### Email não chega mas código é gerado
**Causa:** Email configurado mas não está sendo enviado
**Solução:** Verifique logs do backend para ver erro específico

---

## ✅ Após Configurar

1. **Reinicie o backend:**
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

2. **Teste novamente:**
   - Solicite recuperação de senha no app
   - Verifique o email (incluindo spam)
   - O código deve chegar em alguns segundos

---

## 📞 Próximos Passos

Após configurar as credenciais:
1. Execute `npm run test:email` novamente
2. Se passar, teste no app
3. Se ainda não funcionar, verifique os logs do backend durante a solicitação

