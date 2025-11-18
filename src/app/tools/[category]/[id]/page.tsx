import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Github, ExternalLink, Calendar, User, Tag, ChevronDown } from 'lucide-react';
import { tools } from '@/lib/data';
import { ToolCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CopyButton } from '@/components/CopyButton';
import Header from '@/components/Header';

interface PageProps {
  params: Promise<{
    category: ToolCategory;
    id: string;
  }>;
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { category, id } = await params;

  // Find the tool
  const tool = tools.find((t) => t.category === category && t.id === id);

  if (!tool) {
    notFound();
  }

  const hookSettingsJsonExample = tool.hookConfig
    ? JSON.stringify(
        {
          hooks: {
            [tool.hookConfig.event]: [
              {
                ...(tool.hookConfig.matcher ? { matcher: tool.hookConfig.matcher } : {}),
                hooks: [
                  {
                    type: tool.hookConfig.type,
                    command: tool.hookConfig.command,
                  },
                ],
              },
            ],
          },
        },
        null,
        2,
      )
    : null;

  const targetDir = tool.category === 'agents'
    ? '.claude/agents'
    : tool.category === 'slash-commands'
      ? '.claude/commands'
      : tool.installation?.targetDir || `.claude/${category}/${id}`;

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

  const installationSection = tool.category === 'mcp'
    ? (
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Installation</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Run this command to add the MCP server:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
              {tool.installation?.instructions || 'claude mcp add <name> <command>'}
            </code>
            <CopyButton content={tool.installation?.instructions || ''} label="Copy" />
          </div>
        </CardContent>
      </Card>
    )
    : (
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Installation</h2>
        </div>

        {/* Step 1: Create Directory */}
        <Card className="relative">
          <details className="group" open>
            <summary className="flex items-center justify-between gap-3 cursor-pointer px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  1
                </div>
                <h3 className="text-sm font-medium">Create the directory</h3>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-6 space-y-3">
              <p className="text-sm text-muted-foreground">Create the target directory in your project:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">{targetDir}</code>
                <CopyButton content={targetDir} label="Copy" />
              </div>
            </div>
          </details>
        </Card>

        {/* Step 2: Copy Files */}
        <Card className="relative">
          <details className="group" open>
            <summary className="flex items-center justify-between gap-3 cursor-pointer px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  2
                </div>
                <h3 className="text-sm font-medium">Copy the files</h3>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-6 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Copy the main file content:
                </p>
                <CopyButton
                  content={tool.content.main}
                  label={`Copy ${tool.files?.main || 'file'}`}
                />
              </div>
              {tool.content.additional && Object.keys(tool.content.additional).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Also copy these additional files:
                  </p>
                  <div className="space-y-2">
                    {Object.entries(tool.content.additional).map(([fileName, content]) => (
                      <div key={fileName} className="flex items-center gap-2">
                        <code className="flex-1 px-2 py-1 bg-muted rounded text-xs font-mono">
                          {fileName}
                        </code>
                        <CopyButton content={content} label="Copy" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        </Card>

        {/* Step 3: Hook settings (hooks only) */}
        {tool.category === 'hooks' && hookSettingsJsonExample && (
          <Card className="relative">
            <details className="group" open>
              <summary className="flex items-center justify-between gap-3 cursor-pointer px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    3
                  </div>
                  <h3 className="text-sm font-medium">Update settings.json</h3>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add this to your <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">.claude/settings.json</code>{' '}
                  or <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">~/.claude/settings.json</code> using the values for this hook.
                </p>
                <div className="flex items-start gap-2">
                  <pre className="flex-1 p-4 bg-muted rounded overflow-x-auto text-xs font-mono">{hookSettingsJsonExample}</pre>
                  <CopyButton content={hookSettingsJsonExample} label="Copy" />
                </div>
              </div>
            </details>
          </Card>
        )}

        {/* Step 4 (or 3): Additional Setup (if present) */}
        {tool.installation?.instructions && (
          <Card className="relative">
            <details className="group" open>
              <summary className="flex items-center justify-between gap-3 cursor-pointer px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {tool.category === 'hooks' ? '4' : '3'}
                  </div>
                  <h3 className="text-sm font-medium">Additional setup</h3>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6">
                <p className="text-sm">{tool.installation?.instructions}</p>
              </div>
            </details>
          </Card>
        )}

      </div>
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
            <span>•</span>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>{tool.downloads?.toLocaleString() || 0}</span>
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

        {tool.category === 'mcp' ? (
          <div>{installationSection}</div>
        ) : tool.category === 'skills' || tool.category === 'hooks' || tool.category === 'agents' || tool.category === 'slash-commands' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Files</h2>
                <p className="text-sm text-muted-foreground">Toggle any file to view its contents.</p>
              </div>

              {renderCollapsibleFileCard(tool.files?.main, tool.content.main)}

              {tool.content.additional && Object.keys(tool.content.additional).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Additional files</h3>
                  {Object.entries(tool.content.additional).map(([fileName, content]) =>
                    renderCollapsibleFileCard(fileName, content)
                  )}
                </div>
              )}
            </div>

            <div className="lg:pl-4">
              {installationSection}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">{installationSection}</div>

            {/* Main Content */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">{tool.files?.main || 'File'}</h2>
                <CopyButton content={tool.content.main} label="Copy" />
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded overflow-x-auto text-xs font-mono leading-relaxed">
                  {tool.content.main}
                </pre>
              </CardContent>
            </Card>

            {/* Additional Files */}
            {tool.content.additional && Object.keys(tool.content.additional).length > 0 && (
              <div className="space-y-6 mb-6">
                <h2 className="text-xl font-semibold">Additional Files</h2>
                {Object.entries(tool.content.additional).map(([fileName, content]) => (
                  <Card key={fileName}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <h3 className="text-lg font-medium">{fileName}</h3>
                      <CopyButton content={content} label="Copy" />
                    </CardHeader>
                    <CardContent>
                      <pre className="p-4 bg-muted rounded overflow-x-auto text-xs font-mono leading-relaxed">
                        {content}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
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
              <a href="#" className="hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Generate static params for all tools
export async function generateStaticParams() {
  return tools.map((tool) => ({
    category: tool.category,
    id: tool.id,
  }));
}
