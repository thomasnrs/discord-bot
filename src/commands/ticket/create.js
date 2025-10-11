const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Cria um ticket de suporte')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Categoria do ticket')
                .setRequired(true)
                .addChoices(
                    { name: '🐛 Bug Report', value: 'Bug Report' },
                    { name: '💡 Sugestão', value: 'Sugestão' },
                    { name: '❓ Dúvida', value: 'Dúvida' },
                    { name: '⚠️ Denúncia', value: 'Denúncia' },
                    { name: '🔧 Suporte Técnico', value: 'Suporte Técnico' },
                    { name: '💰 Problema de Pagamento', value: 'Problema de Pagamento' },
                    { name: '🎵 Problema com Música', value: 'Problema com Música' },
                    { name: '🎮 Outro', value: 'Outro' }
                ))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do ticket')
                .setRequired(false)),

    async execute(interaction) {
        const category = interaction.options.getString('categoria');
        const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';
        const ticketSystem = interaction.client.ticketSystem;
        
        await interaction.deferReply({ ephemeral: true });

        const result = await ticketSystem.createTicket(interaction, category, reason);
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('✅ Ticket Criado')
                .setDescription(`Seu ticket foi criado com sucesso!`)
                .addFields(
                    { name: '🎫 Canal', value: result.channel.toString(), inline: true },
                    { name: '📝 Categoria', value: category, inline: true },
                    { name: '📄 Motivo', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro')
                .setDescription(result.message)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
