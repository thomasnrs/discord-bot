const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.dataDir = path.join(__dirname, '..', '..', 'data');
        this.ensureDataDir();
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    // Métodos genéricos para qualquer coleção
    getCollection(collectionName) {
        const filePath = path.join(this.dataDir, `${collectionName}.json`);
        
        if (!fs.existsSync(filePath)) {
            return {};
        }

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`❌ Erro ao ler coleção ${collectionName}:`, error);
            return {};
        }
    }

    saveCollection(collectionName, data) {
        const filePath = path.join(this.dataDir, `${collectionName}.json`);
        
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error(`❌ Erro ao salvar coleção ${collectionName}:`, error);
            return false;
        }
    }

    // Métodos específicos para economia
    getUserEconomy(userId) {
        const economy = this.getCollection('economy');
        return economy[userId] || {
            userId: userId,
            money: 1000, // Dinheiro inicial
            bank: 0,
            daily: null, // Timestamp do último daily
            weekly: null, // Timestamp do último weekly
            inventory: [],
            level: 1,
            xp: 0
        };
    }

    saveUserEconomy(userId, userData) {
        const economy = this.getCollection('economy');
        economy[userId] = userData;
        return this.saveCollection('economy', economy);
    }

    // Métodos para sistema de níveis
    getUserLevel(userId) {
        const levels = this.getCollection('levels');
        return levels[userId] || {
            userId: userId,
            level: 1,
            xp: 0,
            totalXp: 0,
            messages: 0,
            commands: 0,
            voiceTime: 0
        };
    }

    saveUserLevel(userId, levelData) {
        const levels = this.getCollection('levels');
        levels[userId] = levelData;
        return this.saveCollection('levels', levels);
    }

    // Métodos para tickets
    getTickets() {
        return this.getCollection('tickets');
    }

    saveTickets(tickets) {
        return this.saveCollection('tickets', tickets);
    }

    // Métodos para moderação
    getModerationLogs() {
        return this.getCollection('moderation');
    }

    saveModerationLogs(logs) {
        return this.saveCollection('moderation', logs);
    }

    // Métodos para configurações do servidor
    getGuildConfig(guildId) {
        const configs = this.getCollection('guildConfigs');
        return configs[guildId] || {
            guildId: guildId,
            prefix: '!',
            economyEnabled: true,
            levelSystemEnabled: true,
            musicEnabled: true,
            ticketSystemEnabled: true,
            moderationEnabled: true,
            logChannel: null,
            musicChannel: null,
            ticketCategory: null,
            muteRole: null,
            welcomeChannel: null,
            goodbyeChannel: null
        };
    }

    saveGuildConfig(guildId, config) {
        const configs = this.getCollection('guildConfigs');
        configs[guildId] = config;
        return this.saveCollection('guildConfigs', configs);
    }
}

module.exports = Database;
