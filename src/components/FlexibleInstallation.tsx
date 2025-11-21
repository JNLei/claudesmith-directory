'use client';

import { ToolWithContent } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CopyButton } from '@/components/CopyButton';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FlexibleInstallationProps {
  tool: ToolWithContent;
}

export function FlexibleInstallation({ tool }: FlexibleInstallationProps) {
  // Check if it's a plugin or non-plugin tool
  const isNonPlugin = tool.installation.isNonPlugin;
  
  if (isNonPlugin) {
    return <NonPluginInstallation tool={tool} />;
  }
  
  return <PluginInstallation tool={tool} />;
}

function NonPluginInstallation({ tool }: { tool: ToolWithContent }) {
  const { installation } = tool;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Installation</h2>
      
      {installation.prerequisites && installation.prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Prerequisites</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {installation.prerequisites.map((step, idx) => (
              <InstallationStep 
                key={idx} 
                step={step} 
                index={idx + 1}
                showStepNumber={installation.prerequisites!.length > 1}
              />
            ))}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">
            {installation.steps && installation.steps.length === 1 
              ? 'Installation' 
              : 'Installation Steps'}
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {installation.steps?.map((step, idx) => (
            <InstallationStep 
              key={idx} 
              step={step} 
              index={idx + 1}
              showStepNumber={installation.steps!.length > 1}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface InstallationStepProps {
  step: { content: string; file?: string };
  index: number;
  showStepNumber: boolean;
}

function InstallationStep({ step, index, showStepNumber }: InstallationStepProps) {
  return (
    <div className="relative">
      {showStepNumber && (
        <div className="absolute -left-10 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium ring-4 ring-card text-muted-foreground">
          {index}
        </div>
      )}
      <div className="space-y-3">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeContent = String(children).replace(/\n$/, '');
                
                if (!inline && match) {
                  return (
                    <div className="relative group">
                      <div className="absolute right-2 top-2 z-10">
                        <CopyButton content={codeContent} label="Copy" />
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !mt-0"
                        {...props}
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                
                return (
                  <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {step.content}
          </ReactMarkdown>
        </div>
        
        {step.file && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Related file: {step.file}</p>
            {/* File would be displayed here if needed */}
          </div>
        )}
      </div>
    </div>
  );
}

function PluginInstallation({ tool }: { tool: ToolWithContent }) {
  // Marketplace-based plugin installation (existing implementation)
  const projectSettingsJson = JSON.stringify(
    {
      marketplaces: [
        tool.marketplace.id === 'claudesmith-general' 
          ? "https://github.com/JNLei/claude-tools.git"
          : tool.marketplace.id === 'anthropic-skills'
          ? "https://github.com/anthropics/anthropic-skills.git"
          : "https://github.com/JNLei/third-party-claude-plugins.git"
      ],
      plugins: [
        `${tool.id}@${tool.marketplace.id}`
      ]
    },
    null,
    2
  );

  // Determine marketplace identifier for commands
  const marketplaceIdentifier = 
    tool.marketplace.id === 'claudesmith-general' ? 'JNLei/claude-tools' :
    tool.marketplace.id === 'anthropic-skills' ? 'anthropics/anthropic-skills' :
    'JNLei/third-party-claude-plugins';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Installation</h2>
      </div>

      {/* Project Level (Priority) */}
      <Card>
        <details className="group" open>
          <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-muted/50 transition-colors rounded-t-lg select-none">
            <h3 className="text-lg font-medium">Project Level (Recommended)</h3>
            <svg className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <CardContent className="p-6 pt-2">
            <div className="relative pl-8 border-l border-border ml-3 space-y-8 py-2">
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium ring-4 ring-card text-muted-foreground">1</span>
                <div className="space-y-3">
                  <p className="text-sm font-medium leading-none text-foreground">Create the .claude directory at your project root</p>
                  <div className="flex items-center gap-2 group/code">
                    <code className="flex-1 px-4 py-3 bg-muted/50 rounded-lg text-sm font-mono border border-border/50 text-foreground/90">mkdir -p .claude</code>
                    <CopyButton content="mkdir -p .claude" label="Copy" />
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span className="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium ring-4 ring-card text-muted-foreground">2</span>
                <div className="space-y-3">
                  <p className="text-sm font-medium leading-none text-foreground">Create settings.json</p>
                  <div className="flex items-center gap-2 group/code">
                    <code className="flex-1 px-4 py-3 bg-muted/50 rounded-lg text-sm font-mono border border-border/50 text-foreground/90">touch .claude/settings.json</code>
                    <CopyButton content="touch .claude/settings.json" label="Copy" />
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span className="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium ring-4 ring-card text-muted-foreground">3</span>
                <div className="space-y-3">
                  <p className="text-sm font-medium leading-none text-foreground">Add to .claude/settings.json</p>
                  <div className="flex items-start gap-2 group/code">
                    <pre className="flex-1 p-4 bg-muted/50 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed border border-border/50 text-foreground/90">
                      {projectSettingsJson}
                    </pre>
                    <CopyButton content={projectSettingsJson} label="Copy" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </details>
      </Card>

      {/* Global Level */}
      <Card>
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-muted/50 transition-colors rounded-t-lg select-none">
            <h3 className="text-lg font-medium">Global Level</h3>
            <svg className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <CardContent className="p-6 pt-2">
            <div className="relative pl-8 border-l border-border ml-3 space-y-8 py-2">
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium ring-4 ring-card text-muted-foreground">1</span>
                <div className="space-y-3">
                  <p className="text-sm font-medium leading-none text-foreground">Open Claude</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span className="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium ring-4 ring-card text-muted-foreground">2</span>
                <div className="space-y-3">
                  <p className="text-sm font-medium leading-none text-foreground">Add or update marketplace</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 group/code">
                      <code className="flex-1 px-4 py-3 bg-muted/50 rounded-lg text-sm font-mono border border-border/50 text-foreground/90">/plugin marketplace add {marketplaceIdentifier}</code>
                      <CopyButton content={`/plugin marketplace add ${marketplaceIdentifier}`} label="Copy" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Or if already added:</span>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    <div className="flex items-center gap-2 group/code">
                      <code className="flex-1 px-4 py-3 bg-muted/50 rounded-lg text-sm font-mono border border-border/50 text-foreground/90">/plugin marketplace update {tool.marketplace.id}</code>
                      <CopyButton content={`/plugin marketplace update ${tool.marketplace.id}`} label="Copy" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span className="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium ring-4 ring-card text-muted-foreground">3</span>
                <div className="space-y-3">
                  <p className="text-sm font-medium leading-none text-foreground">Install plugin</p>
                  <div className="flex items-center gap-2 group/code">
                    <code className="flex-1 px-4 py-3 bg-muted/50 rounded-lg text-sm font-mono border border-border/50 text-foreground/90">{`/plugin install ${tool.id}@${tool.marketplace.id}`}</code>
                    <CopyButton content={`/plugin install ${tool.id}@${tool.marketplace.id}`} label="Copy" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </details>
      </Card>
    </div>
  );
}


