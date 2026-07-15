import type { Metadata } from 'next';
import { ProductWorld } from '@/components/product/ProductWorld';

export const metadata: Metadata = { title: 'Long Arc' };

export default function GoalsPage() {
  return <ProductWorld mode="goals" />;
}
