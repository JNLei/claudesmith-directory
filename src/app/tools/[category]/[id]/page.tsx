import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Github, ExternalLink, Calendar, User, Tag, ChevronDown } from 'lucide-react';
import { loadTools } from '@/lib/data';
import { ToolCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CopyButton } from '@/components/CopyButton';
import Header from '@/components/Header';
import { FileTree } from '@/components/FileTree';
import { FlexibleInstallation } from '@/components/FlexibleInstallation';

interface PageProps {
  params: Promise<{
    category: ToolCategory;
    id: string;
  }>;
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { category, id } = await params;

  // Load tools and find the requested tool
  const tools = await loadTools();
  const tool = tools.find((t) => t.category === category && t.id === id);

  if (!tool) {
    notFound();
  }

  const renderCollapsibleFileCard = (fileName: string | undefined, content: string) => (
    <Card key={fileName} className="relative">
      <details className="group">
        <summary className="flex items-center justify-between gap-3 cursor-pointer px-6 py-4 pr-28">
          <h3 className="text-lg font-medium">{fileName || 'File'}</h3>
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-6 pb-6 space-y-3">
          <pre className="p-4 bg-muted rounded overflow-x-auto text-xs font-mono leading-relaxed">
            {content}
          </pre>
        </div>
      </details>
      <div className="absolute right-4 top-3">
        <CopyButton content={content} label="Copy" />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">{tool.name}</h1>
              <p className="text-muted-foreground">{tool.description}</p>
            </div>
            {tool.featured && (
              <Badge variant="secondary" className="shrink-0">
                Featured
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{tool.author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated {new Date(tool.lastUpdated).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>v{tool.version}</span>
            </div>
            {tool.repository?.url && (
              <>
                <span>•</span>
                <Link
                  href={tool.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {tool.category === 'mcp' || tool.installation.isNonPlugin ? (
          <div>
            <FlexibleInstallation tool={tool} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Files</h2>
                <p className="text-sm text-muted-foreground">Toggle any file to view its contents.</p>
              </div>

              {(() => {
                const allFiles = { ...tool.content.additional };
                if (tool.files?.main) {
                  allFiles[tool.files.main] = tool.content.main;
                }

                return (
                  <div className="space-y-6">
                    <FileTree files={allFiles} />
                  </div>
                );
              })()}
            </div>

            <div className="lg:pl-4">
              <FlexibleInstallation tool={tool} />
            </div>
          </div>
        )}

        {/* Repository Stats */}
        {tool.repository && (tool.repository.stars !== undefined || tool.repository.forks !== undefined) && (
          <Card className="mb-6 mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Repository Info</h2>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 text-sm">
                {tool.repository.stars !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Stars:</span>{' '}
                    <span className="font-medium">{tool.repository.stars}</span>
                  </div>
                )}
                {tool.repository.forks !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Forks:</span>{' '}
                    <span className="font-medium">{tool.repository.forks}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-6 mt-12">
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
    </div>
  );
}

// Generate static params for all tools except third-party and non-plugin (fetched dynamically)
export async function generateStaticParams() {
  const tools = await loadTools();
  return tools
    .filter((tool) => 
      tool.marketplace.id !== 'third-party-plugins' && 
      tool.marketplace.id !== 'non-plugin-registry'
    )
    .map((tool) => ({
      category: tool.category,
      id: tool.id,
    }));
}
