const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

class TicketSystem {
    constructor() {
        this.ticketCount = 0;
    }

    async createTicket(interaction, category, reason = 'Sem motivo especificado') {
        const guild = interaction.guild;
        const user = interaction.user;
        
        // Buscar categoria de tickets
        let ticketCategory = guild.channels.cache.find(channel => 
            channel.type === ChannelType.GuildCategory && 
            channel.name.toLowerCase().includes('ticket')
        );

        // Criar categoria se não existir
        if (!ticketCategory) {
            ticketCategory = await guild.channels.create({
                name: '🎫 Tickets',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });
        }

        // Criar canal do ticket
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username}-${Date.now().toString().slice(-4)}`,
            type: ChannelType.GuildText,
            parent: ticketCategory.id,
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
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: guild.members.me.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ]
        });

        // Criar embed do ticket
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎫 Ticket Criado')
            .setDescription(`Ticket criado por ${user}`)
            .addFields(
                { name: '👤 Usuário', value: user.toString(), inline: true },
                { name: '📝 Categoria', value: category, inline: true },
                { name: '📄 Motivo', value: reason, inline: false },
                { name: '⏰ Criado em', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Sistema de Tickets' });

        await ticketChannel.send({ 
            content: `${user} | <@&${guild.roles.cache.find(role => role.name.toLowerCase().includes('staff') || role.name.toLowerCase().includes('mod'))?.id || 'N/A'}>`,
            embeds: [embed] 
        });

        // Salvar ticket no banco de dados
        const db = interaction.client.database;
        const tickets = db.getTickets();
        const ticketId = `ticket_${Date.now()}`;
        
        tickets[ticketId] = {
            id: ticketId,
            channelId: ticketChannel.id,
            userId: user.id,
            category: category,
            reason: reason,
            createdAt: Date.now(),
            status: 'open'
        };
        
        db.saveTickets(tickets);

        return {
            success: true,
            channel: ticketChannel,
            embed: embed
        };
    }

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

        // Buscar ticket no banco de dados
        const db = interaction.client.database;
        const tickets = db.getTickets();
        const ticket = Object.values(tickets).find(t => t.channelId === channel.id);
        
        if (!ticket) {
            return {
                success: false,
                message: '❌ Ticket não encontrado no banco de dados!'
            };
        }

        // Atualizar status do ticket
        ticket.status = 'closed';
        ticket.closedAt = Date.now();
        ticket.closedBy = user.id;
        db.saveTickets(tickets);

        // Criar embed de fechamento
        const embed = new EmbedBuilder()
            .setColor('#ff4444')
            .setTitle('🔒 Ticket Fechado')
            .setDescription(`Ticket fechado por ${user}`)
            .addFields(
                { name: '👤 Fechado por', value: user.toString(), inline: true },
                { name: '⏰ Fechado em', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        // Renomear canal
        await channel.setName(`closed-${channel.name}`);

        // Deletar canal após 10 segundos
        setTimeout(async () => {
            try {
                await channel.delete();
            } catch (error) {
                console.error('❌ Erro ao deletar canal de ticket:', error);
            }
        }, 10000);

        return {
            success: true,
            message: '✅ Ticket fechado! O canal será deletado em 10 segundos.'
        };
    }

    async addUser(interaction, user) {
        const channel = interaction.channel;
        
        // Verificar se é um canal de ticket
        if (!channel.name.startsWith('ticket-') && !channel.name.startsWith('closed-')) {
            return {
                success: false,
                message: '❌ Este não é um canal de ticket!'
            };
        }

        // Adicionar usuário ao ticket
        await channel.permissionOverwrites.create(user, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        return {
            success: true,
            message: `✅ ${user} foi adicionado ao ticket!`
        };
    }

    async removeUser(interaction, user) {
        const channel = interaction.channel;
        
        // Verificar se é um canal de ticket
        if (!channel.name.startsWith('ticket-') && !channel.name.startsWith('closed-')) {
            return {
                success: false,
                message: '❌ Este não é um canal de ticket!'
            };
        }

        // Remover usuário do ticket
        await channel.permissionOverwrites.delete(user);

        return {
            success: true,
            message: `✅ ${user} foi removido do ticket!`
        };
    }

    createTicketPanelEmbed() {
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎫 Sistema de Tickets')
            .setDescription('Clique no botão abaixo para criar um ticket!')
            .addFields(
                { name: '📋 Como usar', value: '1. Clique no botão "Criar Ticket"\n2. Escolha a categoria do seu problema\n3. Aguarde um staff responder', inline: false },
                { name: '⚠️ Importante', value: '• Não abuse do sistema\n• Seja específico no motivo\n• Aguarde a resposta da equipe', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Sistema de Tickets' });

        return embed;
    }
}

module.exports = TicketSystem;
