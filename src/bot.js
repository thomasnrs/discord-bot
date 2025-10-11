const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
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
        
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        
        if (fs.existsSync(commandsPath)) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                }
            }
        }
        
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        
        // Deploy global
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log(`✅ Deploy automático concluído! ${commands.length} comandos registrados.`);
        
        // Deploy no servidor específico (mais rápido)
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`✅ Comandos registrados no servidor específico!`);
        }
        
    } catch (error) {
        console.error('❌ Erro no deploy automático:', error);
    }
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
