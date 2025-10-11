const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Mostra seu perfil de nível')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para ver o perfil (opcional)')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const levelSystem = interaction.client.levelSystem;
        const db = interaction.client.database;
        
        const userLevel = db.getUserLevel(targetUser.id);
        const progress = levelSystem.getLevelProgress(targetUser.id, db);
        const embed = levelSystem.createLevelEmbed(targetUser, userLevel, progress);
        
        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
