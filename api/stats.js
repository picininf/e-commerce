// Números do painel. Só responde com a senha certa (variável PAINEL_SENHA na Vercel).
import { timingSafeEqual, createHash } from 'node:crypto'
import { redis, configurado, hoje } from './_redis.js'

const DIAS = 14

function senhaCerta(enviada) {
  const certa = process.env.PAINEL_SENHA || ''
  if (!certa) return false
  const a = createHash('sha256').update(String(enviada || '')).digest()
  const b = createHash('sha256').update(certa).digest()
  return timingSafeEqual(a, b)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!process.env.PAINEL_SENHA) return res.status(503).json({ erro: 'sem-senha' })
  if (!senhaCerta(req.headers['x-senha'])) return res.status(401).json({ erro: 'senha' })
  if (!configurado) return res.status(503).json({ erro: 'sem-banco' })

  const dias = []
  for (let i = DIAS - 1; i >= 0; i--) dias.push(hoje(new Date(Date.now() - i * 864e5)))

  const cmds = [
    ['GET', 'visitas'],
    ['PFCOUNT', 'pessoas'],
    ['GET', 'cliques'],
    ['PFCOUNT', 'pessoas-que-clicaram'],
    ['HGETALL', 'cliques-por-link'],
  ]
  for (const d of dias) cmds.push(['HMGET', 'dia:' + d, 'visitas', 'cliques'], ['PFCOUNT', 'dia:' + d + ':pessoas'])

  try {
    const r = await redis(cmds)
    const porLink = {}
    const lista = r[4] || []
    for (let i = 0; i < lista.length; i += 2) porLink[lista[i]] = Number(lista[i + 1])
    const porDia = dias.map((d, i) => {
      const [visitas, cliques] = r[5 + i * 2] || []
      return { dia: d, visitas: Number(visitas || 0), cliques: Number(cliques || 0), pessoas: Number(r[6 + i * 2] || 0) }
    })
    res.status(200).json({
      visitas: Number(r[0] || 0),
      pessoas: Number(r[1] || 0),
      cliques: Number(r[2] || 0),
      pessoasQueClicaram: Number(r[3] || 0),
      porLink,
      porDia,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: 'banco' })
  }
}
