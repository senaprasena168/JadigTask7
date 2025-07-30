export interface Product {
  id: string;
  name: string;
  price: string;
  image?: string;
}

// Shared products data
export let products: Product[] = [
  {
    id: '1',
    name: 'Professional Microphone',
    price: '$99.99',
  },
  {
    id: '2',
    name: 'Quality Roll Product',
    price: '$79.99',
  },
  {
    id: '3',
    name: 'Stylish Tail Product',
    price: '$149.99',
  },
];

export const getProducts = () => products;

export const addProduct = (product: Omit<Product, 'id'>) => {
  // Generate proper unique ID
  const maxId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) : 0;
  const newProduct = {
    id: String(maxId + 1),
    ...product
  };
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>) => {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    return products[index];
  }
  return null;
};

export const deleteProduct = (id: string) => {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    const deleted = products[index];
    products.splice(index, 1);
    return deleted;
  }
  return null;
};

export const getProductById = (id: string) => {
  return products.find(p => p.id === id) || null;
};
