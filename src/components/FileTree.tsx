'use client';

import { ChevronDown, ChevronRight, File as FileIcon, Folder as FolderIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CopyButton } from '@/components/CopyButton';
import { useState } from 'react';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    content?: string;
}

interface FileTreeProps {
    files: Record<string, string>;
}

export function FileTree({ files }: FileTreeProps) {
    // Build tree structure
    const buildTree = (files: Record<string, string>): FileNode[] => {
        const root: FileNode[] = [];
        const map: Record<string, FileNode> = {};

        Object.entries(files).forEach(([path, content]) => {
            const parts = path.split('/');
            let currentPath = '';

            parts.forEach((part, index) => {
                const isFile = index === parts.length - 1;
                const parentPath = currentPath;
                currentPath = currentPath ? `${currentPath}/${part}` : part;

                if (!map[currentPath]) {
                    const node: FileNode = {
                        name: part,
                        path: currentPath,
                        type: isFile ? 'file' : 'directory',
                        children: isFile ? undefined : [],
                        content: isFile ? content : undefined,
                    };
                    map[currentPath] = node;

                    if (index === 0) {
                        root.push(node);
                    } else {
                        const parent = map[parentPath];
                        if (parent && parent.children) {
                            parent.children.push(node);
                        }
                    }
                }
            });
        });

        // Sort: directories first, then files
        const sortNodes = (nodes: FileNode[]) => {
            nodes.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'directory' ? -1 : 1;
            });
            nodes.forEach(node => {
                if (node.children) sortNodes(node.children);
            });
        };

        sortNodes(root);
        return root;
    };

    const tree = buildTree(files);

    const FileNodeComponent = ({ node, level }: { node: FileNode; level: number }) => {
        const [isOpen, setIsOpen] = useState(false);

        if (node.type === 'directory') {
            return (
                <div className="select-none">
                    <div
                        className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/50 rounded cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                        style={{ paddingLeft: `${level * 12 + 8}px` }}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                        ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                        )}
                        <FolderIcon className="h-4 w-4 shrink-0 text-blue-500/70" />
                        <span className="font-medium">{node.name}</span>
                    </div>
                    {isOpen && (
                        <div>
                            {node.children?.map((child) => (
                                <FileNodeComponent key={child.path} node={child} level={level + 1} />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-2">
                <details className="group">
                    <summary
                        className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/50 rounded cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none"
                        style={{ paddingLeft: `${level * 12 + 24}px` }}
                    >
                        <FileIcon className="h-4 w-4 shrink-0" />
                        <span>{node.name}</span>
                    </summary>
                    <div className="pl-4 pr-2 py-2">
                        <Card className="relative">
                            <div className="absolute right-4 top-3 z-10">
                                <CopyButton content={node.content || ''} label="Copy" />
                            </div>
                            <pre className="p-4 bg-muted rounded overflow-x-auto text-xs font-mono leading-relaxed">
                                {node.content}
                            </pre>
                        </Card>
                    </div>
                </details>
            </div>
        );
    };

    return (
        <div className="border rounded-lg p-2 space-y-1 bg-card">
            {tree.map((node) => (
                <FileNodeComponent key={node.path} node={node} level={0} />
            ))}
        </div>
    );
}
