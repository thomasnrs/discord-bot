const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelboard')
        .setDescription('Mostra o ranking de níveis'),

    async execute(interaction) {
        const levelSystem = interaction.client.levelSystem;
        const db = interaction.client.database;
        
        // Obter todos os usuários de nível
        const levelData = db.getCollection('levels');
        const users = Object.values(levelData);
        
        // Ordenar por nível e XP
        users.sort((a, b) => {
            if (b.level !== a.level) {
                return b.level - a.level;
            }
            return b.totalXp - a.totalXp;
        });
        
        const embed = levelSystem.createLevelLeaderboard(users, '🏆 Ranking de Níveis');
        
        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
