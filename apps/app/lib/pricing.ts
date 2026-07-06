export function calcPricing(count: number) {
  const pricePerApp = count >= 3 ? 6 : 7
  return { pricePerApp, total: count * pricePerApp }
}
