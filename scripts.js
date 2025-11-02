// Espera a página HTML carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    // 1. Pega os elementos do HTML pelos seus IDs
    const form = document.getElementById('form-encurtador');
    const inputUrl = document.getElementById('input-url');
    const linkResultado = document.getElementById('link-resultado');
    const msgErro = document.getElementById('mensagem-erro');

    // 2. Adiciona um "ouvinte" para o evento de 'submit' (envio) do formulário
    form.addEventListener('submit', async (evento) => {
        
        // 3. Previne o comportamento padrão do formulário (que é recarregar a página)
        evento.preventDefault();

        // Limpa resultados anteriores
        linkResultado.href = '#';
        linkResultado.textContent = '';
        msgErro.textContent = '';

        // 4. Pega o valor que o usuário digitou no campo de input
        const urlParaEncurtar = inputUrl.value;

        // 5. Tenta se comunicar com a API
        try {
            // Envia a requisição POST para o seu endpoint "/encurtar"
            // (Assumindo que sua API está rodando em http://localhost:8000)
            const response = await fetch('http://localhost:8000/encurtar', {
                method: 'POST',
                headers: {
                    // Avisa a API que estamos enviando JSON
                    'Content-Type': 'application/json'
                },
                // Converte o objeto JavaScript em texto JSON
                // Note a chave "url_original", como o seu Pydantic espera
                body: JSON.stringify({
                    url_original: urlParaEncurtar 
                })
            });

            // 6. Verifica se a API respondeu com sucesso
            if (response.ok) {
                // Pega a resposta JSON da API
                const data = await response.json();
                
                // 7. Mostra o link encurtado na tela
                // (baseado na sua resposta: {"url_encurtada": ...})
                linkResultado.href = data.url_encurtada;
                linkResultado.textContent = data.url_encurtada;
            } else {
                // Mostra uma mensagem de erro se a API falhar
                msgErro.textContent = 'Erro ao encurtar o link. Tente novamente.';
            }

        } catch (error) {
            // Mostra uma mensagem se a API estiver offline
            console.error('Erro de conexão:', error);
            msgErro.textContent = 'Não foi possível conectar ao servidor.';
        }
    });
});