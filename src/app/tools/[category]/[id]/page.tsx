import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft, Calendar, User, Tag, Loader2, Github, ExternalLink } from 'lucide-react';
import { loadTool, loadTools } from '@/lib/data';
import { ToolCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import { FileTree } from '@/components/FileTree';
import { FlexibleInstallation } from '@/components/FlexibleInstallation';

interface PageProps {
  params: Promise<{
    category: ToolCategory;
    id: string;
  }>;
}

// Server component for streaming file content
async function ToolFilesSection({ category, id }: { category: string; id: string }) {
  const tool = await loadTool(category, id);

  if (!tool) {
    return null;
  }

  return (
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
  );
}

// Loading fallback components
function FilesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Files</h2>
        <p className="text-sm text-muted-foreground">Toggle any file to view its contents.</p>
      </div>
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading files...</span>
        </div>
      </Card>
    </div>
  );
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { category, id } = await params;

  // OPTIMIZED: Only load metadata first for fast initial render
  const tools = await loadTools();
  const toolMetadata = tools.find((t) => t.category === category && t.id === id);

  if (!toolMetadata) {
    notFound();
  }

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
              <h1 className="text-3xl font-semibold tracking-tight">{toolMetadata.name}</h1>
              <p className="text-muted-foreground">{toolMetadata.description}</p>
            </div>
            {toolMetadata.featured && (
              <Badge variant="secondary" className="shrink-0">
                Featured
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{toolMetadata.author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated {new Date(toolMetadata.lastUpdated).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>v{toolMetadata.version}</span>
            </div>
            {toolMetadata.repository?.url && (
              <>
                <span>•</span>
                <Link
                  href={toolMetadata.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>Repository</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {toolMetadata.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {toolMetadata.category === 'mcp' ? (
          <div>
            <FlexibleInstallation tool={toolMetadata} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense fallback={<FilesLoadingSkeleton />}>
              <ToolFilesSection category={category} id={id} />
            </Suspense>

            <div className="lg:pl-4">
              <FlexibleInstallation tool={toolMetadata} />
            </div>
          </div>
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
// export async function generateStaticParams() {
//   const tools = await loadTools();
//   return tools
//     .filter((tool) => 
//       tool.marketplace.id !== 'third-party-plugins' && 
//       tool.marketplace.id !== 'non-plugin-registry'
//     )
//     .map((tool) => ({
//       category: tool.category,
//       id: tool.id,
//     }));
// }
