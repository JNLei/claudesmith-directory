'use client';

import { blogPosts } from '@/lib/blog-data';
import Header from '@/components/Header';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category, exclude current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen">
      <Header />

      {/* Header Section */}
      <article>
        <header className="relative">
          {/* Subtle Gradient Background */}
          <div
            className="h-48 relative overflow-hidden"
            style={{ background: post.coverGradient }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
          </div>

          <div className="relative -mt-24 px-6 pb-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Category & Reading Time */}
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                  {post.category.replace('-', ' ')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {post.readingTime} min read
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-base text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>

              {/* Author & Date */}
              <div className="flex items-center justify-between text-sm pt-4 border-t">
                <div>
                  <div className="font-medium">{post.author.name}</div>
                  <div className="text-muted-foreground">{post.author.role}</div>
                </div>
                <time className="text-muted-foreground">
                  {new Date(post.publishedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: post.content.split('\n').map(line => {
                  // Simple markdown-to-HTML conversion
                  if (line.startsWith('# ')) {
                    return `<h1 class="text-2xl font-semibold mb-4 mt-8">${line.slice(2)}</h1>`;
                  }
                  if (line.startsWith('## ')) {
                    return `<h2 class="text-xl font-semibold mb-3 mt-6">${line.slice(3)}</h2>`;
                  }
                  if (line.startsWith('### ')) {
                    return `<h3 class="text-lg font-semibold mb-2 mt-5">${line.slice(4)}</h3>`;
                  }
                  if (line.startsWith('- ')) {
                    return `<li class="ml-6 mb-2 text-muted-foreground">${line.slice(2)}</li>`;
                  }
                  if (line.match(/^\d+\. /)) {
                    const text = line.replace(/^\d+\. /, '');
                    return `<li class="ml-6 mb-2 text-muted-foreground">${text}</li>`;
                  }
                  if (line.startsWith('`') && line.endsWith('`')) {
                    return `<p class="my-3"><code class="px-2 py-1 bg-secondary text-sm rounded">${line.slice(1, -1)}</code></p>`;
                  }
                  if (line.trim() === '') {
                    return '<br />';
                  }
                  return `<p class="mb-4 leading-relaxed text-muted-foreground">${line}</p>`;
                }).join('')
              }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 px-6 border-t">
            <div className="max-w-5xl mx-auto space-y-6">
              <h2 className="text-xl font-semibold">Related Posts</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <article className="border rounded-lg overflow-hidden h-full flex flex-col hover:border-foreground/20 transition-all">
                      {/* Gradient Header */}
                      <div
                        className="h-24 relative overflow-hidden"
                        style={{ background: relatedPost.coverGradient }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                        <div className="absolute bottom-2 left-3">
                          <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-background/60">
                            {relatedPost.category.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-base font-semibold mb-3 group-hover:text-muted-foreground transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t">
                          <span>{relatedPost.readingTime} min read</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

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
