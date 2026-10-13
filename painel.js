// Painel: pede a senha, busca os números em /api/stats e desenha.
(function () {
  var $ = function (id) { return document.getElementById(id) }
  var num = new Intl.NumberFormat('pt-BR')
  var CHAVE = 'painel-senha'
  var senha = ''
  try { senha = sessionStorage.getItem(CHAVE) || '' } catch (e) {}

  var nomes = {}
  ;(window.PRODUTOS || []).forEach(function (p) { nomes[p.link] = p.nome })

  function el(tag, cls, texto) {
    var e = document.createElement(tag)
    if (cls) e.className = cls
    if (texto != null) e.textContent = texto
    return e
  }

  function mostrarLogin(msg) {
    $('dados').hidden = true
    $('entrar').hidden = false
    $('aviso-senha').textContent = msg || ''
    $('senha').focus()
  }

  function avisar(msg) {
    $('aviso').textContent = msg
    $('aviso').hidden = false
  }

  function diaCurto(iso) {
    var p = iso.split('-')
    return p[2] + '/' + p[1]
  }

  function barras(alvo, dias, campo, unidade) {
    var box = $(alvo)
    box.textContent = ''
    var max = Math.max.apply(null, dias.map(function (d) { return d[campo] })) || 1
    dias.forEach(function (d) {
      var b = el('div', 'barra')
      b.tabIndex = 0
      var i = el('i')
      i.style.height = (d[campo] / max) * 100 + '%'
      b.appendChild(i)
      b.appendChild(el('span', 'dica', diaCurto(d.dia) + ': ' + num.format(d[campo]) + ' ' + unidade))
      b.setAttribute('aria-label', diaCurto(d.dia) + ', ' + d[campo] + ' ' + unidade)
      box.appendChild(b)
    })
    var eixo = box.nextElementSibling
    if (!eixo || eixo.className !== 'eixo') {
      eixo = el('div', 'eixo')
      box.after(eixo)
    }
    eixo.textContent = ''
    eixo.appendChild(el('span', null, diaCurto(dias[0].dia)))
    eixo.appendChild(el('span', null, 'hoje'))
  }

  function desenhar(d) {
    $('n-pessoas').textContent = num.format(d.pessoas)
    $('n-clicaram').textContent = num.format(d.pessoasQueClicaram)
    $('n-visitas').textContent = num.format(d.visitas)
    $('n-cliques').textContent = num.format(d.cliques)
    var taxa = d.pessoas ? Math.round((d.pessoasQueClicaram / d.pessoas) * 100) : 0
    $('taxa').innerHTML = ''
    $('taxa').append('De cada 100 pessoas que entram, ')
    $('taxa').appendChild(el('b', null, String(Math.min(taxa, 100))))
    $('taxa').append(' clicam em algum produto.')

    barras('g-pessoas', d.porDia, 'pessoas', 'pessoas')
    barras('g-cliques', d.porDia, 'cliques', 'cliques')

    var linhas = Object.keys(d.porLink).map(function (link) {
      return { nome: nomes[link] || link, cliques: d.porLink[link] }
    })
    ;(window.PRODUTOS || []).forEach(function (p) {
      if (!(p.link in d.porLink)) linhas.push({ nome: p.nome, cliques: 0 })
    })
    linhas.sort(function (a, b) { return b.cliques - a.cliques })
    var max = linhas.length ? linhas[0].cliques || 1 : 1
    var tb = $('t-produtos')
    tb.textContent = ''
    if (!linhas.length) {
      var tr0 = el('tr')
      var td0 = el('td', 'vazia', 'Nenhum clique ainda.')
      td0.colSpan = 2
      tr0.appendChild(td0)
      tb.appendChild(tr0)
    }
    linhas.forEach(function (l) {
      var tr = el('tr')
      var td = el('td')
      td.appendChild(el('div', null, l.nome))
      var trilho = el('div', 'trilho')
      var i = el('i')
      i.style.width = (l.cliques / max) * 100 + '%'
      trilho.appendChild(i)
      td.appendChild(trilho)
      tr.appendChild(td)
      tr.appendChild(el('td', 'num', num.format(l.cliques)))
      tb.appendChild(tr)
    })

    $('hora').textContent = 'às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    $('entrar').hidden = true
    $('aviso').hidden = true
    $('dados').hidden = false
  }

  function carregar() {
    if (!senha) return mostrarLogin()
    fetch('/api/stats', { headers: { 'x-senha': senha }, cache: 'no-store' })
      .then(function (r) {
        return r.json().catch(function () { return {} }).then(function (j) { return { status: r.status, j: j } })
      })
      .then(function (res) {
        if (res.status === 200) return desenhar(res.j)
        if (res.status === 401) {
          try { sessionStorage.removeItem(CHAVE) } catch (e) {}
          senha = ''
          return mostrarLogin('Senha incorreta.')
        }
        if (res.j.erro === 'sem-senha') return avisar('Falta criar a variável PAINEL_SENHA na Vercel (veja o LEIA-ME).')
        if (res.j.erro === 'sem-banco') return avisar('Falta conectar o banco Upstash na Vercel (veja o LEIA-ME).')
        avisar('Não consegui carregar os números agora. Tente de novo em instantes.')
      })
      .catch(function () { avisar('Sem conexão com o servidor. Tente de novo.') })
  }

  $('entrar').addEventListener('submit', function (e) {
    e.preventDefault()
    senha = $('senha').value
    try { sessionStorage.setItem(CHAVE, senha) } catch (err) {}
    carregar()
  })
  $('atualizar').addEventListener('click', carregar)
  $('sair').addEventListener('click', function () {
    try { sessionStorage.removeItem(CHAVE) } catch (e) {}
    senha = ''
    $('senha').value = ''
    mostrarLogin()
  })

  carregar()
})()
