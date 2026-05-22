export function phoneDigitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}
