import type { Metadata } from 'next';
import { ProductWorld } from '@/components/product/ProductWorld';

export const metadata: Metadata = { title: 'Goals' };

export default function GoalsPage() {
  return <ProductWorld mode="goals" />;
}
