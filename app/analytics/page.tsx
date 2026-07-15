import type { Metadata } from 'next';
import { ProductWorld } from '@/components/product/ProductWorld';

export const metadata: Metadata = { title: 'Memory Field' };

export default function AnalyticsPage() {
  return <ProductWorld mode="analytics" />;
}
