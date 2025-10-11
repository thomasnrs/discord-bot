const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const SystemStats = require('./modules/systemStats');
const Database = require('./modules/database');
const Economy = require('./modules/economy');
const MusicSystem = require('./modules/music');
const TicketSystem = require('./modules/ticketSystem');
const LevelSystem = require('./modules/levelSystem');
const WebDashboard = require('./web/dashboard');
require('dotenv').config();

// Criar cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

// Coleção para comandos
client.commands = new Collection();

// Inicializar sistemas
client.systemStats = new SystemStats();
client.database = new Database();
client.economy = new Economy();
client.musicSystem = new MusicSystem(client);
client.ticketSystem = new TicketSystem();
client.levelSystem = new LevelSystem();

// Carregar comandos (incluindo subpastas)
function loadCommands(dir) {
    const commandsPath = path.join(__dirname, 'commands', dir);
    if (!fs.existsSync(commandsPath)) return;
    
    const items = fs.readdirSync(commandsPath);
    
    for (const item of items) {
        const itemPath = path.join(commandsPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            // Carregar comandos de subpastas
            loadCommands(path.join(dir, item));
        } else if (item.endsWith('.js')) {
            const command = require(itemPath);
            
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Comando carregado: ${command.data.name}`);
            } else {
                console.log(`⚠️  Comando em ${itemPath} está faltando propriedades "data" ou "execute"`);
            }
        }
    }
}

// Carregar comandos da pasta raiz e subpastas
loadCommands('');

// Carregar módulos
const modulesPath = path.join(__dirname, 'modules');
if (fs.existsSync(modulesPath)) {
    const moduleFiles = fs.readdirSync(modulesPath).filter(file => file.endsWith('.js'));
    
    for (const file of moduleFiles) {
        const filePath = path.join(modulesPath, file);
        const module = require(filePath);
        
        if (typeof module.init === 'function') {
            module.init(client);
            console.log(`🔧 Módulo carregado: ${file}`);
        }
    }
}

// Função para deploy automático dos comandos
async function deployCommands() {
    try {
        console.log('🔄 Iniciando deploy automático dos comandos...');
        console.log('🔍 Verificando variáveis de ambiente...');
        console.log('DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? '✅ Configurado' : '❌ Não configurado');
        console.log('CLIENT_ID:', process.env.CLIENT_ID ? '✅ Configurado' : '❌ Não configurado');
        console.log('GUILD_ID:', process.env.GUILD_ID ? '✅ Configurado' : '❌ Não configurado');
        
        const commands = [];
        
        // Função para carregar comandos de subpastas
        function loadCommandsForDeploy(dir) {
            const commandsPath = path.join(__dirname, 'commands', dir);
            if (!fs.existsSync(commandsPath)) return;
            
            const items = fs.readdirSync(commandsPath);
            
            for (const item of items) {
                const itemPath = path.join(commandsPath, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    loadCommandsForDeploy(path.join(dir, item));
                } else if (item.endsWith('.js')) {
                    const command = require(itemPath);
                    
                    if ('data' in command && 'execute' in command) {
                        commands.push(command.data.toJSON());
                        console.log(`✅ Comando preparado: ${command.data.name}`);
                    }
                }
            }
        }
        
        loadCommandsForDeploy('');
        
        console.log(`📊 Total de comandos preparados: ${commands.length}`);
        
        if (commands.length === 0) {
            console.log('❌ Nenhum comando encontrado para deploy!');
            return;
        }
        
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        
        // Deploy global
        console.log('🌐 Fazendo deploy global...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log(`✅ Deploy global concluído! ${commands.length} comandos registrados.`);
        
        // Deploy no servidor específico (mais rápido)
        if (process.env.GUILD_ID) {
            console.log('🏠 Fazendo deploy no servidor específico...');
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`✅ Comandos registrados no servidor específico!`);
        }
        
    } catch (error) {
        console.error('❌ Erro no deploy automático:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Função para iniciar o sistema de stats automático
function startAutoStats() {
    const STATS_CHANNEL_ID = '1426577469284024420'; // ID do canal para stats
    const UPDATE_INTERVAL = 30000; // 30 segundos
    
    console.log('📊 Iniciando sistema de stats automático...');
    console.log(`📺 Canal de stats: ${STATS_CHANNEL_ID}`);
    console.log(`⏰ Intervalo de atualização: ${UPDATE_INTERVAL / 1000} segundos`);
    
    // Função para enviar stats
    async function sendStats() {
        try {
            const channel = client.channels.cache.get(STATS_CHANNEL_ID);
            
            if (!channel) {
                console.log('❌ Canal de stats não encontrado!');
                return;
            }
            
            // Calcular ping
            const ping = client.ws.ping;
            
            // Criar embed de stats
            const statsEmbed = client.systemStats.createStatsEmbed(ping);
            
            // Tentar encontrar a última mensagem de stats do bot
            if (!client.lastStatsMessage) {
                try {
                    // Buscar a última mensagem do bot no canal
                    const messages = await channel.messages.fetch({ limit: 50 });
                    const botMessages = messages.filter(msg => 
                        msg.author.id === client.user.id && 
                        msg.embeds.length > 0 && 
                        msg.embeds[0].title && 
                        msg.embeds[0].title.includes('Estatísticas do Bot')
                    );
                    
                    if (botMessages.size > 0) {
                        client.lastStatsMessage = botMessages.first();
                        console.log('📊 Mensagem de stats anterior encontrada, reutilizando...');
                    }
                } catch (error) {
                    console.log('⚠️ Erro ao buscar mensagem anterior:', error.message);
                }
            }
            
            // Enviar ou editar mensagem
            if (client.lastStatsMessage) {
                try {
                    await client.lastStatsMessage.edit({ embeds: [statsEmbed] });
                    console.log('📊 Stats atualizados no canal');
                } catch (error) {
                    console.log('⚠️ Erro ao editar mensagem de stats, enviando nova...');
                    client.lastStatsMessage = await channel.send({ embeds: [statsEmbed] });
                }
            } else {
                client.lastStatsMessage = await channel.send({ embeds: [statsEmbed] });
                console.log('📊 Primeira mensagem de stats enviada');
            }
            
        } catch (error) {
            console.error('❌ Erro ao enviar stats automático:', error);
        }
    }
    
    // Função para limpar mensagens antigas de stats (opcional)
    async function cleanupOldStats() {
        try {
            const channel = client.channels.cache.get(STATS_CHANNEL_ID);
            if (!channel) return;
            
            // Buscar mensagens antigas de stats
            const messages = await channel.messages.fetch({ limit: 100 });
            const statsMessages = messages.filter(msg => 
                msg.author.id === client.user.id && 
                msg.embeds.length > 0 && 
                msg.embeds[0].title && 
                msg.embeds[0].title.includes('Estatísticas do Bot')
            );
            
            // Manter apenas as 3 mensagens mais recentes
            if (statsMessages.size > 3) {
                const messagesToDelete = statsMessages.array().slice(3);
                for (const msg of messagesToDelete) {
                    try {
                        await msg.delete();
                        console.log('🗑️ Mensagem antiga de stats removida');
                    } catch (error) {
                        console.log('⚠️ Erro ao deletar mensagem antiga:', error.message);
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Erro na limpeza de mensagens antigas:', error.message);
        }
    }
    
    // Enviar stats imediatamente
    setTimeout(sendStats, 5000); // Aguardar 5 segundos após o bot ficar online
    
    // Configurar intervalo para envio automático
    client.statsInterval = setInterval(sendStats, UPDATE_INTERVAL);
    
    // Limpar mensagens antigas a cada 10 minutos
    client.cleanupInterval = setInterval(cleanupOldStats, 600000);
    
    console.log('✅ Sistema de stats automático iniciado!');
}

// Evento: Bot pronto
client.once(Events.ClientReady, async readyClient => {
    console.log(`🚀 Bot ${readyClient.user.tag} está online!`);
    console.log(`📊 Servidores: ${client.guilds.cache.size}`);
    console.log(`👥 Usuários: ${client.users.cache.size}`);
    
    // Fazer deploy dos comandos
    await deployCommands();
    
    // Definir status do bot
    client.user.setActivity('gerando imagens incríveis!', { type: 'PLAYING' });
    
    // Iniciar sistema de stats automático
    startAutoStats();
    
    // Iniciar dashboard web
    const dashboard = new WebDashboard(client);
    dashboard.start();
});

// Evento: Interação de comando
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`❌ Comando ${interaction.commandName} não encontrado.`);
        return;
    }

    try {
        // Incrementar contador de comandos
        client.systemStats.incrementCommandCount();
        
        // Sistema de níveis para comandos
        const levelResult = client.levelSystem.addCommandXp(interaction.user.id, client.database);
        
        await command.execute(interaction);
        console.log(`✅ Comando ${interaction.commandName} executado por ${interaction.user.tag}`);
        
        // Notificar level up se necessário
        if (levelResult.leveledUp) {
            const embed = client.levelSystem.createLevelUpEmbed(interaction.user, levelResult.newLevel, levelResult.oldLevel);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
        }
    } catch (error) {
        console.error(`❌ Erro ao executar comando ${interaction.commandName}:`, error);
        
        const errorMessage = {
            content: '❌ Ocorreu um erro ao executar este comando!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Evento: Mensagem recebida (para contador e sistema de níveis)
client.on(Events.MessageCreate, async message => {
    // Incrementar contador de mensagens (apenas se não for do bot)
    if (!message.author.bot) {
        client.systemStats.incrementMessageCount();
        
        // Sistema de níveis
        const levelResult = client.levelSystem.addMessageXp(message.author.id, client.database);
        
        if (levelResult.leveledUp) {
            const embed = client.levelSystem.createLevelUpEmbed(message.author, levelResult.newLevel, levelResult.oldLevel);
            await message.channel.send({ embeds: [embed] });
        }
    }
});

// Evento: Erro não capturado
process.on('unhandledRejection', error => {
    console.error('❌ Erro não capturado:', error);
});

// Evento: Aviso
process.on('warning', warning => {
    console.warn('⚠️  Aviso:', warning);
});

// Login do bot
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Erro ao fazer login:', error);
    process.exit(1);
});

module.exports = client;
