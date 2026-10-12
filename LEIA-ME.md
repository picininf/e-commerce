# Vitrine de achados

Site de uma página só com seus produtos de afiliado. Cada card abre o link de afiliado em uma nova aba.
Não precisa instalar nada: são arquivos simples (HTML, CSS e JS).

## Ver no computador

Dê dois cliques em `index.html`. Abre no navegador.

## Adicionar um produto

1. Coloque a foto do produto na pasta `img` (de preferência quadrada, JPG, uns 600x600).
2. Abra `produtos.js` no Bloco de Notas ou no VS Code.
3. Copie o bloco do produto que já existe (do `{` até o `},`), cole logo abaixo e troque:
   - `nome`: o título do produto
   - `preco`: o preço com ponto, ex. `29.9` (e `precoAte` se tiver faixa de preço; se não, apague a linha)
   - `imagem`: `img/nome-da-sua-foto.jpg` (ou cole o link https da foto)
   - `link`: seu link de afiliado
   - `loja` e `selo`: opcionais, pode apagar a linha
4. Salve e atualize a página no navegador.

Dica: se a página ficar vazia depois de editar, quase sempre faltou uma vírgula ou aspas em `produtos.js`.

Para trocar o nome e a frase do topo, edite `window.VITRINE` no começo de `produtos.js`.

## Publicar (grátis)

**Jeito mais fácil, Netlify Drop:**
1. Acesse https://app.netlify.com/drop e entre com e-mail.
2. Arraste a pasta `vitrine` inteira para a página.
3. Pronto, você recebe um link público. Para atualizar, arraste a pasta de novo em *Deploys* do mesmo site.

**Cloudflare Pages ou Vercel:** crie um projeto, escolha "upload direto" (ou envie a pasta para um repositório GitHub) e não configure nenhum comando de build; a pasta de saída é a própria `vitrine`.

**Domínio próprio:** em qualquer um deles dá para apontar um subdomínio, por exemplo `achados.fnnexora.shop`.

## Regras importantes

- O rodapé avisa que são links de afiliado. Mantenha esse aviso: as lojas e a lei de publicidade pedem.
- Use fotos do próprio anúncio do produto ou suas. Não coloque seu nome pessoal no site.
