const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verificationstats')
        .setDescription('Mostra estatísticas do sistema de verificação')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const verificationSystem = interaction.client.verificationSystem;
        const stats = verificationSystem.getStats();
        
        try {
            // Buscar informações do servidor
            const guild = interaction.guild;
            const unverifiedRole = guild.roles.cache.get(stats.unverifiedRoleId);
            const verifiedRole = guild.roles.cache.get(stats.verifiedRoleId);
            const channel = guild.channels.cache.get(stats.verificationChannelId);

            // Contar membros por cargo
            const unverifiedCount = unverifiedRole ? unverifiedRole.members.size : 0;
            const verifiedCount = verifiedRole ? verifiedRole.members.size : 0;
            const totalMembers = guild.memberCount;

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('📊 Estatísticas do Sistema de Verificação')
                .setDescription('Informações sobre o sistema de verificação do Nebula Friends')
                .addFields(
                    { name: '🏠 Servidor', value: 'Nebula Friends', inline: true },
                    { name: '📺 Canal de Verificação', value: channel ? `<#${stats.verificationChannelId}>` : '❌ Não encontrado', inline: true },
                    { name: '📝 Mensagem de Verificação', value: stats.verificationMessageId ? '✅ Criada' : '❌ Não criada', inline: true },
                    { name: '👥 Total de Membros', value: `\`${totalMembers}\``, inline: true },
                    { name: '🔐 Não Verificados', value: `\`${unverifiedCount}\``, inline: true },
                    { name: '✅ Verificados', value: `\`${verifiedCount}\``, inline: true },
                    { name: '📈 Taxa de Verificação', value: `\`${totalMembers > 0 ? ((verifiedCount / totalMembers) * 100).toFixed(1) : 0}%\``, inline: true }
                )
                .addFields(
                    { name: '🔐 Cargo Não Verificado', value: unverifiedRole ? `<@&${stats.unverifiedRoleId}>` : '❌ Não encontrado', inline: true },
                    { name: '✅ Cargo Verificado', value: verifiedRole ? `<@&${stats.verifiedRoleId}>` : '❌ Não encontrado', inline: true },
                    { name: '🔄 Status do Sistema', value: '🟢 Ativo', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Nebula Friends • Sistema de Verificação' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro no comando verificationstats:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro ao Buscar Estatísticas')
                .setDescription('Ocorreu um erro ao buscar as estatísticas do sistema de verificação.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
