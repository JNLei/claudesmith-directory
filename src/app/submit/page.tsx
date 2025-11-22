'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitPlugin, submitTool } from '@/lib/actions/submission-actions';

export default function SubmitPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'plugin' | 'tool'>('plugin');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Plugin Form State
    const [pluginForm, setPluginForm] = useState({
        name: '',
        repo: '',
        branch: 'main',
        author: '',
        description: '',
        category: 'skills',
        tags: '',
    });

    // Tool Form State
    const [toolForm, setToolForm] = useState({
        id: '',
        name: '',
        category: 'commands',
        description: '',
        author: '',
        version: '1.0.0',
        tags: '',
        repoUrl: '',
        repoOwner: '',
        repoName: '',
        repoBranch: 'main',
        installCommand: '',
        includeFiles: 'README.md, .claude/**/*',
        excludeFiles: '.git/**',
    });

    const handlePluginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            const result = await submitPlugin({
                name: pluginForm.name,
                source: {
                    source: 'github',
                    repo: pluginForm.repo,
                    branch: pluginForm.branch,
                },
                author: {
                    name: pluginForm.author,
                },
                description: pluginForm.description,
                category: pluginForm.category,
                tags: pluginForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
            });

            if (result.success) {
                setStatus({ type: 'success', message: 'Plugin submitted successfully!' });
                // Reset form
                setPluginForm({
                    name: '',
                    repo: '',
                    branch: 'main',
                    author: '',
                    description: '',
                    category: 'skills',
                    tags: '',
                });
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to submit plugin' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToolSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            const result = await submitTool({
                id: toolForm.id,
                name: toolForm.name,
                category: toolForm.category,
                description: toolForm.description,
                author: toolForm.author,
                version: toolForm.version,
                tags: toolForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
                repository: {
                    type: 'github',
                    url: toolForm.repoUrl,
                    owner: toolForm.repoOwner,
                    repo: toolForm.repoName,
                    branch: toolForm.repoBranch,
                },
                installation: {
                    steps: [
                        {
                            content: toolForm.installCommand,
                        },
                    ],
                },
                files: {
                    include: toolForm.includeFiles.split(',').map((f) => f.trim()).filter(Boolean),
                    exclude: toolForm.excludeFiles.split(',').map((f) => f.trim()).filter(Boolean),
                },
            });

            if (result.success) {
                setStatus({ type: 'success', message: 'Tool submitted successfully!' });
                // Reset form
                setToolForm({
                    id: '',
                    name: '',
                    category: 'commands',
                    description: '',
                    author: '',
                    version: '1.0.0',
                    tags: '',
                    repoUrl: '',
                    repoOwner: '',
                    repoName: '',
                    repoBranch: 'main',
                    installCommand: '',
                    includeFiles: 'README.md, .claude/**/*',
                    excludeFiles: '.git/**',
                });
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to submit tool' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Submit New Item</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-border">
                    <button
                        onClick={() => setActiveTab('plugin')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'plugin'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Plugin
                    </button>
                    <button
                        onClick={() => setActiveTab('tool')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'tool'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Non-Plugin Tool
                    </button>
                </div>

                {status && (
                    <div
                        className={`p-4 mb-6 rounded-md ${status.type === 'success'
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}
                    >
                        {status.message}
                    </div>
                )}

                {activeTab === 'plugin' ? (
                    <form onSubmit={handlePluginSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={pluginForm.name}
                                    onChange={(e) => setPluginForm({ ...pluginForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="my-plugin"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Author</label>
                                <input
                                    type="text"
                                    required
                                    value={pluginForm.author}
                                    onChange={(e) => setPluginForm({ ...pluginForm, author: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">GitHub Repo (owner/repo)</label>
                                <input
                                    type="text"
                                    required
                                    value={pluginForm.repo}
                                    onChange={(e) => setPluginForm({ ...pluginForm, repo: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="owner/repo"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Branch</label>
                                <input
                                    type="text"
                                    value={pluginForm.branch}
                                    onChange={(e) => setPluginForm({ ...pluginForm, branch: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="main"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                required
                                value={pluginForm.description}
                                onChange={(e) => setPluginForm({ ...pluginForm, description: e.target.value })}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                                placeholder="What does this plugin do?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    value={pluginForm.category}
                                    onChange={(e) => setPluginForm({ ...pluginForm, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="skills">Skills</option>
                                    <option value="agents">Agents</option>
                                    <option value="commands">Commands</option>
                                    <option value="plugin">Plugin</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={pluginForm.tags}
                                    onChange={(e) => setPluginForm({ ...pluginForm, tags: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="react, typescript, utility"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Plugin'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleToolSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ID</label>
                                <input
                                    type="text"
                                    required
                                    value={toolForm.id}
                                    onChange={(e) => setToolForm({ ...toolForm, id: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="tool-id"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={toolForm.name}
                                    onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Tool Name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Author</label>
                                <input
                                    type="text"
                                    required
                                    value={toolForm.author}
                                    onChange={(e) => setToolForm({ ...toolForm, author: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Author Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Version</label>
                                <input
                                    type="text"
                                    value={toolForm.version}
                                    onChange={(e) => setToolForm({ ...toolForm, version: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="1.0.0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                required
                                value={toolForm.description}
                                onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                                placeholder="Tool description"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    value={toolForm.category}
                                    onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="skills">Skills</option>
                                    <option value="agents">Agents</option>
                                    <option value="commands">Commands</option>
                                    <option value="plugins">Plugins</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={toolForm.tags}
                                    onChange={(e) => setToolForm({ ...toolForm, tags: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="tag1, tag2"
                                />
                            </div>
                        </div>

                        <div className="border-t border-border pt-6 mt-6">
                            <h3 className="text-lg font-semibold mb-4">Repository Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Repo URL</label>
                                    <input
                                        type="text"
                                        required
                                        value={toolForm.repoUrl}
                                        onChange={(e) => setToolForm({ ...toolForm, repoUrl: e.target.value })}
                                        className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Branch</label>
                                    <input
                                        type="text"
                                        value={toolForm.repoBranch}
                                        onChange={(e) => setToolForm({ ...toolForm, repoBranch: e.target.value })}
                                        className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="main"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Owner</label>
                                    <input
                                        type="text"
                                        required
                                        value={toolForm.repoOwner}
                                        onChange={(e) => setToolForm({ ...toolForm, repoOwner: e.target.value })}
                                        className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="owner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Repo Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={toolForm.repoName}
                                        onChange={(e) => setToolForm({ ...toolForm, repoName: e.target.value })}
                                        className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="repo-name"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Installation Command</label>
                            <textarea
                                required
                                value={toolForm.installCommand}
                                onChange={(e) => setToolForm({ ...toolForm, installCommand: e.target.value })}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] font-mono text-sm"
                                placeholder="npm install ..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Include Files (glob)</label>
                                <input
                                    type="text"
                                    value={toolForm.includeFiles}
                                    onChange={(e) => setToolForm({ ...toolForm, includeFiles: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Exclude Files (glob)</label>
                                <input
                                    type="text"
                                    value={toolForm.excludeFiles}
                                    onChange={(e) => setToolForm({ ...toolForm, excludeFiles: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Tool'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
