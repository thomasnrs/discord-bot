const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa um usuário do servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para expulsar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo da expulsão')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';

        // Verificar se o usuário pode ser expulso
        if (targetUser.id === interaction.user.id) {
            return await interaction.reply({
                content: '❌ Você não pode se expulsar!',
                ephemeral: true
            });
        }

        if (targetUser.id === interaction.client.user.id) {
            return await interaction.reply({
                content: '❌ Eu não posso me expulsar!',
                ephemeral: true
            });
        }

        const member = interaction.guild.members.cache.get(targetUser.id);
        if (!member) {
            return await interaction.reply({
                content: '❌ Usuário não encontrado no servidor!',
                ephemeral: true
            });
        }

        // Verificar hierarquia de cargos
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return await interaction.reply({
                content: '❌ Você não pode expulsar este usuário devido à hierarquia de cargos!',
                ephemeral: true
            });
        }

        try {
            // Expulsar o usuário
            await member.kick(reason);

            // Criar embed de confirmação
            const embed = new EmbedBuilder()
                .setColor('#ff8800')
                .setTitle('👢 Usuário Expulso')
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '👤 Usuário', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                    { name: '📝 Motivo', value: reason, inline: false }
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
                    .setColor('#ff8800')
                    .setTitle('📋 Log de Moderação - Kick')
                    .addFields(
                        { name: '👤 Usuário Expulso', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                        { name: '📝 Motivo', value: reason, inline: false },
                        { name: '⏰ Data', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error('❌ Erro ao expulsar usuário:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro ao Expulsar')
                .setDescription('Não foi possível expulsar o usuário. Verifique as permissões e tente novamente.')
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
