export const dynamic = 'force-dynamic'

export async function GET() {
  const key = process.env.RESEND_API_KEY ?? ''
  const length = key.length
  const first5 = key.slice(0, 5)
  const last5 = key.slice(-5)

  return Response.json({ first5, last5, length })
}
