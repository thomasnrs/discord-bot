# 🤖 Bot Discord Modular Completo

Bot Discord profissional e modular com **TODAS** as funcionalidades modernas: geração de imagens IA, sistema de economia, música, tickets, níveis, moderação, dashboard web e muito mais!

## ✨ Funcionalidades Principais

### 🎨 **Geração de Imagens IA**
- Geração de imagens usando Cloudflare Workers
- Múltiplos modelos de IA (Stable Diffusion XL, DreamShaper, etc)
- Rate limiting inteligente
- Qualidade configurável (steps)

### 💰 **Sistema de Economia Completo**
- Sistema de moedas com carteira e banco
- Comandos: `/daily`, `/work`, `/crime`, `/transfer`
- Sistema de cooldowns e recompensas
- Leaderboard de usuários mais ricos
- Banco de dados JSON persistente

### 🎵 **Player de Música Avançado**
- Reprodução de músicas do YouTube
- Comandos: `/play`, `/pause`, `/resume`, `/skip`, `/stop`, `/queue`
- Sistema de filas inteligente
- Controle de volume e progresso
- Eventos automáticos de música

### 🎫 **Sistema de Tickets Profissional**
- Criação automática de tickets por categoria
- Categorias: Bug, Sugestão, Dúvida, Denúncia, Suporte, etc
- Sistema de permissões automático
- Comandos: `/ticket`, `/close`, `/adduser`, `/removeuser`
- Fechamento automático com limpeza

### 📈 **Sistema de Níveis e XP**
- XP por mensagens, comandos e tempo de voz
- Comandos: `/level`, `/levelboard`
- Sistema de progressão com barras visuais
- Notificações de level up automáticas
- Leaderboard de níveis

### 🔧 **Moderação Avançada**
- Comandos: `/ban`, `/kick` com logs automáticos
- Verificação de hierarquia de cargos
- Sistema de logs detalhado
- Embeds informativos

### 🎮 **Comandos de Diversão**
- `/8ball` - Bola 8 mágica
- `/dice` - Rolar dados personalizáveis
- `/joke` - Piadas aleatórias
- `/coinflip` - Cara ou coroa com apostas

### 📊 **Sistema de Estatísticas**
- Monitoramento em tempo real do sistema
- Atualização automática a cada 30 segundos
- Métricas: CPU, memória, uptime, ping, comandos
- Edição de mensagem (não flooda o canal)

### 🌐 **Dashboard Web**
- Interface web completa e responsiva
- Estatísticas em tempo real do bot
- API REST para dados
- Design moderno e profissional

## 🚀 Instalação Rápida

### 1. **Clone e Instale**
   ```bash
git clone https://github.com/thomasnrs/discord-bot.git
cd discord-bot
npm install
```

### 2. **Configure as Variáveis de Ambiente**
```bash
# Copie o arquivo de configuração
cp config.env .env

# Edite com suas configurações
```

### 3. **Configure o .env**
```env
# Discord Bot Configuration
DISCORD_TOKEN=seu_token_do_bot_aqui
CLIENT_ID=seu_client_id_aqui
GUILD_ID=id_do_servidor_para_testes

# API Configuration
WORKER_URL=https://seu-worker.cloudflare.workers.dev

# Bot Configuration
OWNER_ID=seu_user_id_aqui
LOG_CHANNEL_ID=id_do_canal_de_logs
STATS_CHANNEL_ID=id_do_canal_de_stats

# Economy System
ECONOMY_ENABLED=true
DAILY_AMOUNT=500
WEEKLY_AMOUNT=2000

# Level System
LEVEL_SYSTEM_ENABLED=true
XP_PER_MESSAGE=15
XP_PER_COMMAND=25

# Music System
MUSIC_ENABLED=true
DEFAULT_VOLUME=50

# Ticket System
TICKET_SYSTEM_ENABLED=true

# Web Dashboard
WEB_DASHBOARD_ENABLED=true
WEB_PORT=3000
```

### 4. **Execute o Bot**
```bash
# Deploy dos comandos (primeira vez)
npm run deploy

# Iniciar o bot
npm start

# Modo desenvolvimento
npm run dev
```

## 🎯 Comandos Disponíveis

### 🎨 **Geração de Imagens**
| Comando | Descrição | Parâmetros |
|---------|-----------|------------|
| `/gerar` | Gera imagem usando IA | `prompt` (obrigatório) |

