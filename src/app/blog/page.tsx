'use client';

import { blogPosts } from '@/lib/blog-data';
import { BlogCategory } from '@/lib/types';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Blog
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Real-world guides, technical deep dives, and stories from developers building with Claude Code.
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search posts by title, author, or tags..."
            fullWidth={true}
          />
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-4 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {(['all', 'tutorials', 'insights', 'case-studies', 'announcements'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                {category === 'all' ? 'All' : category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts Section */}
      <section className="py-8 px-6 pb-24">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {selectedCategory === 'all' ? 'All Posts' : selectedCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredPosts.length}
              </span>
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <article className="border rounded-lg overflow-hidden h-full flex flex-col hover:border-foreground/20 transition-all">
                    {/* Gradient Header */}
                    <div
                      className="h-32 relative overflow-hidden"
                      style={{ background: post.coverGradient }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                      <div className="absolute bottom-3 left-4">
                        <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-background/60">
                          {post.category.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      {/* Title */}
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-muted-foreground transition-colors">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                        <span className="font-medium">{post.author.name}</span>
                        <div className="flex items-center gap-2">
                          <span>{post.readingTime} min read</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                No posts found
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 ClaudeSmith Directory. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Tools
              </Link>
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <a
                href="https://github.com/JNLei/claude-tools.git"
                className="hover:text-foreground transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
