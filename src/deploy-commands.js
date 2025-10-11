const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`✅ Comando preparado para deploy: ${command.data.name}`);
        } else {
            console.log(`⚠️  Comando em ${filePath} está faltando propriedades "data" ou "execute"`);
        }
    }
}

// Configurar REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy dos comandos
(async () => {
    try {
        console.log(`🔄 Iniciando deploy de ${commands.length} comandos...`);

        // Deploy global (pode levar até 1 hora para propagar)
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ Deploy concluído! ${data.length} comandos registrados globalmente.`);
        
        // Se quiser deploy apenas para um servidor específico (mais rápido para testes)
        if (process.env.GUILD_ID) {
            const guildData = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`✅ Deploy no servidor concluído! ${guildData.length} comandos registrados.`);
        }
        
    } catch (error) {
        console.error('❌ Erro no deploy:', error);
    }
})();
