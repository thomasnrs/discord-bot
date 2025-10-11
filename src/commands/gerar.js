const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gerar')
        .setDescription('Gera uma imagem usando IA')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Descreva a imagem que você quer gerar')
                .setRequired(true)
                .setMaxLength(500)),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        
        // Valores padrão
        const modelo = '@cf/stabilityai/stable-diffusion-xl-base-1.0';
        const steps = 20;

        // Verificar rate limiting
        const rateLimitCheck = interaction.client.imageGenerator.checkRateLimit(interaction.user.id);
        if (!rateLimitCheck.allowed) {
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('⏰ Rate Limit Atingido')
                .setDescription(`Você atingiu o limite de requisições. Tente novamente em ${rateLimitCheck.timeLeft} segundos.`)
                .setFooter({ text: `Limite: ${interaction.client.imageGenerator.maxRequests} requisições por minuto` });

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Responder com "processando"
        await interaction.deferReply();

        try {
            // Gerar imagem
            const result = await interaction.client.imageGenerator.generateImage(prompt, modelo, steps);

            if (result.success) {
                // Converter base64 para buffer para anexo
                const base64Data = result.imageUrl.replace(/^data:image\/[a-z]+;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                
                const timestamp = Date.now();
                const filename = `imagem-${timestamp}.png`;
                const attachment = new AttachmentBuilder(imageBuffer, { 
                    name: filename 
                });

                // Criar embed de sucesso
                const embed = new EmbedBuilder()
                    .setColor('#00ff88')
                    .setTitle('🎨 Imagem Gerada com Sucesso!')
                    .setDescription(`**Prompt:** ${result.prompt}`)
                    .addFields(
                        { name: '🤖 Modelo', value: result.model, inline: true },
                        { name: '⚙️ Steps', value: result.steps.toString(), inline: true },
                        { name: '👤 Usuário', value: interaction.user.toString(), inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ 
                        text: `Gerado por ${interaction.user.username}`, 
                        iconURL: interaction.user.displayAvatarURL() 
                    });

                await interaction.editReply({ 
                    embeds: [embed], 
                    files: [attachment] 
                });

                // Log de sucesso - versão corrigida
                console.log(`✅ Imagem gerada para ${interaction.user.tag}: ${prompt.substring(0, 50)}...`);

            } else {
                throw new Error('Falha na geração da imagem');
            }

        } catch (error) {
            console.error('❌ Erro no comando gerar:', error);

            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro na Geração')
                .setDescription(`**Erro:** ${error.message}`)
                .addFields(
                    { name: '💡 Dicas', value: '• Tente um prompt mais simples\n• Verifique se o worker está funcionando\n• Tente novamente em alguns segundos' }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
};