### 💰 **Sistema de Economia**
| Comando | Descrição | Cooldown |
|---------|-----------|----------|
| `/balance` | Mostra saldo atual | - |
| `/daily` | Recebe moedas diárias | 24h |
| `/work` | Trabalha para ganhar moedas | 30min |
| `/crime` | Comete crime (pode ganhar/perder) | 1h |
| `/transfer` | Transfere entre carteira/banco | - |
| `/leaderboard` | Ranking dos mais ricos | - |

### 🎵 **Sistema de Música**
| Comando | Descrição |
|---------|-----------|
| `/play` | Toca uma música |
| `/pause` | Pausa a música atual |
| `/resume` | Retoma música pausada |
| `/skip` | Pula para próxima música |
| `/stop` | Para música e limpa fila |
| `/queue` | Mostra fila de músicas |
| `/nowplaying` | Música atual |
| `/volume` | Altera volume (0-100) |

### 🎫 **Sistema de Tickets**
| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/ticket` | Cria ticket de suporte | Todos |
| `/close` | Fecha ticket atual | Staff |
| `/adduser` | Adiciona usuário ao ticket | Staff |
| `/removeuser` | Remove usuário do ticket | Staff |

### 📈 **Sistema de Níveis**
| Comando | Descrição |
|---------|-----------|
| `/level` | Mostra perfil de nível |
| `/levelboard` | Ranking de níveis |

### 🔧 **Moderação**
| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/ban` | Bane usuário do servidor | Ban Members |
| `/kick` | Expulsa usuário | Kick Members |

### 🎮 **Diversão**
| Comando | Descrição |
|---------|-----------|
| `/8ball` | Bola 8 mágica |
| `/dice` | Rola dados personalizáveis |
| `/joke` | Conta uma piada |
| `/coinflip` | Cara ou coroa |

### 📊 **Administração**
| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/stats` | Estatísticas do bot | Manage Guild |
| `/status` | Status atual do bot | - |
| `/statscontrol` | Controla stats automático | Administrator |

## 🏗️ Estrutura do Projeto

```
src/
├── bot.js                    # Arquivo principal do bot
├── commands/                 # Comandos slash organizados
│   ├── economy/             # Sistema de economia
│   │   ├── balance.js
│   │   ├── daily.js
│   │   ├── work.js
│   │   ├── crime.js
│   │   ├── transfer.js
│   │   └── leaderboard.js
│   ├── music/               # Sistema de música
│   │   ├── play.js
│   │   ├── pause.js
│   │   ├── resume.js
│   │   ├── skip.js
│   │   ├── stop.js
│   │   ├── queue.js
│   │   ├── nowplaying.js
│   │   └── volume.js
│   ├── ticket/              # Sistema de tickets
│   │   ├── create.js
│   │   ├── close.js
│   │   ├── adduser.js
│   │   └── removeuser.js
│   ├── level/               # Sistema de níveis
│   │   ├── profile.js
│   │   └── leaderboard.js
│   ├── moderation/          # Moderação
│   │   ├── ban.js
│   │   └── kick.js
│   ├── fun/                 # Comandos de diversão
│   │   ├── 8ball.js
│   │   ├── dice.js
│   │   ├── joke.js
│   │   └── coinflip.js
│   ├── gerar.js             # Geração de imagens
│   ├── help.js              # Ajuda
│   ├── stats.js             # Estatísticas
│   ├── status.js            # Status
│   └── statscontrol.js      # Controle de stats
├── modules/                 # Módulos do sistema
│   ├── database.js          # Banco de dados JSON
│   ├── economy.js           # Sistema de economia
│   ├── music.js             # Player de música
│   ├── ticketSystem.js      # Sistema de tickets
│   ├── levelSystem.js       # Sistema de níveis
│   ├── imageGenerator.js    # Geração de imagens
│   └── systemStats.js       # Estatísticas do sistema
├── web/                     # Dashboard web
│   └── dashboard.js         # Interface web
└── data/                    # Dados persistentes
    ├── economy.json         # Dados de economia
    ├── levels.json          # Dados de níveis
    ├── tickets.json         # Dados de tickets
    └── guildConfigs.json    # Configurações de servidor
```

## 🌐 Dashboard Web

Acesse o dashboard web em: `http://localhost:3000` (ou sua URL do Render)

