import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { WalletProvider } from '../components/WalletProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Solana Token Creator',
  description: 'Create SPL tokens on Solana blockchain with custom parameters and vanity addresses',
  keywords: 'solana, spl, token, creator, blockchain, crypto, nft',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 min-h-screen`}>
        <WalletProvider>
          <main className="w-full min-h-screen">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  )
}
