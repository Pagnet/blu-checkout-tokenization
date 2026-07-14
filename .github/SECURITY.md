# Reporting security issues

`@useblu/checkout-tokenization` powers the card tokenization step of Blu's
ecommerce checkout. By design, sensitive card data **never transits through this
SDK** — it flows only between the secure Malga hosted fields (iframes) and Malga,
in accordance with PCI DSS. Even so, we take any security issue in this project
extremely seriously.

Whether you are a security expert or not, if you detect a vulnerability in our
code, please bring it to our attention right away!

## Reporting a vulnerability

Please **DO NOT** file a public issue; instead, send your report privately to
seguranca@useblu.com.br.

If the issue is a weakness that cannot be immediately exploited, or something
that hasn't been released yet, feel free to publicly talk about it, if possible,
in a GitHub issue.

## What to pay special attention to

- **Card data / PCI:** sensitive card data must be handled exclusively by the
  Malga hosted fields. If you believe this SDK exposes card data to the merchant
  page, to the SDK itself, or to any other layer, treat it as a critical report
  and use the private channel above.
- **Credentials & tokens:** the SDK returns only an opaque `tokenId`. Report any
  leak of merchant credentials (`apiKey` / `clientId`) or tokens.
- **Supply chain:** this package is a fork of
  [`@malga/tokenization`](https://github.com/plughacker/malga-tokenization);
  report anything suspicious introduced through the upstream sync process.
