import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cat Food Products | Cat Food Store',
  description: 'Browse our premium selection of cat food and accessories for your feline friends.',
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}