const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Mostra informações sobre os comandos do bot'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🤖 Comandos do Bot')
            .setDescription('Aqui estão todos os comandos disponíveis:')
            .addFields(
                {
                    name: '🎨 Geração de Imagens',
                    value: '`/gerar` - Gera imagens usando IA\n' +
                           '• **prompt** (obrigatório): Descreva a imagem\n' +
                           '• **modelo** (opcional): Escolha o modelo de IA\n' +
                           '• **steps** (opcional): Qualidade da imagem (1-50)',
                    inline: false
                },
                {
                    name: '⚙️ Administração',
                    value: '`/admin stats` - Estatísticas do bot\n' +
                           '`/admin ping` - Testa latência\n' +
                           '`/admin rate-limit` - Info sobre rate limiting\n' +
                           '`/admin servers` - Lista servidores',
                    inline: false
                },
                {
                    name: '❓ Ajuda',
                    value: '`/help` - Mostra esta mensagem',
                    inline: false
                }
            )
            .addFields(
                {
                    name: '🤖 Modelos Disponíveis',
                    value: '• **DreamShaper 8 LCM**: Rápido e eficiente (até 20 steps)\n' +
                           '• **Stable Diffusion XL**: Alta qualidade (até 50 steps)\n' +
                           '• **SDXL Lightning**: Super rápido (até 20 steps)',
                    inline: false
                },
                {
                    name: '💡 Dicas',
                    value: '• Seja específico no seu prompt\n' +
                           '• Use mais steps para melhor qualidade\n' +
                           '• Há limite de 5 requisições por minuto\n' +
                           '• Comandos de admin precisam de permissão',
                    inline: false
                }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ 
                text: `Bot criado por ${interaction.client.user.username}`, 
                iconURL: interaction.client.user.displayAvatarURL() 
            });

        await interaction.reply({ embeds: [embed] });
    },
};
