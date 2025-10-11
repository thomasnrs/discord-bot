const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um usuário do servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para banir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do banimento')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('dias')
                .setDescription('Dias para deletar mensagens (0-7)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(7))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';
        const deleteDays = interaction.options.getInteger('dias') || 0;

        // Verificar se o usuário pode ser banido
        if (targetUser.id === interaction.user.id) {
            return await interaction.reply({
                content: '❌ Você não pode se banir!',
                ephemeral: true
            });
        }

        if (targetUser.id === interaction.client.user.id) {
            return await interaction.reply({
                content: '❌ Eu não posso me banir!',
                ephemeral: true
            });
        }

        // Verificar hierarquia de cargos
        const member = interaction.guild.members.cache.get(targetUser.id);
        if (member) {
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return await interaction.reply({
                    content: '❌ Você não pode banir este usuário devido à hierarquia de cargos!',
                    ephemeral: true
                });
            }
        }

        try {
            // Banir o usuário
            await interaction.guild.members.ban(targetUser, {
                reason: reason,
                deleteMessageDays: deleteDays
            });

            // Criar embed de confirmação
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('🔨 Usuário Banido')
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '👤 Usuário', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                    { name: '📝 Motivo', value: reason, inline: false },
                    { name: '🗑️ Mensagens Deletadas', value: `${deleteDays} dias`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Sistema de Moderação' });

            await interaction.reply({ embeds: [embed] });

            // Log de moderação
            const logChannel = interaction.guild.channels.cache.find(channel => 
                channel.name.includes('log') || channel.name.includes('mod')
            );

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ff4444')
                    .setTitle('📋 Log de Moderação - Ban')
                    .addFields(
                        { name: '👤 Usuário Banido', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                        { name: '📝 Motivo', value: reason, inline: false },
                        { name: '🗑️ Mensagens Deletadas', value: `${deleteDays} dias`, inline: true },
                        { name: '⏰ Data', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error('❌ Erro ao banir usuário:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro ao Banir')
                .setDescription('Não foi possível banir o usuário. Verifique as permissões e tente novamente.')
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
