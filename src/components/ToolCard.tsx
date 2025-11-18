'use client';

import Link from 'next/link';
import { Tool } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="group hover:border-foreground/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h3 className="font-semibold leading-none tracking-tight">
              {tool.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {tool.category}
              </Badge>
              <span className="text-xs text-muted-foreground">v{tool.version}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {tool.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 4).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs font-normal"
            >
              {tag}
            </Badge>
          ))}
          {tool.tags.length > 4 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{tool.tags.length - 4}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>
              {tool.downloads >= 1000
                ? `${(tool.downloads / 1000).toFixed(1)}k`
                : tool.downloads}
            </span>
          </div>
          <span>•</span>
          <span>{tool.author}</span>
          <span>•</span>
          <span>{new Date(tool.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/tools/${tool.category}/${tool.id}`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
