import './global.css'
import { RootProvider } from 'fumadocs-ui/provider'
import type { ReactNode } from 'react'

type TProps = {
  children: ReactNode
}

export default function RootLayout({ children }: TProps) {
  return (
    <html lang="en">
      <body>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}