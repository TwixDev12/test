'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MapPin, Hammer, Heart, BookOpen, Menu, Skull } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    { name: 'Carte', href: '/carte', icon: MapPin },
    { name: 'Crafting', href: '/crafting', icon: Hammer },
    { name: 'Médical', href: '/medical', icon: Heart },
    { name: 'Survie', href: '/survie', icon: BookOpen },
  ]

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => mobile && setOpen(false)}
          >
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'gap-2',
                mobile && 'w-full justify-start text-lg',
                isActive && 'bg-primary text-primary-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Button>
          </Link>
        )
      })}
    </>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Skull className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold hidden sm:inline">DayZ Wiki</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 mb-4">
                  <Skull className="w-6 h-6 text-primary" />
                  <span className="text-lg font-bold">DayZ Wiki</span>
                </Link>
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}