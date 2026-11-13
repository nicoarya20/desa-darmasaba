import type { Metadata } from 'next';
import pkg from '../../../package.json';
import { DevConsoleShell } from './_com/DevConsoleShell';

export const metadata: Metadata = {
  title: 'Developer Console',
  robots: { index: false, follow: false },
};

/** Konsol developer (/dev/*), terpisah dari layout admin. Guard: proxy + DevConsoleShell + API. */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <DevConsoleShell version={pkg.version} nodeEnv={process.env.NODE_ENV ?? 'development'}>
      {children}
    </DevConsoleShell>
  );
}
