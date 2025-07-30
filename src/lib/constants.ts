export const APP_CONFIG = {
  name: 'Cat Food Store',
  description: 'Premium cat food and accessories for your feline friends',
  version: '1.0.0',
} as const;

export const API_ENDPOINTS = {
  products: '/api/products',
  testDb: '/api/test-db',
} as const;

export const ROUTES = {
  home: '/',
  products: '/products',
  admin: '/admin',
  profile: '/profile',
  about: '/about',
} as const;