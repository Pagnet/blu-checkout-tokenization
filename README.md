<div align="center">
  <h1>Blu Checkout Tokenization SDK</h1>
</div>

SDK de **tokenizacao de cartoes** da Blu para checkout ecommerce. Os dados
sensiveis do cartao transitam **exclusivamente** entre iframes seguros e a
Malga — o SDK, o lojista e a camada de Integracao **nunca** acessam dados de
cartao, apenas o `tokenId` (conformidade PCI DSS).

> Fork de [`@malga/tokenization`](https://github.com/plughacker/malga-tokenization)
> (MIT). A logica de tokenizacao e herdada do upstream; este fork adiciona
> branding, CI/CD, exemplos e documentacao Blu.

## Instalacao

```bash
npm install @useblu/checkout-tokenization
# ou
pnpm add @useblu/checkout-tokenization
# ou
yarn add @useblu/checkout-tokenization
```

## Getting Started

1. Adicione no seu formulario os containers para cada campo do cartao:

```html
<form onsubmit="handleGetTokenId(event)">
  <div id="card-number"></div>
  <div id="card-holder-name"></div>
  <div id="card-cvv"></div>
  <div id="card-expiration-date"></div>
  <button type="submit">Pagar</button>
</form>
```

2. Configure o SDK com as credenciais do merchant e chame `tokenize()`:

```ts
import { BluTokenization } from '@useblu/checkout-tokenization'

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
      styles: {
        input: { color: '#000', 'font-size': '16px' },
      },
      preventAutofill: false,
    },
    sandbox: true,
  },
})

// Eventos disponiveis
tokenization.on('cardTypeChanged', (event) => console.log('bandeira', event))
tokenization.on('validity', (event) => console.log('validity', event))
tokenization.on('focus', (event) => console.log('focus', event))
tokenization.on('blur', (event) => console.log('blur', event))

async function handleGetTokenId(event) {
  event.preventDefault()

  const { tokenId } = await tokenization.tokenize()

  // Envie o tokenId + dados da cobranca para a Integracao (n8n) — ver abaixo.
  await enviarParaIntegracao(tokenId)
}
```

> As credenciais (`apiKey` / `clientId`) sao **por merchant**, todas sob a conta
> guarda-chuva da Blu na Malga.

## Fluxo completo (Blu)

O `tokenId` **nao** vai direto ao `ms-checkout-gateway`. Ele e enviado aos
endpoints publicos da **Integracao (n8n)**, no mesmo padrao de link de pagamento
e QRCode Pix. A Integracao mapeia o payload publico para o contrato interno
(`CreateChargeContract`) e chama o microsservico.

```ts
// ⚠️ rota/contrato/auth do parceiro a definir — dono: Squad Integrations (OQ-07).
async function enviarParaIntegracao(tokenId) {
  await fetch('https://<endpoint-publico-de-integracao-blu>/<rota-checkout>', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_uuid: '<identificador-do-lojista>',
      charge: {
        amount: 15000, // inteiro em centavos
        order_id: 'pedido-123',
        statement_descriptor: 'LOJA XYZ',
        description: 'Pedido 123',
        payment_method: { payment_type: 'credit', installments: 3 },
        payment_source: { source_type: 'token', token_id: tokenId },
      },
    }),
  })
}
```

## API Reference

### `new BluTokenization(configurations)`

| Campo | Tipo | Descricao |
|---|---|---|
| `apiKey` | `string` | Chave de API do merchant |
| `clientId` | `string` | Identificador do merchant |
| `options.config.fields` | `object` | Config dos campos seguros (`cardNumber`, `cardHolderName`, `cardExpirationDate`, `cardCvv`) |
| `options.config.styles` | `object` | Estilos dos inputs |
| `options.config.preventAutofill` | `boolean` | Desabilita autofill |
| `options.sandbox` | `boolean` | Ambiente sandbox |

### `tokenize(): Promise<{ tokenId, error? }>`

Retorna `{ tokenId }` em caso de sucesso, ou `{ error }` em caso de falha
(`error.type`, `error.declinedCode` quando `card_declined`).

### `on(eventType, handler)`

Eventos: `validity`, `cardTypeChanged`, `focus`, `blur`.

## Tratamento de erros

```ts
const { tokenId, error } = await tokenization.tokenize()

if (error) {
  // error.type: 'api_error' | 'bad_request' | 'invalid_request_error' | 'card_declined'
  // error.declinedCode: 'insufficient_funds' | 'invalid_cvv' | 'expired_card' | ...
  console.error(error.type, error.message, error.declinedCode)
}
```

## Exemplos

- [`examples/blu/vanilla-js/`](./examples/blu/vanilla-js/) — HTML + JS puro (fluxo Blu via Integracao)
- [`examples/blu/react/`](./examples/blu/react/) — componente React (fluxo Blu via Integracao)
- [`examples/v1`](./examples/v1) e [`examples/v2`](./examples/v2) — exemplos herdados do upstream

## Seguranca (PCI DSS)

Os dados de cartao transitam **apenas** entre os iframes seguros e a Malga.
Nem o frontend do lojista, nem o SDK, nem a camada de Integracao tem acesso aos
dados sensiveis — somente ao `tokenId` resultante.

## Licenca

[MIT](./LICENSE). Fork de
[plughacker/malga-tokenization](https://github.com/plughacker/malga-tokenization),
com atribuicao mantida.
