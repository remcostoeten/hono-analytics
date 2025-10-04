import { DocsLayout } from 'fumadocs-ui/layout'
import type { ReactNode } from 'react'
import { docs, meta } from '@/.source'

type TProps = {
  children: ReactNode
}

export default function RootDocsLayout({ children }: TProps) {
  return (
    <DocsLayout tree={docs} nav={{ title: 'Documentation' }}>
      {children}
    </DocsLayout>
  )
}