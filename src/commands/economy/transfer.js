const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfira dinheiro entre carteira e banco')
        .addStringOption(option =>
            option.setName('direcao')
                .setDescription('Direção da transferência')
                .setRequired(true)
                .addChoices(
                    { name: 'Carteira → Banco', value: 'wallet_to_bank' },
                    { name: 'Banco → Carteira', value: 'bank_to_wallet' }
                ))
        .addIntegerOption(option =>
            option.setName('quantia')
                .setDescription('Quantia para transferir')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        const direction = interaction.options.getString('direcao');
        const amount = interaction.options.getInteger('quantia');
        const economy = interaction.client.economy;
        
        let from, to;
        if (direction === 'wallet_to_bank') {
            from = 'wallet';
            to = 'bank';
        } else {
            from = 'bank';
            to = 'wallet';
        }

        const userData = economy.getUserData(interaction.user.id);
        const currentAmount = from === 'wallet' ? userData.money : userData.bank;
        
        if (currentAmount < amount) {
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Transferência Falhada')
                .setDescription(`Você não tem moedas suficientes na ${from === 'wallet' ? 'carteira' : 'banco'}!`)
                .addFields(
                    { name: '💰 Disponível', value: `\`${currentAmount} moedas\``, inline: true },
                    { name: '💸 Solicitado', value: `\`${amount} moedas\``, inline: true }
                )
                .setTimestamp();

            return await interaction.reply({ embeds: [embed] });
        }

        const result = economy.transferMoney(interaction.user.id, amount, from, to);
        
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('✅ Transferência Realizada')
            .setDescription(`Transferiu ${amount} moedas da ${from === 'wallet' ? 'carteira' : 'banco'} para o ${to === 'wallet' ? 'carteira' : 'banco'}!`)
            .addFields(
                { name: '💵 Carteira', value: `\`${result.money} moedas\``, inline: true },
                { name: '🏦 Banco', value: `\`${result.bank} moedas\``, inline: true },
                { name: '📊 Total', value: `\`${result.money + result.bank} moedas\``, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
