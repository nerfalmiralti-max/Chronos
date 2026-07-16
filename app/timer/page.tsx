import type { Metadata } from 'next';
import { ProductWorld } from '@/components/product/ProductWorld';

export const metadata: Metadata = { title: 'Focus' };

export default function TimerPage() {
  return <ProductWorld mode="timer" />;
}
