import crypto from 'crypto'

export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64')
}
