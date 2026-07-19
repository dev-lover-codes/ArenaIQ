export function generateNonce(): string {
  return Buffer.from(globalThis.crypto.randomUUID()).toString('base64')
}
