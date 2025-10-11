const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Mostra o ranking dos usuários mais ricos'),

    async execute(interaction) {
        const economy = interaction.client.economy;
        const db = economy.db;
        
        // Obter todos os usuários da economia
        const economyData = db.getCollection('economy');
        const users = Object.values(economyData);
        
        // Ordenar por total de dinheiro
        users.sort((a, b) => (b.money + b.bank) - (a.money + a.bank));
        
        const embed = economy.createLeaderboardEmbed(users, '🏆 Ranking dos Mais Ricos');
        
        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
