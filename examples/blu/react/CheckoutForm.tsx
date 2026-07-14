import { useEffect, useRef, useState } from 'react'
import { BluTokenization } from '@useblu/checkout-tokenization'

// Envie o tokenId + dados da cobranca para a sua API de cobranca.
async function criarCobranca(tokenId: string) {
  await fetch('https://<endpoint-da-api-de-cobranca>/<rota-de-cobranca>', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_uuid: '<identificador-do-lojista>',
      charge: {
        amount: 15000,
        order_id: 'pedido-123',
        statement_descriptor: 'LOJA XYZ',
        description: 'Pedido 123',
        payment_method: { payment_type: 'credit', installments: 3 },
        payment_source: { source_type: 'token', token_id: tokenId },
      },
    }),
  })
}

export function CheckoutForm() {
  const tokenizationRef = useRef<BluTokenization | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const tokenization = new BluTokenization({
      apiKey: '<API_KEY_DO_MERCHANT>',
      clientId: '<CLIENT_ID_DO_MERCHANT>',
      options: {
        config: {
          fields: {
            cardNumber: { container: 'card-number', placeholder: '9999 9999 9999 9999' },
            cardHolderName: { container: 'card-holder-name', placeholder: 'Nome impresso' },
            cardExpirationDate: { container: 'card-expiration-date', placeholder: 'MM/AA' },
            cardCvv: { container: 'card-cvv', placeholder: '999' },
          },
        },
        sandbox: true,
      },
    })

    tokenization.on('validity', (data) => console.log('validity', data))
    tokenization.on('cardTypeChanged', (data) => console.log('bandeira', data))

    tokenizationRef.current = tokenization
  }, [])

  async function handlePay() {
    setStatus('Tokenizando...')

    const { tokenId, error } = await tokenizationRef.current!.tokenize()

    if (error) {
      setStatus(`Erro (${error.type}): ${error.message}`)
      return
    }

    await criarCobranca(tokenId)
    setStatus('Cobranca enviada.')
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Campos seguros (iframes) montados pelo SDK nestes containers. */}
      <div id="card-number" />
      <div id="card-holder-name" />
      <div id="card-expiration-date" />
      <div id="card-cvv" />

      <button type="button" onClick={handlePay}>
        Pagar
      </button>
      <p>{status}</p>
    </form>
  )
}
