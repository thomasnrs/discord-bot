const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

class TicketSystem {
    constructor() {
        this.ticketCategoryId = '1426614509069533306'; // Categoria específica para tickets
        this.ticketPanelChannelId = null; // Será definido quando criar o canal
        this.adminRoleId = '1404206347041505461'; // Cargo de admin
        this.autoCloseTime = parseInt(process.env.TICKET_AUTO_CLOSE_TIME) || 600000; // 10 minutos
        this.tickets = new Map(); // Armazenar informações dos tickets
        this.ticketCounter = 0; // Contador de tickets
        this.ticketLogs = new Map(); // Logs dos tickets
    }

    // Inicializar sistema de tickets
    init(client) {
        this.client = client;
        console.log('🎫 Sistema de tickets inicializado');
        
        // Criar canal de painel se não existir
        this.createTicketPanel();
    }

    // Criar canal de painel de tickets
    async createTicketPanel() {
        try {
            const guild = this.client.guilds.cache.get(process.env.GUILD_ID);
            if (!guild) {
                console.log('❌ Servidor não encontrado para criar painel de tickets');
                return;
            }

            // Buscar categoria de tickets
            const category = guild.channels.cache.get(this.ticketCategoryId);
            if (!category) {
                console.log('❌ Categoria de tickets não encontrada');
                return;
            }

            // Verificar se já existe canal de painel
            const existingPanel = category.children.cache.find(channel => 
                channel.name.includes('painel-tickets') || 
                channel.name.includes('ticket-panel')
            );

            if (existingPanel) {
                this.ticketPanelChannelId = existingPanel.id;
                console.log('📋 Canal de painel de tickets já existe');
                return;
            }

            // Criar canal de painel
            const panelChannel = await guild.channels.create({
                name: '🎫-painel-tickets',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                        deny: [PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: this.adminRoleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages
                        ]
                    }
                ]
            });

            this.ticketPanelChannelId = panelChannel.id;

