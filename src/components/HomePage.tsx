'use client';

import { useState, useMemo } from 'react';
import { ToolWithContent, ToolCategory } from '@/lib/types';
import ToolCard from '@/components/ToolCard';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';

interface HomePageProps {
  tools: ToolWithContent[];
}

export default function HomePage({ tools }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tools, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-8 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Discover and explore Claude Code tools
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse hooks, skills, agents, slash commands, MCP servers, and plugins you can copy and apply to your projects.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-6 px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>
      </section>

      {/* All Tools Section */}
      <section className="py-8 px-6 pb-24">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {selectedCategory === 'all' ? 'All Tools' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredTools.length}
              </span>
            </div>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                No tools found
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
              <a href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </a>
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
