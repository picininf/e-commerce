// Recebe "visita" e "clique" da vitrine e soma nos contadores.
// Não guarda IP nem nada pessoal: o visitante é um número aleatório criado no
// navegador, e ele entra num contador HyperLogLog (que só sabe contar, não listar).
import { redis, configurado, hoje } from './_redis.js'

const ID = /^[a-z0-9]{8,40}$/i
const TTL_DIA = 60 * 60 * 24 * 120 // contadores diários somem depois de 120 dias

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!configurado) return res.status(204).end()

  let corpo = req.body
  if (typeof corpo === 'string') {
    try { corpo = JSON.parse(corpo) } catch { corpo = null }
  }
  const tipo = corpo && corpo.tipo
  const visitante = corpo && String(corpo.v || '')
  if (!ID.test(visitante) || (tipo !== 'visita' && tipo !== 'clique')) return res.status(400).end()
  if (/bot|crawl|spider|preview|facebookexternalhit|whatsapp/i.test(req.headers['user-agent'] || '')) {
    return res.status(204).end()
  }

  const dia = 'dia:' + hoje()
  const cmds = []
  if (tipo === 'visita') {
    cmds.push(['INCR', 'visitas'], ['PFADD', 'pessoas', visitante])
    cmds.push(['HINCRBY', dia, 'visitas', 1], ['PFADD', dia + ':pessoas', visitante])
    cmds.push(['EXPIRE', dia + ':pessoas', TTL_DIA])
  } else {
    const link = String(corpo.link || '')
    if (!/^https:\/\/\S{1,300}$/.test(link)) return res.status(400).end()
    cmds.push(['INCR', 'cliques'], ['PFADD', 'pessoas-que-clicaram', visitante])
    cmds.push(['HINCRBY', 'cliques-por-link', link, 1])
    cmds.push(['HINCRBY', dia, 'cliques', 1])
  }
  cmds.push(['EXPIRE', dia, TTL_DIA])

  try {
    await redis(cmds)
    res.status(204).end()
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}