            // Enviar painel de tickets
            await this.sendTicketPanel(panelChannel);
            console.log('📋 Painel de tickets criado');

        } catch (error) {
            console.error('❌ Erro ao criar painel de tickets:', error);
        }
    }

    // Enviar painel de tickets
    async sendTicketPanel(channel) {
        const embed = this.createTicketPanelEmbed();
        const row = this.createTicketPanelButtons();

        await channel.send({ 
            embeds: [embed], 
            components: [row] 
        });
    }

    // Criar embed do painel de tickets
    createTicketPanelEmbed() {
        return new EmbedBuilder()
            .setColor('#7289da')
            .setTitle('🎫 Sistema de Tickets - Nebula Friends')
            .setDescription(`
**Bem-vindo ao sistema de tickets!** 🌟

Aqui você pode criar um ticket para receber suporte da nossa equipe.

**📋 Como usar:**
• Clique no botão **"Abrir Ticket"** abaixo
• Escolha a categoria do seu problema
• Descreva detalhadamente sua questão
• Aguarde um administrador responder

**🎯 Categorias disponíveis:**
• **🐛 Bug Report** - Reportar problemas técnicos
• **💡 Sugestão** - Sugerir melhorias
• **❓ Dúvida** - Tirar dúvidas gerais
• **🚨 Denúncia** - Reportar comportamentos inadequados
• **🔧 Suporte** - Suporte técnico
• **💰 Economia** - Problemas com sistema de economia
• **🎵 Música** - Problemas com sistema de música
• **🎫 Outros** - Outras questões

**⚠️ Regras importantes:**
• Seja respeitoso com a equipe
• Descreva seu problema de forma clara
• Não abuse do sistema de tickets
• Aguarde a resposta da equipe
            `)
            .addFields(
                { name: '👥 Equipe', value: 'Administradores e Staff', inline: true },
                { name: '⏰ Resposta', value: 'Até 24 horas', inline: true },
                { name: '📞 Status', value: '🟢 Online', inline: true }
            )
            .setThumbnail('https://cdn.discordapp.com/emojis/1234567890123456789.png')
            .setFooter({ 
                text: 'Nebula Friends • Sistema de Tickets',
                iconURL: this.client.user?.displayAvatarURL()
            })
            .setTimestamp();
    }

    // Criar botões do painel de tickets
    createTicketPanelButtons() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('open_ticket')
                    .setLabel('🎫 Abrir Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );
    }

    // Criar menu de seleção de categoria
    createCategorySelectMenu() {
        return new StringSelectMenuBuilder()
            .setCustomId('ticket_category')
            .setPlaceholder('Escolha a categoria do seu ticket')
            .addOptions([
                new StringSelectMenuOptionBuilder()
                    .setLabel('🐛 Bug Report')
                    .setDescription('Reportar problemas técnicos')
                    .setValue('bug')
                    .setEmoji('🐛'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('💡 Sugestão')
                    .setDescription('Sugerir melhorias')
                    .setValue('suggestion')
                    .setEmoji('💡'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('❓ Dúvida')
                    .setDescription('Tirar dúvidas gerais')
                    .setValue('question')
                    .setEmoji('❓'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('🚨 Denúncia')
                    .setDescription('Reportar comportamentos inadequados')
                    .setValue('report')
                    .setEmoji('🚨'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('🔧 Suporte')
                    .setDescription('Suporte técnico')
                    .setValue('support')
                    .setEmoji('🔧'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('💰 Economia')
                    .setDescription('Problemas com sistema de economia')
                    .setValue('economy')
                    .setEmoji('💰'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('🎵 Música')
                    .setDescription('Problemas com sistema de música')
                    .setValue('music')
                    .setEmoji('🎵'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('🎫 Outros')
                    .setDescription('Outras questões')
                    .setValue('other')
                    .setEmoji('🎫')
            ]);
    }

    // Criar ticket
    async createTicket(interaction, category, reason = 'Sem motivo especificado') {
        const guild = interaction.guild;
        const user = interaction.user;
        
        // Incrementar contador
        this.ticketCounter++;
        const ticketNumber = this.ticketCounter.toString().padStart(4, '0');

        // Buscar categoria de tickets
        const ticketCategory = guild.channels.cache.get(this.ticketCategoryId);
        if (!ticketCategory) {
            return {
                success: false,
                message: '❌ Categoria de tickets não encontrada!'
            };
        }

        // Verificar se usuário já tem ticket aberto
        const existingTicket = Array.from(this.tickets.values()).find(ticket => 
            ticket.userId === user.id && ticket.status === 'open'
        );

        if (existingTicket) {
            return {
                success: false,
                message: `❌ Você já tem um ticket aberto: <#${existingTicket.channelId}>`
            };
        }

        // Criar canal do ticket
        const ticketChannel = await guild.channels.create({
            name: `ticket-${ticketNumber}-${user.username}`,
            type: ChannelType.GuildText,
            parent: ticketCategory.id,
            topic: `Ticket #${ticketNumber} - ${user.tag} - ${category}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: this.adminRoleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: guild.members.me.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                }
            ]
        });

        // Criar embed do ticket
        const embed = this.createTicketEmbed(user, category, reason, ticketNumber);
        const controlRow = this.createTicketControlButtons();

        await ticketChannel.send({ 
            content: `${user} | <@&${this.adminRoleId}>`,
            embeds: [embed],
            components: [controlRow]
        });

        // Salvar ticket
        const ticketId = `ticket_${Date.now()}`;
        this.tickets.set(ticketId, {
            id: ticketId,
            channelId: ticketChannel.id,
            userId: user.id,
            category: category,
            reason: reason,
            ticketNumber: ticketNumber,
            createdAt: Date.now(),
            status: 'open',
            logs: []
        });

        // Log da criação
        this.addTicketLog(ticketId, 'created', user.id, 'Ticket criado');

        return {
            success: true,
            channel: ticketChannel,
            ticketNumber: ticketNumber
        };
    }

    // Criar embed do ticket
    createTicketEmbed(user, category, reason, ticketNumber) {
        const categoryEmojis = {
            'bug': '🐛',
            'suggestion': '💡',
            'question': '❓',
            'report': '🚨',
            'support': '🔧',
            'economy': '💰',
            'music': '🎵',
            'other': '🎫'
        };

        const categoryNames = {
            'bug': 'Bug Report',
            'suggestion': 'Sugestão',
            'question': 'Dúvida',
            'report': 'Denúncia',
            'support': 'Suporte',
            'economy': 'Economia',
            'music': 'Música',
            'other': 'Outros'
        };

        return new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle(`🎫 Ticket #${ticketNumber} - ${categoryEmojis[category]} ${categoryNames[category]}`)
            .setDescription(`
**Ticket criado com sucesso!**

**👤 Usuário:** ${user}
**📝 Categoria:** ${categoryEmojis[category]} ${categoryNames[category]}
**📄 Motivo:** ${reason}
**⏰ Criado em:** <t:${Math.floor(Date.now() / 1000)}:F>
**🆔 ID do Ticket:** \`${ticketNumber}\`

**📋 Instruções:**
• Descreva seu problema de forma detalhada
• Anexe imagens se necessário
• Aguarde a resposta da equipe
• Use os botões abaixo para gerenciar o ticket
            `)
            .addFields(
                { name: '🔧 Controles', value: 'Use os botões abaixo para gerenciar o ticket', inline: false },
                { name: '👥 Equipe', value: `<@&${this.adminRoleId}>`, inline: true },
                { name: '📊 Status', value: '🟢 Aberto', inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ 
                text: 'Nebula Friends • Sistema de Tickets',
                iconURL: this.client.user?.displayAvatarURL()
            })
            .setTimestamp();
    }

    // Criar botões de controle do ticket
    createTicketControlButtons() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_pause')
                    .setLabel('⏸️ Pausar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏸️'),
                new ButtonBuilder()
                    .setCustomId('ticket_log')
                    .setLabel('📋 Logs')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('🔒 Fechar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );
    }

    // Pausar ticket
    async pauseTicket(interaction) {
        const channel = interaction.channel;
        const user = interaction.user;
        
        // Verificar se é um canal de ticket
        if (!channel.name.startsWith('ticket-')) {
            return {
                success: false,
                message: '❌ Este não é um canal de ticket!'
            };
        }

        // Verificar permissões
        if (!interaction.member.roles.cache.has(this.adminRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return {
                success: false,
                message: '❌ Você não tem permissão para pausar tickets!'
            };
        }

        // Buscar ticket
        const ticket = Array.from(this.tickets.values()).find(t => t.channelId === channel.id);
        if (!ticket) {
            return {
                success: false,
                message: '❌ Ticket não encontrado!'
            };
        }

        // Atualizar status
        ticket.status = 'paused';
        ticket.pausedAt = Date.now();
        ticket.pausedBy = user.id;

        // Log da pausa
        this.addTicketLog(ticket.id, 'paused', user.id, 'Ticket pausado');

        // Atualizar permissões (remover permissão de enviar mensagens do usuário)
        const ticketUser = interaction.guild.members.cache.get(ticket.userId);
        if (ticketUser) {
            await channel.permissionOverwrites.edit(ticketUser, {
                SendMessages: false
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#ff8800')
            .setTitle('⏸️ Ticket Pausado')
            .setDescription(`Ticket pausado por ${user}`)
            .addFields(
                { name: '👤 Pausado por', value: user.toString(), inline: true },
                { name: '⏰ Pausado em', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📊 Status', value: '🟡 Pausado', inline: true }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        return {
            success: true,
            message: '✅ Ticket pausado! O usuário não pode mais enviar mensagens.'
        };
    }

    // Retomar ticket
    async resumeTicket(interaction) {
        const channel = interaction.channel;
        const user = interaction.user;
        
        // Verificar se é um canal de ticket
        if (!channel.name.startsWith('ticket-')) {
            return {
                success: false,
                message: '❌ Este não é um canal de ticket!'
            };
        }

        // Verificar permissões
        if (!interaction.member.roles.cache.has(this.adminRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return {
                success: false,
                message: '❌ Você não tem permissão para retomar tickets!'
            };
        }

        // Buscar ticket
        const ticket = Array.from(this.tickets.values()).find(t => t.channelId === channel.id);
        if (!ticket) {
            return {
                success: false,
                message: '❌ Ticket não encontrado!'
            };
        }

        // Atualizar status
        ticket.status = 'open';
        ticket.resumedAt = Date.now();
        ticket.resumedBy = user.id;

        // Log da retomada
        this.addTicketLog(ticket.id, 'resumed', user.id, 'Ticket retomado');

        // Restaurar permissões
        const ticketUser = interaction.guild.members.cache.get(ticket.userId);
        if (ticketUser) {
            await channel.permissionOverwrites.edit(ticketUser, {
                SendMessages: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('▶️ Ticket Retomado')
            .setDescription(`Ticket retomado por ${user}`)
            .addFields(
                { name: '👤 Retomado por', value: user.toString(), inline: true },
                { name: '⏰ Retomado em', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📊 Status', value: '🟢 Aberto', inline: true }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        return {
            success: true,
            message: '✅ Ticket retomado! O usuário pode enviar mensagens novamente.'
        };
    }

    // Fechar ticket
    async closeTicket(interaction) {
        const channel = interaction.channel;
        const user = interaction.user;
        
        // Verificar se é um canal de ticket
        if (!channel.name.startsWith('ticket-')) {
            return {
                success: false,
                message: '❌ Este não é um canal de ticket!'
            };
        }

        // Verificar permissões
        if (!interaction.member.roles.cache.has(this.adminRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return {
                success: false,
                message: '❌ Você não tem permissão para fechar tickets!'
            };
        }

        // Buscar ticket
        const ticket = Array.from(this.tickets.values()).find(t => t.channelId === channel.id);
        if (!ticket) {
            return {
                success: false,
                message: '❌ Ticket não encontrado!'
            };
        }

        // Atualizar status
        ticket.status = 'closed';
        ticket.closedAt = Date.now();
        ticket.closedBy = user.id;

        // Log do fechamento
        this.addTicketLog(ticket.id, 'closed', user.id, 'Ticket fechado');

        // Criar embed de fechamento
        const embed = new EmbedBuilder()
            .setColor('#ff4444')
            .setTitle('🔒 Ticket Fechado')
            .setDescription(`Ticket #${ticket.ticketNumber} foi fechado`)
            .addFields(
                { name: '👤 Fechado por', value: user.toString(), inline: true },
                { name: '⏰ Fechado em', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📊 Status', value: '🔴 Fechado', inline: true }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        // Renomear canal
        await channel.setName(`closed-${channel.name}`);

        // Deletar canal após 30 segundos
        setTimeout(async () => {
            try {
                await channel.delete();
            } catch (error) {
                console.error('❌ Erro ao deletar canal de ticket:', error);
            }
        }, 30000);

        return {
            success: true,
            message: '✅ Ticket fechado! O canal será deletado em 30 segundos.'
        };
    }

    // Mostrar logs do ticket
    async showTicketLogs(interaction) {
        const channel = interaction.channel;
        
        // Verificar se é um canal de ticket
        if (!channel.name.startsWith('ticket-')) {
            return {
                success: false,
                message: '❌ Este não é um canal de ticket!'
            };
        }

        // Verificar permissões
        if (!interaction.member.roles.cache.has(this.adminRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return {
                success: false,
                message: '❌ Você não tem permissão para ver logs de tickets!'
            };
        }

        // Buscar ticket
        const ticket = Array.from(this.tickets.values()).find(t => t.channelId === channel.id);
        if (!ticket) {
            return {
                success: false,
                message: '❌ Ticket não encontrado!'
            };
        }

        // Criar embed de logs
        const logs = ticket.logs || [];
        const logText = logs.length > 0 ? 
            logs.map(log => `**${log.action}** - <t:${Math.floor(log.timestamp / 1000)}:R> - <@${log.userId}>`).join('\n') :
            'Nenhum log encontrado';

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📋 Logs do Ticket #${ticket.ticketNumber}`)
            .setDescription(logText)
            .addFields(
                { name: '📊 Informações', value: `**Status:** ${ticket.status}\n**Criado:** <t:${Math.floor(ticket.createdAt / 1000)}:R>\n**Usuário:** <@${ticket.userId}>`, inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        return {
            success: true,
            message: '📋 Logs exibidos!'
        };
    }

    // Adicionar log ao ticket
    addTicketLog(ticketId, action, userId, description) {
        const ticket = this.tickets.get(ticketId);
        if (ticket) {
            if (!ticket.logs) ticket.logs = [];
            ticket.logs.push({
                action: action,
                userId: userId,
                description: description,
                timestamp: Date.now()
            });
        }
    }

    // Adicionar usuário ao ticket
    async addUser(interaction, user) {
        const channel = interaction.channel;
        
        // Verificar se é um canal de ticket
        if (!channel.name.startsWith('ticket-') && !channel.name.startsWith('closed-')) {
            return {
                success: false,
                message: '❌ Este não é um canal de ticket!'
            };
        }

        // Verificar permissões
        if (!interaction.member.roles.cache.has(this.adminRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return {
                success: false,
                message: '❌ Você não tem permissão para adicionar usuários!'
            };
        }

        // Adicionar usuário ao ticket
        await channel.permissionOverwrites.create(user, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            AttachFiles: true,
            EmbedLinks: true
        });

        return {
            success: true,
            message: `✅ ${user} foi adicionado ao ticket!`
        };
    }

    // Remover usuário do ticket
    async removeUser(interaction, user) {
        const channel = interaction.channel;
        
        // Verificar se é um canal de ticket
        if (!channel.name.startsWith('ticket-') && !channel.name.startsWith('closed-')) {
            return {
                success: false,
                message: '❌ Este não é um canal de ticket!'
            };
        }

        // Verificar permissões
        if (!interaction.member.roles.cache.has(this.adminRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return {
                success: false,
                message: '❌ Você não tem permissão para remover usuários!'
            };
        }

        // Remover usuário do ticket
        await channel.permissionOverwrites.delete(user);

        return {
            success: true,
            message: `✅ ${user} foi removido do ticket!`
        };
    }

    // Obter estatísticas do sistema
    getStats() {
        const openTickets = Array.from(this.tickets.values()).filter(t => t.status === 'open').length;
        const pausedTickets = Array.from(this.tickets.values()).filter(t => t.status === 'paused').length;
        const closedTickets = Array.from(this.tickets.values()).filter(t => t.status === 'closed').length;
        const totalTickets = this.tickets.size;

        return {
            total: totalTickets,
            open: openTickets,
            paused: pausedTickets,
            closed: closedTickets,
            categoryId: this.ticketCategoryId,
            panelChannelId: this.ticketPanelChannelId,
            adminRoleId: this.adminRoleId
        };
    }
}

module.exports = TicketSystem;