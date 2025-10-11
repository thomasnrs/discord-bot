const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

class VerificationSystem {
    constructor() {
        this.guildId = '1402731113239023616'; // ID do servidor Nebula Friends
        this.unverifiedRoleId = '1404205796375527536'; // Cargo de não verificado
        this.verifiedRoleId = '1404205659922235474'; // Cargo de verificado
        this.verificationChannelId = '1404204595298963546'; // Canal de verificação
        this.verificationMessageId = null; // ID da mensagem de verificação
    }

    // Inicializar sistema de verificação
    init(client) {
        this.client = client;
        console.log('🔐 Sistema de verificação inicializado para Nebula Friends');
        
        // Configurar eventos
        this.setupEvents();
        
        // Criar mensagem de verificação se não existir
        this.createVerificationMessage();
    }

    // Configurar eventos
    setupEvents() {
        // Evento: Membro entra no servidor
        this.client.on('guildMemberAdd', async (member) => {
            if (member.guild.id !== this.guildId) return;
            
            try {
                // Dar cargo de não verificado
                const unverifiedRole = member.guild.roles.cache.get(this.unverifiedRoleId);
                if (unverifiedRole) {
                    await member.roles.add(unverifiedRole);
                    console.log(`🔐 Cargo de não verificado dado para ${member.user.tag}`);
                }

                // Enviar mensagem de boas-vindas
                await this.sendWelcomeMessage(member);
                
            } catch (error) {
                console.error('❌ Erro ao processar novo membro:', error);
            }
        });

        // Evento: Reação adicionada
        this.client.on('messageReactionAdd', async (reaction, user) => {
            if (user.bot) return;
            if (reaction.message.id !== this.verificationMessageId) return;
            
            try {
                await this.handleVerification(reaction, user);
            } catch (error) {
                console.error('❌ Erro ao processar verificação:', error);
            }
        });
    }

