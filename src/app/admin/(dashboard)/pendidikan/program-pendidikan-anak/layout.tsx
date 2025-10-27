'use client'
import LayoutTabs from "./_lib/layoutTabs"


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutTabs>
      {children}
    </LayoutTabs>
  )
}