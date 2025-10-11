# 🤖 Bot Discord Modular

Bot Discord completo e modular com geração de imagens usando IA da Cloudflare Workers.

## ✨ Funcionalidades

- 🎨 **Geração de Imagens**: Cria imagens usando IA com diferentes modelos
- ⚙️ **Administração**: Comandos de admin para gerenciar o bot
- 🔒 **Rate Limiting**: Controle de requisições por usuário
- 📊 **Estatísticas**: Monitoramento em tempo real
- 🏗️ **Modular**: Fácil de expandir com novos módulos

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd discord-bot-modular
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp config.env .env

# Edite o .env com suas configurações
```

4. **Configure o .env**
```env
# Discord Bot Configuration
DISCORD_TOKEN=seu_token_do_bot_aqui
CLIENT_ID=seu_client_id_aqui
GUILD_ID=id_do_servidor_para_testes_opcional

# API Configuration
WORKER_URL=https://seu-worker.cloudflare.workers.dev

# Bot Configuration
BOT_PREFIX=!
OWNER_ID=seu_user_id_aqui
```

## 🎯 Comandos

### 🎨 Geração de Imagens
- `/gerar` - Gera imagens usando IA
  - `prompt` (obrigatório): Descrição da imagem
  - `modelo` (opcional): Modelo de IA a usar
  - `steps` (opcional): Qualidade (1-50)

### ⚙️ Administração
- `/admin stats` - Estatísticas do bot
- `/admin ping` - Testa latência
- `/admin rate-limit` - Info sobre rate limiting
- `/admin servers` - Lista servidores

### ❓ Ajuda
- `/help` - Mostra todos os comandos

## 🤖 Modelos de IA

1. **DreamShaper 8 LCM** - Rápido e eficiente (até 20 steps)
2. **Stable Diffusion XL** - Alta qualidade (até 50 steps)
3. **SDXL Lightning** - Super rápido (até 20 steps)

## 🏗️ Estrutura do Projeto

```
src/
├── bot.js                 # Arquivo principal do bot
├── deploy-commands.js     # Deploy dos comandos slash
├── commands/              # Comandos slash
│   ├── gerar.js          # Comando de geração de imagem
│   ├── admin.js          # Comandos de administração
│   └── help.js           # Comando de ajuda
└── modules/              # Módulos do bot
    └── imageGenerator.js # Módulo de geração de imagem
```

## 🚀 Como Executar

1. **Deploy dos comandos** (primeira vez)
```bash
npm run deploy
```

2. **Iniciar o bot**
```bash
npm start
```

3. **Modo desenvolvimento** (com auto-reload)
```bash
npm run dev
```

## 🔧 Configuração do Discord

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá em "Bot" e crie um bot
4. Copie o token e coloque no `.env`
5. Vá em "OAuth2" > "URL Generator"
6. Selecione "bot" e "applications.commands"
7. Copie a URL e adicione o bot ao seu servidor

## 📝 Adicionando Novos Comandos

1. Crie um arquivo em `src/commands/nome-do-comando.js`
2. Use a estrutura:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nome-do-comando')
        .setDescription('Descrição do comando'),
    
    async execute(interaction) {
        // Lógica do comando
    },
};
```

3. Execute `npm run deploy` para registrar o comando

## 🔧 Adicionando Novos Módulos

1. Crie um arquivo em `src/modules/nome-do-modulo.js`
2. Use a estrutura:

```javascript
module.exports = {
    init: (client) => {
        // Inicialização do módulo
        client.meuModulo = new MeuModulo();
    }
};
```

## 🛡️ Rate Limiting

- **Limite**: 5 requisições por usuário por minuto
- **Configurável**: Via variáveis de ambiente
- **Controle**: Automático por usuário

## 📊 Monitoramento

- Estatísticas em tempo real
- Logs detalhados
- Monitoramento de memória
- Controle de uptime

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se todas as variáveis do `.env` estão corretas
2. Confirme se o bot tem as permissões necessárias
3. Verifique os logs do console
4. Teste se o worker está funcionando

## 🔮 Próximas Features

- [ ] Sistema de economia
- [ ] Comandos de música
- [ ] Sistema de tickets
- [ ] Moderação avançada
- [ ] Dashboard web
- [ ] Sistema de níveis
- [ ] Comandos de diversão
