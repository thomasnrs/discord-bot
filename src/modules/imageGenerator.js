const axios = require('axios');

class ImageGenerator {
    constructor() {
        this.workerUrl = process.env.WORKER_URL;
        this.rateLimit = new Map(); // Para controle de rate limiting
        this.maxRequests = parseInt(process.env.MAX_REQUESTS_PER_USER) || 5;
        this.rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW) || 60000; // 1 minuto
    }

    // Verificar rate limiting
    checkRateLimit(userId) {
        const now = Date.now();
        const userRequests = this.rateLimit.get(userId) || [];
        
        // Remover requisições antigas
        const validRequests = userRequests.filter(time => now - time < this.rateLimitWindow);
        
        if (validRequests.length >= this.maxRequests) {
            const oldestRequest = Math.min(...validRequests);
            const timeLeft = this.rateLimitWindow - (now - oldestRequest);
            return {
                allowed: false,
                timeLeft: Math.ceil(timeLeft / 1000)
            };
        }
        
        // Adicionar nova requisição
        validRequests.push(now);
        this.rateLimit.set(userId, validRequests);
        
        return { allowed: true };
    }

    // Gerar imagem
    async generateImage(prompt, model = null, steps = null) {
        try {
            if (!this.workerUrl) {
                throw new Error('URL do worker não configurada');
            }

            const requestData = {
                prompt: prompt,
                model: model || process.env.DEFAULT_MODEL || '@cf/lykon/dreamshaper-8-lcm',
                steps: steps || parseInt(process.env.DEFAULT_STEPS) || 20
            };

            console.log('🖼️  Gerando imagem:', requestData);

            const response = await axios.post(
                `${this.workerUrl}/api/generate-image`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 120000 // 2 minutos timeout
                }
            );

            if (response.data.success) {
                return {
                    success: true,
                    imageUrl: response.data.imageUrl,
                    prompt: response.data.prompt,
                    model: response.data.model,
                    steps: response.data.steps
                };
            } else {
                throw new Error(response.data.error || 'Erro desconhecido na geração');
            }

        } catch (error) {
            console.error('❌ Erro na geração de imagem:', error.message);
            
            if (error.code === 'ECONNABORTED') {
                throw new Error('Timeout na geração da imagem. Tente novamente.');
            } else if (error.response) {
                throw new Error(`Erro da API: ${error.response.data?.error || error.message}`);
            } else {
                throw new Error(`Erro de conexão: ${error.message}`);
            }
        }
    }

    // Validar modelo
    isValidModel(model) {
        const validModels = [
            '@cf/lykon/dreamshaper-8-lcm',
            '@cf/stabilityai/stable-diffusion-xl-base-1.0',
            '@cf/bytedance/stable-diffusion-xl-lightning'
        ];
        return validModels.includes(model);
    }

    // Obter modelos disponíveis
    getAvailableModels() {
        return [
            { 
                name: 'DreamShaper 8 LCM', 
                value: '@cf/lykon/dreamshaper-8-lcm',
                maxSteps: 20,
                description: 'Rápido e eficiente'
            },
            { 
                name: 'Stable Diffusion XL', 
                value: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
                maxSteps: 50,
                description: 'Alta qualidade'
            },
            { 
                name: 'SDXL Lightning', 
                value: '@cf/bytedance/stable-diffusion-xl-lightning',
                maxSteps: 20,
                description: 'Super rápido'
            }
        ];
    }

    // Obter estatísticas
    getStats() {
        const now = Date.now();
        let activeUsers = 0;
        let totalRequests = 0;

        for (const [userId, requests] of this.rateLimit.entries()) {
            const validRequests = requests.filter(time => now - time < this.rateLimitWindow);
            if (validRequests.length > 0) {
                activeUsers++;
                totalRequests += validRequests.length;
            }
        }

        return {
            activeUsers,
            totalRequests,
            maxRequestsPerUser: this.maxRequests,
            rateLimitWindow: this.rateLimitWindow
        };
    }
}

// Instância singleton
const imageGenerator = new ImageGenerator();

module.exports = {
    init: (client) => {
        // Adicionar métodos ao client para acesso global
        client.imageGenerator = imageGenerator;
        console.log('🖼️  Módulo ImageGenerator inicializado');
    },
    imageGenerator
};
