import type { Metadata } from 'next';
import { ProductWorld } from '@/components/product/ProductWorld';

export const metadata: Metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return <ProductWorld mode="analytics" />;
}
