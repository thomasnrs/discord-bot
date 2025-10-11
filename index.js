export default {
  async fetch(request, env) {
    // Configurar CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Lidar com preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Verificar se é uma requisição POST para gerar imagem
    if (request.method === 'POST' && request.url.includes('/api/generate-image')) {
      try {
        console.log('Recebida requisição para gerar imagem');
        
        // Verificar se a AI binding está disponível
        if (!env.AI) {
          console.error('AI binding não está configurado');
          return new Response(JSON.stringify({ 
            error: 'AI binding não está configurado. Verifique as configurações do Worker.',
            details: 'A binding AI não foi encontrada no ambiente'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { prompt, model, steps = 30 } = await request.json();
        console.log('Dados recebidos:', { prompt, model, steps });

        if (!prompt) {
          return new Response(JSON.stringify({ error: 'Prompt é obrigatório' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Verificar se o modelo é válido
        const validModels = [
          '@cf/lykon/dreamshaper-8-lcm',
          '@cf/stabilityai/stable-diffusion-xl-base-1.0',
          '@cf/bytedance/stable-diffusion-xl-lightning'
        ];

        if (!validModels.includes(model)) {
          return new Response(JSON.stringify({ 
            error: 'Modelo inválido',
            details: `Modelo ${model} não é suportado. Use um dos modelos válidos.`
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log('Chamando AI.run com modelo:', model);

        // Configurar parâmetros para o modelo de geração de imagem
        // Limitar steps baseado no modelo (alguns modelos têm limite de 20)
        let maxSteps = 20;
        if (model === '@cf/stabilityai/stable-diffusion-xl-base-1.0') {
          maxSteps = 50; // SDXL suporta mais steps
        }
        
        const actualSteps = Math.min(steps, maxSteps);
        
        const imageParams = {
          prompt: prompt,
          num_steps: actualSteps,
          guidance: 7.5,
          width: 1024,
          height: 1024
        };

        console.log('Parâmetros da imagem:', imageParams);
        console.log('Steps solicitados: ' + steps + ', Steps efetivos: ' + actualSteps + ', Modelo: ' + model);

        // Chamar a API da Cloudflare AI para gerar imagem
        const response = await env.AI.run(model, imageParams);
        console.log('Resposta da AI (tipo):', typeof response);
        console.log('Resposta da AI:', response);

        // Se a resposta é um ReadableStream, vamos retornar ela diretamente
        let imageData;
        if (response instanceof ReadableStream) {
          console.log('Resposta é ReadableStream - retornando stream diretamente');
          
          // Para ReadableStream, vamos criar um endpoint separado para servir a imagem
          // Por enquanto, vamos tentar uma abordagem diferente
          try {
            // Tentar converter o stream para ArrayBuffer de forma mais eficiente
            const arrayBuffer = await new Response(response).arrayBuffer();
            console.log('ArrayBuffer criado, tamanho:', arrayBuffer.byteLength);
            
            // Converter para base64 de forma mais eficiente
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            const chunkSize = 8192; // Processar em chunks menores
            
            for (let i = 0; i < bytes.length; i += chunkSize) {
              const chunk = bytes.slice(i, i + chunkSize);
              binary += String.fromCharCode.apply(null, chunk);
            }
            
            const base64 = btoa(binary);
            imageData = `data:image/png;base64,${base64}`;
            console.log('Imagem convertida para base64 com sucesso');
            
          } catch (streamError) {
            console.error('Erro ao processar stream:', streamError);
            
            // Se falhar, retornar informações de debug
            return new Response(JSON.stringify({
              success: false,
              debug: true,
              error: 'Erro ao processar ReadableStream',
              details: streamError.message,
              suggestion: 'Tente usar um modelo diferente ou steps menores'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } else if (response && response.data && response.data[0]) {
          // Se já é um objeto com data
          imageData = response.data[0];
          console.log('Imagem encontrada em response.data[0]');
        } else if (response && response.image) {
          imageData = response.image;
          console.log('Imagem encontrada em response.image');
        } else if (response && response.url) {
          imageData = response.url;
          console.log('Imagem encontrada em response.url');
        } else {
          console.error('Resposta inválida da AI:', response);
          console.log('Chaves disponíveis:', Object.keys(response || {}));
          
          return new Response(JSON.stringify({ 
            error: 'Resposta inválida da AI',
            details: 'A AI não retornou uma imagem válida',
            debug: {
              type: typeof response,
              keys: Object.keys(response || {}),
              response: response
            }
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Retornar a imagem gerada
        return new Response(JSON.stringify({
          success: true,
          imageUrl: imageData,
          prompt: prompt,
          model: model,
          steps: actualSteps
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('Erro detalhado ao gerar imagem:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        return new Response(JSON.stringify({ 
          error: 'Erro interno do servidor',
          details: error.message,
          type: error.name
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Rota padrão - retornar a página HTML
    if (request.method === 'GET') {
      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerador de Imagens - Cloudflare AI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .main-content {
            padding: 40px;
        }

        .input-section {
            margin-bottom: 30px;
        }

        .input-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 1.1rem;
        }

        .prompt-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            resize: vertical;
            min-height: 100px;
        }

        .prompt-input:focus {
            outline: none;
            border-color: #4facfe;
            box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
        }

        .options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .option-group {
            display: flex;
            flex-direction: column;
        }

        .option-group select,
        .option-group input {
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .option-group select:focus,
        .option-group input:focus {
            outline: none;
            border-color: #4facfe;
            box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
        }

        .generate-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .generate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(79, 172, 254, 0.3);
        }

        .generate-btn:active {
            transform: translateY(0);
        }

        .generate-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .loading {
            display: none;
            text-align: center;
            margin: 20px 0;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4facfe;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .result-section {
            margin-top: 30px;
            display: none;
        }

        .result-section.show {
            display: block;
        }

        .generated-image {
            width: 100%;
            max-width: 100%;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }

        .image-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .download-btn {
            background: #28a745;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .download-btn:hover {
            background: #218838;
            transform: translateY(-1px);
        }

        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #f5c6cb;
            display: none;
        }

        .error-message.show {
            display: block;
        }

        .examples {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }

        .examples h3 {
            margin-bottom: 15px;
            color: #333;
        }

        .example-prompt {
            background: white;
            padding: 10px 15px;
            margin: 5px 0;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid #e1e5e9;
        }

        .example-prompt:hover {
            background: #e9ecef;
            border-color: #4facfe;
        }

        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #c3e6cb;
            display: none;
        }

        .success-message.show {
            display: block;
        }

        @media (max-width: 768px) {
            .options-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .main-content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Gerador de Imagens IA</h1>
            <p>Crie imagens incríveis usando inteligência artificial da Cloudflare</p>
        </div>

        <div class="main-content">
            <form id="imageForm">
                <div class="input-section">
                    <div class="input-group">
                        <label for="prompt">Descreva a imagem que você quer gerar:</label>
                        <textarea 
                            id="prompt" 
                            class="prompt-input" 
                            placeholder="Ex: Um gato astronauta flutuando no espaço com estrelas brilhantes ao fundo..."
                            required
                        ></textarea>
                    </div>

                    <div class="options-grid">
                        <div class="option-group">
                            <label for="model">Modelo de IA:</label>
                            <select id="model">
                                <option value="@cf/lykon/dreamshaper-8-lcm">DreamShaper 8 LCM</option>
                                <option value="@cf/stabilityai/stable-diffusion-xl-base-1.0">Stable Diffusion XL</option>
                                <option value="@cf/bytedance/stable-diffusion-xl-lightning">SDXL Lightning</option>
                            </select>
                        </div>

                        <div class="option-group">
                            <label for="steps">Qualidade (Steps):</label>
                            <select id="steps">
                                <option value="10">10 - Muito Rápido</option>
                                <option value="15">15 - Rápido</option>
                                <option value="20" selected>20 - Balanceado (Máx para DreamShaper/SDXL Lightning)</option>
                                <option value="30">30 - Alta Qualidade (SDXL apenas)</option>
                                <option value="50">50 - Máxima Qualidade (SDXL apenas)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="generate-btn" id="generateBtn">
                        🚀 Gerar Imagem
                    </button>
                </div>
            </form>

            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Gerando sua imagem... Isso pode levar alguns segundos.</p>
            </div>

            <div class="error-message" id="errorMessage">
                <strong>Erro:</strong> <span id="errorText"></span>
            </div>

            <div class="success-message" id="successMessage">
                <strong>Sucesso!</strong> Imagem gerada com sucesso!
            </div>

            <div class="result-section" id="resultSection">
                <h3>Imagem Gerada:</h3>
                <img id="generatedImage" class="generated-image" alt="Imagem gerada">
                <div class="image-info">
                    <p><strong>Prompt usado:</strong> <span id="usedPrompt"></span></p>
                    <p><strong>Modelo:</strong> <span id="usedModel"></span></p>
                    <p><strong>Steps:</strong> <span id="usedSteps"></span></p>
                    <a id="downloadBtn" class="download-btn" href="#" download="imagem-gerada.png">
                        📥 Baixar Imagem
                    </a>
                </div>
            </div>

            <div class="examples">
                <h3>💡 Exemplos de Prompts:</h3>
                <div class="example-prompt" onclick="setPrompt('Um dragão majestoso voando sobre uma cidade medieval ao pôr do sol')">
                    Um dragão majestoso voando sobre uma cidade medieval ao pôr do sol
                </div>
                <div class="example-prompt" onclick="setPrompt('Robô futurista em uma floresta tropical com luzes neon')">
                    Robô futurista em uma floresta tropical com luzes neon
                </div>
                <div class="example-prompt" onclick="setPrompt('Casa de chocolate em uma paisagem de doces coloridos')">
                    Casa de chocolate em uma paisagem de doces coloridos
                </div>
                <div class="example-prompt" onclick="setPrompt('Pinguim usando óculos escuros na praia com um guarda-sol')">
                    Pinguim usando óculos escuros na praia com um guarda-sol
                </div>
                <div class="example-prompt" onclick="setPrompt('Gato astronauta flutuando no espaço com estrelas brilhantes')">
                    Gato astronauta flutuando no espaço com estrelas brilhantes
                </div>
                <div class="example-prompt" onclick="setPrompt('Cidade futurista com arranha-céus de vidro e carros voadores')">
                    Cidade futurista com arranha-céus de vidro e carros voadores
                </div>
            </div>
        </div>
    </div>

    <script>
        // Função para definir prompt nos exemplos
        function setPrompt(prompt) {
            document.getElementById('prompt').value = prompt;
        }

        // Função para gerar imagem
        async function generateImage(event) {
            event.preventDefault();
            
            const prompt = document.getElementById('prompt').value;
            const model = document.getElementById('model').value;
            const steps = parseInt(document.getElementById('steps').value);
            
            const generateBtn = document.getElementById('generateBtn');
            const loading = document.getElementById('loading');
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            const resultSection = document.getElementById('resultSection');
            
            // Mostrar loading
            generateBtn.disabled = true;
            generateBtn.textContent = '⏳ Gerando...';
            loading.style.display = 'block';
            errorMessage.classList.remove('show');
            successMessage.classList.remove('show');
            resultSection.classList.remove('show');
            
            try {
                // Chamar API do Worker
                const response = await fetch('/api/generate-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        model: model,
                        steps: steps
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Erro na API');
                }
                
                // Se for debug, mostrar informações
                if (data.debug) {
                    console.log('Debug info:', data);
                    let debugMsg = 'Modo debug ativo: ' + (data.error || 'Erro desconhecido');
                    if (data.suggestion) {
                        debugMsg += ' | Sugestão: ' + data.suggestion;
                    }
                    document.getElementById('errorText').textContent = debugMsg;
                    errorMessage.classList.add('show');
                    return;
                }
                
                // Mostrar resultado
                const generatedImage = document.getElementById('generatedImage');
                const usedPrompt = document.getElementById('usedPrompt');
                const usedModel = document.getElementById('usedModel');
                const usedSteps = document.getElementById('usedSteps');
                const downloadBtn = document.getElementById('downloadBtn');
                
                generatedImage.src = data.imageUrl;
                usedPrompt.textContent = prompt;
                usedModel.textContent = model;
                usedSteps.textContent = data.steps || steps;
                
                // Configurar download - se for data URL, usar download direto
                if (data.imageUrl.startsWith('data:')) {
                    downloadBtn.href = data.imageUrl;
                    downloadBtn.download = 'imagem-gerada.png';
                } else {
                    downloadBtn.href = data.imageUrl;
                    downloadBtn.download = 'imagem-gerada.png';
                }
                
                resultSection.classList.add('show');
                successMessage.classList.add('show');
                
                // Scroll para o resultado
                resultSection.scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('Erro ao gerar imagem:', error);
                
                // Tentar extrair mais detalhes do erro
                let errorMsg = error.message;
                if (error.message.includes('Failed to fetch')) {
                    errorMsg = 'Erro de conexão. Verifique se o Worker está funcionando.';
                } else if (error.message.includes('500')) {
                    errorMsg = 'Erro no servidor. Verifique os logs do Worker.';
                }
                
                document.getElementById('errorText').textContent = errorMsg;
                errorMessage.classList.add('show');
            } finally {
                // Esconder loading
                generateBtn.disabled = false;
                generateBtn.textContent = '🚀 Gerar Imagem';
                loading.style.display = 'none';
            }
        }

        // Event listeners
        document.getElementById('imageForm').addEventListener('submit', generateImage);
        
        // Atualizar opções de steps baseado no modelo selecionado
        document.getElementById('model').addEventListener('change', function() {
            const model = this.value;
            const stepsSelect = document.getElementById('steps');
            const currentValue = stepsSelect.value;
            
            // Limpar opções atuais
            stepsSelect.innerHTML = '';
            
            if (model === '@cf/stabilityai/stable-diffusion-xl-base-1.0') {
                // SDXL suporta até 50 steps
                stepsSelect.innerHTML = 
                    '<option value="10">10 - Muito Rápido</option>' +
                    '<option value="15">15 - Rápido</option>' +
                    '<option value="20">20 - Balanceado</option>' +
                    '<option value="30">30 - Alta Qualidade</option>' +
                    '<option value="50">50 - Máxima Qualidade</option>';
                // Manter valor atual se válido, senão usar 20
                if (['10', '15', '20', '30', '50'].includes(currentValue)) {
                    stepsSelect.value = currentValue;
                } else {
                    stepsSelect.value = '20';
                }
            } else {
                // DreamShaper e SDXL Lightning limitados a 20 steps
                stepsSelect.innerHTML = 
                    '<option value="10">10 - Muito Rápido</option>' +
                    '<option value="15">15 - Rápido</option>' +
                    '<option value="20">20 - Máxima Qualidade</option>';
                // Manter valor atual se válido, senão usar 20
                if (['10', '15', '20'].includes(currentValue)) {
                    stepsSelect.value = currentValue;
                } else {
                    stepsSelect.value = '20';
                }
            }
        });

        // Adicionar animação ao carregar
        window.addEventListener('load', () => {
            document.querySelector('.container').style.opacity = '0';
            document.querySelector('.container').style.transform = 'translateY(20px)';
            document.querySelector('.container').style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                document.querySelector('.container').style.opacity = '1';
                document.querySelector('.container').style.transform = 'translateY(0)';
            }, 100);
        });

        // Adicionar efeito de hover nos botões de exemplo
        document.addEventListener('DOMContentLoaded', () => {
            const examplePrompts = document.querySelectorAll('.example-prompt');
            examplePrompts.forEach(prompt => {
                prompt.addEventListener('mouseenter', () => {
                    prompt.style.transform = 'translateX(5px)';
                });
                prompt.addEventListener('mouseleave', () => {
                    prompt.style.transform = 'translateX(0)';
                });
            });
        });
    </script>
</body>
</html>`;

      return new Response(html, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html; charset=utf-8' 
        }
      });
    }

    // Rota não encontrada
    return new Response('Página não encontrada', { 
      status: 404,
      headers: corsHeaders 
    });
  }
};
