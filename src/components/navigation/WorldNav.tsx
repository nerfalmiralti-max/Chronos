'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, CalendarDays, Sun, Target, Timer } from 'lucide-react';

const worlds = [
  { href: '/today', label: 'Today', Icon: Sun },
  { href: '/goals', label: 'Goals', Icon: Target },
  { href: '/calendar', label: 'Plan', Icon: CalendarDays },
  { href: '/analytics', label: 'Analytics', Icon: BarChart3 },
  { href: '/timer', label: 'Focus', Icon: Timer },
];

type WorldNavProps = {
  home?: boolean;
  focus?: boolean;
};

export function WorldNav({ home = false, focus = false }: WorldNavProps) {
  const pathname = usePathname();
  const destination = home || focus ? '/today' : '/';
  const destinationLabel = focus ? 'Back to Today' : home ? 'Open Today' : 'Overview';
  const destinationCursor = focus ? 'Back' : home ? 'Today' : 'Overview';

  return (
    <header className="world-nav-wrap">
      <nav className={`world-nav${focus ? ' world-nav-focus' : ''}`} aria-label={focus ? 'Focus navigation' : 'Primary navigation'}>
        <Link className="wordmark" href="/" data-cursor="Home" aria-label="KRONOS home">
          <span className="wordmark-mark" aria-hidden="true" />
          <span className="wordmark-label">KRONOS</span>
        </Link>
        {focus ? (
          null
        ) : home ? (
          <div className="chapter-nav" aria-label="Experience chapters">
            <a href="#scale" data-cursor="How it works">How it works</a>
            <a href="#matter" data-cursor="Tasks">Tasks</a>
            <a href="#focus" data-cursor="Focus">Focus</a>
          </div>
        ) : (
          <div className="chapter-nav product-links">
            {worlds.map(({ href, label, Icon }) => (
              <Link className="product-link" key={href} href={href} aria-current={pathname === href ? 'page' : undefined} data-cursor={label}>
                <Icon size={14} strokeWidth={1.6} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
        <Link className={`nav-entry${home ? '' : ' nav-entry-secondary'}`} href={destination} data-cursor={destinationCursor}>
          <span className="nav-entry-label">{destinationLabel}</span>
          <span aria-hidden="true">{focus ? '←' : '↗'}</span>
        </Link>
      </nav>
    </header>
  );
}
