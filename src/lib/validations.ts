export function validateProduct(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
    errors.push('Valid price is required');
  }

  // Add price range validation
  if (data.price && parseFloat(data.price) > 999999.99) {
    errors.push('Price cannot exceed $999,999.99');
  }

  if (data.name && data.name.length > 255) {
    errors.push('Product name must be less than 255 characters');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

