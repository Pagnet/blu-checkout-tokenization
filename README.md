<h1 align="center">
  Blu Checkout Tokenization
</h1>

<p align="center">
  <a href="https://github.com/Pagnet/blu-checkout-tokenization/actions">
    <img alt="Actions Status" src="https://github.com/Pagnet/blu-checkout-tokenization/workflows/CI/badge.svg">
  </a>
  <a href="https://www.npmjs.com/package/@useblu/checkout-tokenization">
    <img alt="npm version" src="https://img.shields.io/npm/v/@useblu/checkout-tokenization">
  </a>
  <a href="https://github.com/Pagnet/blu-checkout-tokenization/blob/main/LICENSE">
    <img alt="GitHub License" src="https://img.shields.io/github/license/Pagnet/blu-checkout-tokenization">
  </a>
  <a href="https://github.com/Pagnet/blu-checkout-tokenization/graphs/commit-activity">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/Pagnet/blu-checkout-tokenization">
  </a>
  <a href="https://github.com/prettier/prettier">
    <img alt="Prettier code style" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg">
  </a>
  <a href="http://makeapullrequest.com">
    <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
  </a>
</p>

SDK de **tokenizacao de cartoes** da Blu para checkout ecommerce. Os dados
sensiveis do cartao transitam **exclusivamente** entre iframes seguros e a
Malga — o SDK, o lojista e a camada de Integracao **nunca** acessam dados de
cartao, apenas o `tokenId` (conformidade PCI DSS).

> Fork de [`@malga/tokenization`](https://github.com/plughacker/malga-tokenization)
> (MIT). A logica de tokenizacao e herdada do upstream; este fork adiciona
> branding, CI/CD, exemplos e documentacao Blu.

## Installation

```sh
npm install @useblu/checkout-tokenization
```

or

```sh
pnpm add @useblu/checkout-tokenization
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

## Ambientes

O ambiente e escolhido por `options` — nao ha URL a configurar:

| `options` | Ambiente Malga |
|---|---|
| `{ debug: true }` | dev (`hosted-fields.dev.malga.io`) |
| `{ sandbox: true }` | sandbox (`hosted-fields-sandbox.malga.io`) |
| `{}` ou `{ sandbox: false }` | **producao** (`hosted-fields.malga.io`) |

Para producao, use as credenciais de **producao** do merchant (sob a conta
guarda-chuva da Blu na Malga).

## Tratamento de erros

```ts
const { tokenId, error } = await tokenization.tokenize()

if (error) {
  // error.type: 'api_error' | 'bad_request' | 'invalid_request_error' | 'card_declined'
  // error.declinedCode: 'insufficient_funds' | 'invalid_cvv' | 'expired_card' | ...
  console.error(error.type, error.message, error.declinedCode)
}
```

## Examples

- [`examples/blu/vanilla-js/`](./examples/blu/vanilla-js/) — HTML + JS puro (fluxo Blu via Integracao)
- [`examples/blu/react/`](./examples/blu/react/) — componente React (fluxo Blu via Integracao)
- [`examples/v1`](./examples/v1) e [`examples/v2`](./examples/v2) — exemplos herdados do upstream

## Seguranca (PCI DSS)

Os dados de cartao transitam **apenas** entre os iframes seguros e a Malga.
Nem o frontend do lojista, nem o SDK, nem a camada de Integracao tem acesso aos
dados sensiveis — somente ao `tokenId` resultante.

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd
love to have you as part of this project! Read below to learn how you can take
part of it.

### Code of Conduct

We adopted a Code of Conduct that we expect project participants to adhere to.
Please read [the full text](.github/CODE_OF_CONDUCT.md) so that you can
understand what actions will and will not be tolerated.

### Contributing Guide

Read our [contributing guide](.github/CONTRIBUTING.md) to learn about our
development process, how to propose bugfixes and improvements, how we sync with
the upstream project, and how to build and test your changes.

### Security

Found a security issue? Please **do not** open a public issue — follow our
[security policy](.github/SECURITY.md) and report it privately to
seguranca@useblu.com.br.

## License

Licensed under the terms of the [MIT License](LICENSE). This project is a fork
of [plughacker/malga-tokenization](https://github.com/plughacker/malga-tokenization),
with attribution preserved.
