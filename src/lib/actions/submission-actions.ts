'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

// Define types for the submission data
// These should match the structure in the JSON files

interface PluginSubmission {
    name: string;
    source: {
        source: 'github';
        repo: string;
        branch?: string;
    } | {
        path: string;
    };
    author: {
        name: string;
    };
    description: string;
    category: string;
    tags: string[];
}

interface ToolSubmission {
    id: string;
    name: string;
    category: string;
    description: string;
    author: string;
    version: string;
    tags: string[];
    repository: {
        type: 'github';
        url: string;
        owner: string;
        repo: string;
        branch: string;
    };
    installation: {
        steps: { content: string }[];
    };
    files: {
        include: string[];
        exclude: string[];
    };
}

export async function submitPlugin(data: PluginSubmission) {
    try {
        const filePath = path.join(process.cwd(), 'third-party/.claude-plugin/marketplace.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const marketplace = JSON.parse(fileContent);

        // Check if plugin already exists
        const exists = marketplace.plugins.some((p: any) => p.name === data.name);
        if (exists) {
            return { success: false, error: 'Plugin with this name already exists' };
        }

        // Add new plugin
        marketplace.plugins.push(data);

        // Write back to file
        await fs.writeFile(filePath, JSON.stringify(marketplace, null, 4));

        // Revalidate pages
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Failed to submit plugin:', error);
        return { success: false, error: 'Failed to save plugin' };
    }
}

export async function submitTool(data: ToolSubmission) {
    try {
        const filePath = path.join(process.cwd(), 'src/data/tools-registry.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const registry = JSON.parse(fileContent);

        // Check if tool already exists
        const exists = registry.tools.some((t: any) => t.id === data.id);
        if (exists) {
            return { success: false, error: 'Tool with this ID already exists' };
        }

        // Add timestamps
        const toolWithMeta = {
            ...data,
            lastUpdated: new Date().toISOString()
        };

        // Add new tool
        registry.tools.push(toolWithMeta);

        // Write back to file
        await fs.writeFile(filePath, JSON.stringify(registry, null, 2));

        // Revalidate pages
        try {
            revalidatePath('/');
        } catch (e) {
            console.warn('Revalidation failed (expected in test environment):', e);
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to submit tool:', error);
        return { success: false, error: 'Failed to save tool' };
    }
}
