"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex items-center m-auto bg-background border-t mt-20 w-full">
      <div className="p-6 md:p-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and description */}
          <div className="space-y-4">
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
            <p className="text-muted-foreground text-sm">
              Your ultimate productivity companion. Organize, prioritize, and
              conquer your tasks with ease.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" asChild>
                <Link href="https://github.com" target="_blank">
                  <FaGithub className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://twitter.com" target="_blank">
                  <FaTwitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://linkedin.com" target="_blank">
                  <FaLinkedin className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} DailyTik. All rights reserved.
          </p>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
