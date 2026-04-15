import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DayZ Wiki - Guide Complet de Survie',
  description: 'Wiki interactif pour DayZ: cartes, crafting, soins médicaux, guide de survie',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}