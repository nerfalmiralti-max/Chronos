import type { Metadata } from 'next';
import { ProductWorld } from '@/components/product/ProductWorld';

export const metadata: Metadata = { title: 'Now Field' };

export default function TodayPage() {
  return <ProductWorld mode="today" />;
}
