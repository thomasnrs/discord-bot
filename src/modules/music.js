const { EmbedBuilder, VoiceChannel, GuildMember } = require('discord.js');
const { Player } = require('discord-player');
const { Client } = require('discord.js');

class MusicSystem {
    constructor(client) {
        this.client = client;
        this.player = new Player(client, {
            ytdlOptions: {
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            }
        });
        
        this.setupPlayerEvents();
    }

    setupPlayerEvents() {
        this.player.on('error', (queue, error) => {
            console.error(`❌ Erro no player de música:`, error);
        });

        this.player.on('connectionError', (queue, error) => {
            console.error(`❌ Erro de conexão de música:`, error);
        });

        this.player.on('trackStart', (queue, track) => {
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('🎵 Tocando Agora')
                .setDescription(`**[${track.title}](${track.url})**`)
                .setThumbnail(track.thumbnail)
                .addFields(
                    { name: '👤 Solicitado por', value: track.requestedBy.toString(), inline: true },
                    { name: '⏱️ Duração', value: track.duration, inline: true },
                    { name: '📺 Canal', value: track.source, inline: true }
                )
                .setTimestamp();

            queue.metadata.channel.send({ embeds: [embed] });
        });

        this.player.on('trackAdd', (queue, track) => {
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('➕ Música Adicionada')
                .setDescription(`**[${track.title}](${track.url})** adicionada à fila!`)
                .setThumbnail(track.thumbnail)
                .addFields(
                    { name: '👤 Adicionado por', value: track.requestedBy.toString(), inline: true },
                    { name: '📍 Posição na fila', value: `${queue.tracks.length}`, inline: true }
                )
                .setTimestamp();

            queue.metadata.channel.send({ embeds: [embed] });
        });

        this.player.on('botDisconnect', (queue) => {
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('🔌 Bot Desconectado')
                .setDescription('O bot foi desconectado do canal de voz!')
                .setTimestamp();

            queue.metadata.channel.send({ embeds: [embed] });
        });

        this.player.on('channelEmpty', (queue) => {
            const embed = new EmbedBuilder()
                .setColor('#ff8800')
                .setTitle('👻 Canal Vazio')
                .setDescription('Ninguém está no canal de voz. Saindo...')
                .setTimestamp();

            queue.metadata.channel.send({ embeds: [embed] });
        });

        this.player.on('queueEnd', (queue) => {
            const embed = new EmbedBuilder()
                .setColor('#ff8800')
                .setTitle('🏁 Fila Finalizada')
                .setDescription('Todas as músicas foram reproduzidas!')
                .setTimestamp();

            queue.metadata.channel.send({ embeds: [embed] });
        });
    }

    async play(interaction, query) {
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return {
                success: false,
                message: '❌ Você precisa estar em um canal de voz!'
            };
        }

        const queue = this.player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });

        try {
            if (!queue.connection) {
                await queue.connect(channel);
            }
        } catch (error) {
            console.error('❌ Erro ao conectar ao canal de voz:', error);
            return {
                success: false,
                message: '❌ Não foi possível conectar ao canal de voz!'
            };
        }

        const track = await this.player.search(query, {
            requestedBy: interaction.user,
            searchEngine: 'youtube'
        }).then(x => x.tracks[0]);

        if (!track) {
            return {
                success: false,
                message: '❌ Nenhuma música encontrada!'
            };
        }

        queue.play(track);
        return {
            success: true,
            message: '✅ Música adicionada à fila!'
        };
    }

    async pause(interaction) {
        const queue = this.player.getQueue(interaction.guild);
        if (!queue) {
            return {
                success: false,
                message: '❌ Nenhuma música tocando!'
            };
        }

        if (queue.connection.paused) {
            return {
                success: false,
                message: '❌ A música já está pausada!'
            };
        }

        queue.setPaused(true);
        return {
            success: true,
            message: '⏸️ Música pausada!'
        };
    }

    async resume(interaction) {
        const queue = this.player.getQueue(interaction.guild);
        if (!queue) {
            return {
                success: false,
                message: '❌ Nenhuma música na fila!'
            };
        }

        if (!queue.connection.paused) {
            return {
                success: false,
                message: '❌ A música não está pausada!'
            };
        }

        queue.setPaused(false);
        return {
            success: true,
            message: '▶️ Música retomada!'
        };
    }

    async skip(interaction) {
        const queue = this.player.getQueue(interaction.guild);
        if (!queue) {
            return {
                success: false,
                message: '❌ Nenhuma música na fila!'
            };
        }

        const currentTrack = queue.current;
        queue.skip();
        return {
            success: true,
            message: `⏭️ Pulou: **${currentTrack.title}**`
        };
    }

    async stop(interaction) {
        const queue = this.player.getQueue(interaction.guild);
        if (!queue) {
            return {
                success: false,
                message: '❌ Nenhuma música tocando!'
            };
        }

        queue.destroy();
        return {
            success: true,
            message: '⏹️ Música parada e fila limpa!'
        };
    }

    async queue(interaction) {
        const queue = this.player.getQueue(interaction.guild);
        if (!queue || !queue.tracks.length) {
            return {
                success: false,
                message: '❌ Nenhuma música na fila!'
            };
        }

        const tracks = queue.tracks.slice(0, 10);
        let description = '';

        tracks.forEach((track, index) => {
            description += `${index + 1}. **[${track.title}](${track.url})** - ${track.duration}\n`;
        });

        if (queue.tracks.length > 10) {
            description += `\n... e mais ${queue.tracks.length - 10} música(s)`;
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('📋 Fila de Músicas')
            .setDescription(description)
            .addFields(
                { name: '🎵 Tocando Agora', value: `**[${queue.current.title}](${queue.current.url})**`, inline: false },
                { name: '📊 Total', value: `${queue.tracks.length} música(s)`, inline: true },
                { name: '⏱️ Duração Total', value: queue.totalTime, inline: true }
            )
            .setTimestamp();

        return {
            success: true,
            embed: embed
        };
    }

    async nowplaying(interaction) {
        const queue = this.player.getQueue(interaction.guild);
        if (!queue || !queue.current) {
            return {
                success: false,
                message: '❌ Nenhuma música tocando!'
            };
        }

        const track = queue.current;
        const progress = queue.createProgressBar();
        
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎵 Tocando Agora')
            .setDescription(`**[${track.title}](${track.url})**`)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: '👤 Solicitado por', value: track.requestedBy.toString(), inline: true },
                { name: '⏱️ Duração', value: track.duration, inline: true },
                { name: '📺 Canal', value: track.source, inline: true },
                { name: '📊 Progresso', value: progress, inline: false }
            )
            .setTimestamp();

        return {
            success: true,
            embed: embed
        };
    }

    async volume(interaction, volume) {
        const queue = this.player.getQueue(interaction.guild);
        if (!queue) {
            return {
                success: false,
                message: '❌ Nenhuma música tocando!'
            };
        }

        if (volume < 0 || volume > 100) {
            return {
                success: false,
                message: '❌ Volume deve estar entre 0 e 100!'
            };
        }

        queue.setVolume(volume);
        return {
            success: true,
            message: `🔊 Volume alterado para ${volume}%!`
        };
    }
}

module.exports = MusicSystem;
