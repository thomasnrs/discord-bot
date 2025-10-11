const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const SystemStats = require('./modules/systemStats');
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

// Inicializar sistema de stats
client.systemStats = new SystemStats();

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Comando carregado: ${command.data.name}`);
        } else {
            console.log(`⚠️  Comando em ${filePath} está faltando propriedades "data" ou "execute"`);
        }
    }
}

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
        const commandsPath = path.join(__dirname, 'commands');
        console.log('📁 Caminho dos comandos:', commandsPath);
        
        if (fs.existsSync(commandsPath)) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            console.log('📄 Arquivos de comando encontrados:', commandFiles);
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(`✅ Comando preparado: ${command.data.name}`);
                }
            }
        } else {
            console.log('❌ Pasta de comandos não encontrada!');
        }
        
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
            const startTime = Date.now();
            const ping = client.ws.ping;
            
            // Criar embed de stats
            const statsEmbed = client.systemStats.createStatsEmbed(ping);
            
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
    
    // Enviar stats imediatamente
    setTimeout(sendStats, 5000); // Aguardar 5 segundos após o bot ficar online
    
    // Configurar intervalo para envio automático
    client.statsInterval = setInterval(sendStats, UPDATE_INTERVAL);
    
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
        
        await command.execute(interaction);
        console.log(`✅ Comando ${interaction.commandName} executado por ${interaction.user.tag}`);
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

// Evento: Mensagem recebida (para contador)
client.on(Events.MessageCreate, message => {
    // Incrementar contador de mensagens (apenas se não for do bot)
    if (!message.author.bot) {
        client.systemStats.incrementMessageCount();
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
