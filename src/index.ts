import { MalgaTokenization } from './tokenization'

// Unica classe publica do fork (branding Blu). Herda integralmente a logica do
// upstream (@malga/tokenization) via heranca — nenhuma reescrita. O nome
// MalgaTokenization NAO e exposto na API publica.
export class BluTokenization extends MalgaTokenization {}
