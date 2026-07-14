# @useblu/checkout-tokenization

> Fork de [`@malga/tokenization`](https://github.com/plughacker/malga-tokenization).
> Cada sync com o upstream deve registrar aqui o que foi cherry-picked (secao 9 do SDD).

## 1.0.0 — Fork inicial (nao publicado)

### Delta sobre o upstream (@malga/tokenization v2.3.0)

- Identidade do pacote → `@useblu/checkout-tokenization`, branding e repositorio Blu.
- Exporta **apenas** `BluTokenization` (branding); `MalgaTokenization` nao e exposto na API publica.
- Workflows `ci.yml` e `publish.yml` (pnpm), com `publish --provenance`.
- Exemplos `examples/blu/{vanilla-js,react}` com o fluxo Blu (tokenizar → Integracao/n8n).
- README voltado ao lojista Blu; LICENSE MIT com atribuicao ao upstream.

---

# Historico do upstream (@malga/tokenization)

## 1.0.0

### Major Changes

- refactoring sdk to use hosted fields solution
