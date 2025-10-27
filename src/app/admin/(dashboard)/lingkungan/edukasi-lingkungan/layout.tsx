'use client'
import LayoutTabs from "./_lib/layouTabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutTabs>
      {children}
    </LayoutTabs>
  )
}