    // Criar mensagem de verificação
    async createVerificationMessage() {
        try {
            const channel = this.client.channels.cache.get(this.verificationChannelId);
            if (!channel) {
                console.log('❌ Canal de verificação não encontrado!');
                return;
            }

            // Verificar se já existe mensagem de verificação
            const messages = await channel.messages.fetch({ limit: 50 });
            const existingMessage = messages.find(msg => 
                msg.author.id === this.client.user.id && 
                msg.embeds.length > 0 && 
                msg.embeds[0].title && 
                msg.embeds[0].title.includes('Verificação')
            );

            if (existingMessage) {
                this.verificationMessageId = existingMessage.id;
                console.log('📝 Mensagem de verificação já existe');
                return;
            }

            // Criar embed de verificação
            const embed = this.createVerificationEmbed();
            
            // Criar botões de verificação
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_button')
                        .setLabel('✅ Verificar')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅')
                );

            // Enviar mensagem
            const message = await channel.send({ 
                embeds: [embed], 
                components: [row] 
            });

            this.verificationMessageId = message.id;
            console.log('📝 Mensagem de verificação criada');

        } catch (error) {
            console.error('❌ Erro ao criar mensagem de verificação:', error);
        }
    }

    // Criar embed de verificação
    createVerificationEmbed() {
        return new EmbedBuilder()
            .setColor('#7289da')
            .setTitle('🔐 Verificação - Nebula Friends')
            .setDescription(`
**Bem-vindo ao servidor Nebula Friends!** 🌟

Para acessar o servidor, você precisa se verificar primeiro.

**Como se verificar:**
• Clique no botão **"✅ Verificar"** abaixo
• Ou reaja com ✅ na mensagem
• Aguarde alguns segundos para receber o cargo de verificado

**Após a verificação você terá acesso a:**
• Todos os canais do servidor
• Sistema de economia e níveis
• Comandos de música e diversão
• Sistema de tickets e suporte
• E muito mais!

**Regras importantes:**
• Seja respeitoso com todos
• Não faça spam ou flood
• Mantenha o chat organizado
• Divirta-se! 🎉
            `)
            .addFields(
                { name: '👥 Servidor', value: 'Nebula Friends', inline: true },
                { name: '🔐 Status', value: 'Aguardando verificação', inline: true },
                { name: '⏰ Tempo', value: 'Instantâneo', inline: true }
            )
            .setThumbnail('https://cdn.discordapp.com/emojis/1234567890123456789.png') // Emoji de verificação
            .setFooter({ 
                text: 'Nebula Friends • Sistema de Verificação Automático',
                iconURL: this.client.user?.displayAvatarURL()
            })
            .setTimestamp();
    }

    // Enviar mensagem de boas-vindas
    async sendWelcomeMessage(member) {
        try {
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('🌟 Bem-vindo ao Nebula Friends!')
                .setDescription(`
Olá **${member.user.username}**! 👋

Você foi adicionado ao servidor **Nebula Friends**!

**Próximos passos:**
1. Vá para o canal <#${this.verificationChannelId}>
2. Clique no botão "✅ Verificar" ou reaja com ✅
3. Aguarde receber o cargo de verificado
4. Explore o servidor e divirta-se!

**Recursos disponíveis após verificação:**
• 🎵 Sistema de música
• 💰 Sistema de economia
• 🎫 Sistema de tickets
• 📈 Sistema de níveis
• 🎮 Comandos de diversão
• 📰 Notícias de cibersegurança
• E muito mais!
                `)
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: 'Nebula Friends • Boas-vindas' })
                .setTimestamp();

            await member.send({ embeds: [embed] });
            console.log(`📨 Mensagem de boas-vindas enviada para ${member.user.tag}`);

        } catch (error) {
            console.error('❌ Erro ao enviar mensagem de boas-vindas:', error);
        }
    }

    // Processar verificação
    async handleVerification(reaction, user) {
        try {
            const member = reaction.message.guild.members.cache.get(user.id);
            if (!member) return;

            // Verificar se já está verificado
            if (member.roles.cache.has(this.verifiedRoleId)) {
                return;
            }

            // Verificar se tem cargo de não verificado
            if (!member.roles.cache.has(this.unverifiedRoleId)) {
                return;
            }

            // Remover cargo de não verificado
            const unverifiedRole = member.guild.roles.cache.get(this.unverifiedRoleId);
            if (unverifiedRole) {
                await member.roles.remove(unverifiedRole);
            }

            // Adicionar cargo de verificado
            const verifiedRole = member.guild.roles.cache.get(this.verifiedRoleId);
            if (verifiedRole) {
                await member.roles.add(verifiedRole);
            }

            // Enviar mensagem de confirmação
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('✅ Verificação Concluída!')
                .setDescription(`
**Parabéns ${member.user.username}!** 🎉

Você foi verificado com sucesso no servidor **Nebula Friends**!

**Agora você tem acesso a:**
• Todos os canais do servidor
• Sistema de economia e níveis
• Comandos de música e diversão
• Sistema de tickets e suporte
• Notícias de cibersegurança
• E muito mais!

**Divirta-se no servidor!** 🌟
                `)
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: 'Nebula Friends • Verificação Concluída' })
                .setTimestamp();

            await member.send({ embeds: [embed] });
            console.log(`✅ ${member.user.tag} foi verificado com sucesso!`);

        } catch (error) {
            console.error('❌ Erro ao processar verificação:', error);
        }
    }

    // Processar clique no botão
    async handleButtonClick(interaction) {
        if (interaction.customId !== 'verify_button') return;
        if (interaction.message.id !== this.verificationMessageId) return;

        try {
            const member = interaction.member;

            // Verificar se já está verificado
            if (member.roles.cache.has(this.verifiedRoleId)) {
                const embed = new EmbedBuilder()
                    .setColor('#ff8800')
                    .setTitle('⚠️ Já Verificado')
                    .setDescription('Você já está verificado no servidor!')
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Verificar se tem cargo de não verificado
            if (!member.roles.cache.has(this.unverifiedRoleId)) {
                const embed = new EmbedBuilder()
                    .setColor('#ff4444')
                    .setTitle('❌ Erro na Verificação')
                    .setDescription('Você não tem o cargo de não verificado. Entre no servidor primeiro!')
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Processar verificação
            await this.processVerification(member);

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('✅ Verificação Concluída!')
                .setDescription('Você foi verificado com sucesso! Agora tem acesso completo ao servidor.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('❌ Erro ao processar botão de verificação:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro na Verificação')
                .setDescription('Ocorreu um erro ao processar sua verificação. Tente novamente mais tarde.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    // Processar verificação (função auxiliar)
    async processVerification(member) {
        // Remover cargo de não verificado
        const unverifiedRole = member.guild.roles.cache.get(this.unverifiedRoleId);
        if (unverifiedRole) {
            await member.roles.remove(unverifiedRole);
        }

        // Adicionar cargo de verificado
        const verifiedRole = member.guild.roles.cache.get(this.verifiedRoleId);
        if (verifiedRole) {
            await member.roles.add(verifiedRole);
        }

        console.log(`✅ ${member.user.tag} foi verificado via botão!`);
    }

    // Obter estatísticas do sistema
    getStats() {
        return {
            guildId: this.guildId,
            unverifiedRoleId: this.unverifiedRoleId,
            verifiedRoleId: this.verifiedRoleId,
            verificationChannelId: this.verificationChannelId,
            verificationMessageId: this.verificationMessageId
        };
    }
}

module.exports = VerificationSystem;