### Funcionalidades do Dashboard:
- **Estatísticas em tempo real** do bot
- **Informações de servidores** e usuários
- **Lista de comandos** disponíveis
- **Métricas de sistema** (CPU, memória, uptime)
- **Design responsivo** e moderno

## 🔧 Configuração do Discord

### 1. **Criar Aplicação**
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application"
3. Dê um nome para seu bot

### 2. **Configurar Bot**
1. Vá em "Bot" no menu lateral
2. Clique em "Add Bot"
3. Copie o **Token** e coloque no `.env`
4. Ative as **Privileged Gateway Intents**:
   - ✅ MESSAGE CONTENT INTENT
   - ✅ SERVER MEMBERS INTENT

### 3. **Configurar OAuth2**
1. Vá em "OAuth2" > "URL Generator"
2. Selecione:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Selecione as permissões necessárias:
   - ✅ Send Messages
   - ✅ Use Slash Commands
   - ✅ Manage Messages
   - ✅ Ban Members
   - ✅ Kick Members
   - ✅ Manage Channels
   - ✅ Connect (para música)
   - ✅ Speak (para música)
4. Copie a URL e adicione o bot ao servidor

## 🚀 Deploy no Render

### 1. **Configurar Render**
1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Conecte seu repositório GitHub
3. Crie um novo **Web Service**
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2. **Configurar Variáveis de Ambiente**
No painel do Render, adicione todas as variáveis do `.env`:
- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`
- `WORKER_URL`
- `OWNER_ID`
- `LOG_CHANNEL_ID`
- `STATS_CHANNEL_ID`
- E todas as outras...

### 3. **Deploy Automático**
- O Render fará deploy automático a cada push
- Monitore os logs para verificar se está funcionando
- Acesse o dashboard web na URL do Render

## 📊 Monitoramento e Logs

### **Sistema de Stats Automático**
- Atualização a cada 30 segundos
- Canal configurável para stats
- Métricas: CPU, memória, uptime, ping, comandos
- Edição de mensagem (não flooda)

### **Logs Detalhados**
- Logs de comandos executados
- Logs de moderação
- Logs de sistema
- Logs de música e tickets

## 🛡️ Segurança e Rate Limiting

### **Rate Limiting**
- **Imagens**: 5 requisições por usuário por minuto
- **Economia**: Cooldowns configuráveis
- **Música**: Controle de fila (máx 50 músicas)
- **Tickets**: Limite de tickets por usuário

### **Permissões**
- Verificação de hierarquia de cargos
- Comandos restritos por permissão
- Sistema de logs de moderação
- Controle de acesso por categoria

## 🔮 Funcionalidades Avançadas

### **Sistema Modular**
- Fácil adição de novos comandos
- Módulos independentes
- Sistema de eventos
- Configuração flexível

### **Banco de Dados**
- Persistência com JSON
- Backup automático
- Dados organizados por categoria
- Fácil migração

### **API REST**
- Endpoints para estatísticas
- Dados de servidores e usuários
- Integração com dashboard web
- Documentação automática

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte e Troubleshooting

### **Problemas Comuns**

1. **Bot não responde**
   - Verifique se o token está correto
   - Confirme as permissões do bot
   - Verifique os logs do Render

2. **Comandos não aparecem**
   - Execute `npm run deploy`
   - Aguarde até 1 hora para propagação global
   - Verifique se o CLIENT_ID está correto

3. **Música não toca**
   - Verifique se o bot está no canal de voz
   - Confirme as permissões de voz
   - Teste com URLs do YouTube

4. **Economia não funciona**
   - Verifique se `ECONOMY_ENABLED=true`
   - Confirme as permissões de escrita
   - Verifique os logs de erro

### **Logs e Debug**
- Monitore os logs do Render
- Use `/stats` para verificar status
- Verifique o dashboard web
- Confirme as variáveis de ambiente

## 🎉 Agradecimentos

- **Discord.js** - Framework principal
- **Cloudflare Workers** - API de geração de imagens
- **Render** - Hospedagem gratuita
- **Discord Player** - Sistema de música
- **Express** - Dashboard web

---

**Desenvolvido com ❤️ para a comunidade Discord!**

*Bot Discord Modular - Versão 2.0 - Todas as features implementadas!* 🚀