"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  Sun,
  Moon,
  Menu,
  X,
  Home,
  ListTodo,
  StickyNote,
  Info,
} from "lucide-react";
import Image from "next/image";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "All Todos", href: "/alltodos", icon: ListTodo },
  { name: "Notes", href: "/notes/new", icon: StickyNote },
  { name: "All Notes", href: "/allnotes", icon: StickyNote },
  { name: "About", href: "/about", icon: Info },
];

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/50 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              alt="DailyTik Logo"
              className="rounded w-10 h-10"
            />
            <span className="text-2xl font-bold">DailyTik</span>
          </Link>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={handleLinkClick}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:inline-flex"
          >
            {theme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </Button>
          <div className="flex items-center md:hidden">
            <button onClick={toggleMenu} className="focus:outline-none">
              {menuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute left-0 w-full border-y bg-background p-4 md:hidden z-50">
          <div className="space-y-4">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Button
                  key={link.name}
                  variant="outline"
                  size="lg"
                  className="border-primary/20"
                  asChild
                >
                  <Link
                    href={link.href}
                    className="flex w-full items-center justify-start gap-2"
                    onClick={handleLinkClick}
                  >
                    <IconComponent className="h-5 w-5" />
                    {link.name}
                  </Link>
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="lg"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center justify-start gap-2 border-primary/20"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
