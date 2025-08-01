/**
 * Format number to Indonesian Rupiah currency format
 * @param amount - The amount to format
 * @returns Formatted string like "Rp. 24.000,-"
 */
export function formatRupiah(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'Rp. 0,-';
  }
  
  // Format with Indonesian locale (periods for thousands, commas for decimals)
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
  
  return `Rp. ${formatted},-`;
}