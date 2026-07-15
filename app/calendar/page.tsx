import type { Metadata } from 'next';
import { ProductWorld } from '@/components/product/ProductWorld';

export const metadata: Metadata = { title: 'Constellation' };

export default function CalendarPage() {
  return <ProductWorld mode="calendar" />;
}
