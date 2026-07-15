'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const worlds = [
  { href: '/today', label: 'Now' },
  { href: '/goals', label: 'Arc' },
  { href: '/calendar', label: 'Orbit' },
  { href: '/analytics', label: 'Memory' },
  { href: '/timer', label: 'Focus' },
];

export function WorldNav({ home = false }: { home?: boolean }) {
  const pathname = usePathname();
  return (
    <header className="world-nav-wrap">
      <nav className="world-nav" aria-label="Primary navigation">
        <Link className="wordmark" href="/" data-cursor="Origin" aria-label="KRONOS home">
          <span className="wordmark-mark" aria-hidden="true" />
          <span className="wordmark-label">KRONOS</span>
        </Link>
        {home ? (
          <div className="chapter-nav" aria-label="Experience chapters">
            <a href="#scale" data-cursor="Scale">Scale</a>
            <a href="#matter" data-cursor="Matter">Matter</a>
            <a href="#focus" data-cursor="Focus">Focus</a>
          </div>
        ) : (
          <div className="chapter-nav product-links">
            {worlds.map((world) => (
              <Link key={world.href} href={world.href} aria-current={pathname === world.href ? 'page' : undefined} data-cursor={world.label}>
                {world.label}
              </Link>
            ))}
          </div>
        )}
        <Link className="nav-entry" href={home ? '/today' : '/'} data-cursor={home ? 'Enter' : 'Return'}>
          <span className="nav-entry-label">{home ? 'Enter the field' : 'Genesis'}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  );
}
