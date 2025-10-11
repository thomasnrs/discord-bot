const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verificationsetup')
        .setDescription('Configura o sistema de verificação do servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const verificationSystem = interaction.client.verificationSystem;
        
        await interaction.deferReply({ ephemeral: true });

        try {
            // Recriar mensagem de verificação
            await verificationSystem.createVerificationMessage();

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('✅ Sistema de Verificação Configurado')
                .setDescription('O sistema de verificação foi configurado com sucesso!')
                .addFields(
                    { name: '🏠 Servidor', value: 'Nebula Friends', inline: true },
                    { name: '📺 Canal', value: `<#${verificationSystem.verificationChannelId}>`, inline: true },
                    { name: '🔐 Cargo Não Verificado', value: `<@&${verificationSystem.unverifiedRoleId}>`, inline: true },
                    { name: '✅ Cargo Verificado', value: `<@&${verificationSystem.verifiedRoleId}>`, inline: true },
                    { name: '📝 Mensagem', value: verificationSystem.verificationMessageId ? 'Criada' : 'Erro ao criar', inline: true },
                    { name: '🔄 Status', value: 'Ativo', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Nebula Friends • Sistema de Verificação' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro no comando verificationsetup:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro na Configuração')
                .setDescription('Ocorreu um erro ao configurar o sistema de verificação.')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
