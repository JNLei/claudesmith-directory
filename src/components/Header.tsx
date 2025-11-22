'use client';

import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isToolsPage = pathname === '/';
  const isBlogPage = pathname.startsWith('/blog');

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
              aria-hidden="true"
            >
              <path d="m18 16 4-4-4-4"></path>
              <path d="m6 8-4 4 4 4"></path>
              <path d="m14.5 4-5 16"></path>
            </svg>
            <span className="text-lg font-semibold">Claude Smith</span>
          </a>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <a
              href="/"
              className={`text-sm font-medium transition-colors ${isToolsPage
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Tools
            </a>
            <a
              href="/blog"
              className={`text-sm font-medium transition-colors ${isBlogPage
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Blog
            </a>
            <a
              href="/submit"
              className={`text-sm font-medium transition-colors ${pathname === '/submit'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Submit
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
