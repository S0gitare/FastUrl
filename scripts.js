document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form-encurtador');
    const inputUrl = document.getElementById('input-url');
    const linkResultado = document.getElementById('link-resultado');
    const msgErro = document.getElementById('mensagem-erro');


    form.addEventListener('submit', async (evento) => {
        

        evento.preventDefault();


        linkResultado.href = '#';
        linkResultado.textContent = '';
        msgErro.textContent = '';


        const urlParaEncurtar = inputUrl.value;


        try {

            const response = await fetch('http://localhost:8000/encurtar', {
                method: 'POST',
                headers: {

                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    url_original: urlParaEncurtar 
                })
            });


            if (response.ok) {

                const data = await response.json();
                

                linkResultado.href = data.url_encurtada;
                linkResultado.textContent = data.url_encurtada;
            } else {

                msgErro.textContent = 'Erro ao encurtar o link. Tente novamente.';
            }

        } catch (error) {

            console.error('Erro de conexão:', error);
            msgErro.textContent = 'Não foi possível conectar ao servidor.';
        }
    });
});