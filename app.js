// Monta a grade a partir de produtos.js. Não precisa mexer aqui.
(function () {
  var cfg = window.VITRINE || {}
  var produtos = window.PRODUTOS || []
  var reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  if (cfg.nome) {
    document.getElementById('marca').textContent = cfg.nome
    document.title = cfg.nome
  }
  document.getElementById('frase').textContent = cfg.frase || ''

  function el(tag, cls, texto) {
    var e = document.createElement(tag)
    if (cls) e.className = cls
    if (texto != null) e.textContent = texto
    return e
  }

  var grade = document.getElementById('grade')
  produtos.forEach(function (p, i) {
    var li = el('li', 'card')
    li.style.animationDelay = Math.min(i, 12) * 60 + 'ms'

    var a = el('a', 'card-link')
    a.href = p.link
    a.target = '_blank'
    a.rel = 'noopener sponsored'
    a.setAttribute('aria-label', p.nome + (p.loja ? ' (abre na ' + p.loja + ')' : ' (abre a loja)'))

    var foto = el('div', 'foto')
    var img = el('img')
    img.src = p.imagem
    img.alt = p.nome
    img.loading = i < 4 ? 'eager' : 'lazy'
    foto.appendChild(img)
    if (p.imagem2) {
      var img2 = el('img', 'foto-2')
      img2.src = p.imagem2
      img2.alt = ''
      img2.loading = 'lazy'
      foto.appendChild(img2)
    }
    if (p.selo) foto.appendChild(el('span', 'selo', p.selo))
    a.appendChild(foto)

    var info = el('div', 'info')
    if (p.loja) info.appendChild(el('span', 'loja', p.loja))
    info.appendChild(el('h2', 'nome', p.nome))
    var preco = reais.format(p.preco)
    if (p.precoAte && p.precoAte !== p.preco) preco += ' – ' + reais.format(p.precoAte)
    info.appendChild(el('p', 'preco', preco))
    info.appendChild(el('span', 'botao', 'Ver oferta →'))
    a.appendChild(info)

    li.appendChild(a)
    grade.appendChild(li)
  })

  document.getElementById('vazio').hidden = produtos.length > 0
})()
