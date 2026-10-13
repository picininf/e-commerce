// Conversa com o banco Redis (Upstash) pela API REST, sem instalar nada.
// A Vercel cria estas variáveis quando você conecta o Upstash ao projeto.
const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

export const configurado = Boolean(URL && TOKEN)

// Executa vários comandos de uma vez e devolve os resultados na mesma ordem.
export async function redis(comandos) {
  const r = await fetch(URL + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(comandos),
  })
  if (!r.ok) throw new Error('Redis respondeu ' + r.status)
  const dados = await r.json()
  return dados.map((d) => {
    if (d.error) throw new Error(d.error)
    return d.result
  })
}

// Data no fuso de Brasília, formato AAAA-MM-DD.
export function hoje(data = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(data)
}
