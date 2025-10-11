# 🚀 Deploy no Render - Guia Completo

## 📋 **Passo a Passo para Deploy**

### 1️⃣ **Preparação do Git**

```bash
# 1. Inicializar repositório
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer primeiro commit
git commit -m "🎉 Primeiro commit - Bot Discord Modular"

# 4. Conectar ao GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/discord-bot.git

# 5. Enviar para o GitHub
git push -u origin main
```

### 2️⃣ **Configuração no Render**

1. **Acesse:** https://render.com/
2. **Faça login** com sua conta GitHub
3. **Clique em "New +"** → **"Web Service"**
4. **Conecte seu repositório** do GitHub
5. **Configure o serviço:**

```
Nome: discord-bot
Runtime: Node
Build Command: npm install
Start Command: npm run render-start
```

### 3️⃣ **Variáveis de Ambiente no Render**

Adicione estas variáveis no painel do Render:

```
DISCORD_TOKEN=seu_token_do_bot_aqui
CLIENT_ID=1426432189158916146
GUILD_ID=1402731113239023616
WORKER_URL=https://text-to-image.targexmarketing.workers.dev/
OWNER_ID=316768163465396224
LOG_CHANNEL_ID=1426433248556355666
MAX_REQUESTS_PER_USER=5
RATE_LIMIT_WINDOW=60000
DEFAULT_MODEL=@cf/lykon/dreamshaper-8-lcm
DEFAULT_STEPS=20
MAX_STEPS=50
```

### 4️⃣ **Deploy Automático**

- ✅ **Auto-Deploy:** Ativado
- ✅ **Branch:** main
- ✅ **Plano:** Free (suficiente para começar)

### 5️⃣ **Verificação**

Após o deploy, teste no Discord:
- `/help` - Ver comandos
- `/admin ping` - Testar latência
- `/gerar` - Testar geração de imagem

## 🔧 **Comandos Git Úteis**

```bash
# Ver status
git status

# Adicionar arquivos modificados
git add .

# Commit com mensagem
git commit -m "Sua mensagem aqui"

# Enviar para GitHub
git push

# Ver logs
git log --oneline
```

## 🆘 **Troubleshooting**

### Bot não inicia:
- Verifique se todas as variáveis estão corretas
- Confirme se o token do Discord é válido
- Verifique os logs no Render

### Comandos não aparecem:
- Execute `npm run deploy` localmente primeiro
- Verifique se o CLIENT_ID está correto

### Rate limiting:
- Ajuste `MAX_REQUESTS_PER_USER` se necessário
- Verifique se o worker está funcionando

## 📊 **Monitoramento**

- **Logs:** Disponível no painel do Render
- **Uptime:** Render mantém o bot online 24/7
- **Recursos:** Plano free tem limitações, mas suficiente para bot

## 🎯 **Próximos Passos**

1. ✅ Deploy no Render
2. 🔄 Testar comandos
3. 🎨 Adicionar mais funcionalidades
4. 📈 Monitorar performance
5. 🚀 Expandir módulos
