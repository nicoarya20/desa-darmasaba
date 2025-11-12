'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the components with SSR disabled to prevent hydration issues
const LayoutTabs = dynamic(
  () => import('./(dashboard)/landing-page/profil/_lib/layoutTabs'),
  { ssr: false }
);

const ProgramInovasi = dynamic(
  () => import('./(dashboard)/landing-page/profil/program-inovasi/page'),
  { ssr: false }
);

export default function Page() {
  const [mounted, setMounted] = useState(false);

  // This ensures the component is only rendered on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or return a loading state
  }

  return (
    <div suppressHydrationWarning>
      <LayoutTabs>
        <ProgramInovasi />
      </LayoutTabs>
    </div>
  )
}